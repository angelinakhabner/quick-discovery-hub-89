import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SourceUrl {
  url: string;
  name: string;
}

interface ScrapedEvent {
  title: string;
  time: string;
  venue: string;
  date: string;
  description?: string;
  director?: string;
  cast?: string;
  duration?: string;
  genre?: string;
  sourceUrl?: string;
}

function buildDateDescription(filter: string): string {
  const now = new Date();
  if (filter === 'today') {
    return `today, ${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } else if (filter === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `tomorrow, ${tomorrow.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } else if (filter === 'next3days') {
    const day3 = new Date(now);
    day3.setDate(day3.getDate() + 2);
    return `today (${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}) through ${day3.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } else if (filter === 'thisweek') {
    const dayOfWeek = now.getDay();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - dayOfWeek));
    return `this week, from ${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} through ${endOfWeek.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } else if (filter === 'nextweek') {
    const dayOfWeek = now.getDay();
    const startNextWeek = new Date(now);
    startNextWeek.setDate(now.getDate() + (8 - dayOfWeek));
    const endNextWeek = new Date(startNextWeek);
    endNextWeek.setDate(startNextWeek.getDate() + 6);
    return `next week, from ${startNextWeek.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} through ${endNextWeek.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } else if (filter === 'thismonth') {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `this month, from ${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} through ${endOfMonth.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  } else if (filter === 'nextmonth') {
    const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return `next month, from ${startNextMonth.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} through ${endNextMonth.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
  return `today, ${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source, filter, afterTime, promptHint } = await req.json() as {
      source: SourceUrl;
      filter: string;
      afterTime?: string;
      promptHint?: string;
    };

    if (!source?.url || !filter) {
      return new Response(
        JSON.stringify({ success: false, error: 'source and filter are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client for cache
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let formattedUrl = source.url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const cacheKey = promptHint || '';

    // Check cache first
    const { data: cached } = await supabase
      .from('scrape_cache')
      .select('events')
      .eq('source_url', formattedUrl)
      .eq('filter', filter)
      .eq('prompt_hint', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .order('cached_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      console.log(`Cache hit for ${source.name}`);
      let events = cached.events as ScrapedEvent[];
      // Apply afterTime filter on cached results
      if (afterTime) {
        events = events.filter(e => e.time >= afterTime);
      }
      return new Response(
        JSON.stringify({ success: true, data: events, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraping: ${formattedUrl}`);
    const dateDescription = buildDateDescription(filter);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['extract'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              events: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    time: { type: 'string', description: 'Start time in HH:MM format' },
                    date: { type: 'string', description: 'Date in format like "10 marca" (Polish locale)' },
                    link: { type: 'string', description: 'The absolute URL to this specific event/film/show detail page (not the main listing page). Must start with http:// or https://.' },
                    description: { type: 'string', description: 'The actual plot synopsis or content description of the film/show/event — NOT the title or a label like "opis filmu". Write 1-3 sentences summarizing what the event is about.' },
                    director: { type: 'string' },
                    cast: { type: 'string' },
                    duration: { type: 'string', description: 'Duration like "120 min"' },
                    genre: { type: 'string', description: 'Genre or category' },
                  },
                  required: ['title', 'time', 'date'],
                },
              },
            },
            required: ['events'],
          },
          prompt: `Extract all events/shows/performances happening ${dateDescription}.${afterTime ? ` Only include events starting at or after ${afterTime}.` : ''}${promptHint ? ` IMPORTANT: ${promptHint}.` : ''} Only include events within this date range. If no events match, return an empty array. For each event extract as much detail as possible.`,
        },
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Firecrawl error for ${formattedUrl}:`, data);
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jsonData = data?.data?.extract || data?.extract || data?.data?.json || data?.json;
    const events: ScrapedEvent[] = (jsonData?.events || []).map((evt: any) => ({
      title: evt.title || 'Untitled',
      time: evt.time || '—',
      venue: source.name,
      date: evt.date || '',
      description: evt.description,
      director: evt.director,
      cast: evt.cast,
      duration: evt.duration,
      genre: evt.genre,
      sourceUrl: evt.link || formattedUrl,
    }));

    console.log(`Found ${events.length} events from ${source.name}`);

    // Store in cache (without afterTime filter so cache is reusable)
    await supabase.from('scrape_cache').insert({
      source_url: formattedUrl,
      filter,
      prompt_hint: cacheKey,
      events,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }).then(({ error }) => {
      if (error) console.error('Cache write error:', error);
    });

    // Clean expired cache entries occasionally (1 in 10 chance)
    if (Math.random() < 0.1) {
      supabase.from('scrape_cache').delete().lt('expires_at', new Date().toISOString()).then(() => {});
    }

    return new Response(
      JSON.stringify({ success: true, data: events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape events';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
