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

function getWarsawDateOnly(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = Number(parts.find(p => p.type === 'year')?.value || '1970');
  const month = Number(parts.find(p => p.type === 'month')?.value || '01');
  const day = Number(parts.find(p => p.type === 'day')?.value || '01');

  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateRangeForFilter(filter: string): { start: string; end: string } {
  const today = getWarsawDateOnly();

  if (filter === 'today') {
    const day = toIsoDate(today);
    return { start: day, end: day };
  }

  if (filter === 'tomorrow') {
    const day = toIsoDate(addDays(today, 1));
    return { start: day, end: day };
  }

  if (filter === 'next3days') {
    return { start: toIsoDate(today), end: toIsoDate(addDays(today, 2)) };
  }

  if (filter === 'thisweek') {
    const dayOfWeek = today.getUTCDay();
    const endOfWeek = addDays(today, 7 - dayOfWeek);
    return { start: toIsoDate(today), end: toIsoDate(endOfWeek) };
  }

  if (filter === 'nextweek') {
    const dayOfWeek = today.getUTCDay();
    const startNextWeek = addDays(today, 8 - dayOfWeek);
    const endNextWeek = addDays(startNextWeek, 6);
    return { start: toIsoDate(startNextWeek), end: toIsoDate(endNextWeek) };
  }

  if (filter === 'thismonth') {
    const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
    return { start: toIsoDate(today), end: toIsoDate(endOfMonth) };
  }

  if (filter === 'nextmonth') {
    const startNextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
    const endNextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 2, 0));
    return { start: toIsoDate(startNextMonth), end: toIsoDate(endNextMonth) };
  }

  const day = toIsoDate(today);
  return { start: day, end: day };
}

function decodeHtml(text: string): string {
  return text
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function getAttr(tag: string, attrName: string): string {
  const regex = new RegExp(`${attrName}="([^"]*)"`);
  const match = tag.match(regex);
  return match?.[1] || '';
}

function formatPolishDateFromIso(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('pl-PL', {
    timeZone: 'Europe/Warsaw',
    day: 'numeric',
    month: 'long',
  });
}

function isKinotekaSource(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === 'kinoteka.pl' || hostname.endsWith('.kinoteka.pl');
  } catch {
    return false;
  }
}

function parseKinotekaEventsFromHtml(
  html: string,
  sourceName: string,
  filter: string,
  afterTime?: string
): ScrapedEvent[] {
  const { start, end } = getDateRangeForFilter(filter);
  const anchors = html.match(/<a\b[^>]*>/g) || [];
  const seen = new Set<string>();
  const events: ScrapedEvent[] = [];

  for (const tag of anchors) {
    if (!tag.includes('data-title="') || !tag.includes('data-day="') || !tag.includes('data-hour="')) {
      continue;
    }

    const title = decodeHtml(getAttr(tag, 'data-title'));
    const day = getAttr(tag, 'data-day');
    const time = getAttr(tag, 'data-hour');

    if (!title || !day || !time) continue;
    if (day < start || day > end) continue;
    if (afterTime && time < afterTime) continue;

    const sourceUrl = decodeHtml(getAttr(tag, 'data-reserve-link') || getAttr(tag, 'href'));
    const description = decodeHtml(getAttr(tag, 'data-description'));

    const dedupeKey = `${title}|${day}|${time}|${sourceUrl}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    events.push({
      title,
      time,
      venue: sourceName,
      date: formatPolishDateFromIso(day),
      description: description || undefined,
      sourceUrl: sourceUrl || undefined,
    });
  }

  events.sort((a, b) => a.time.localeCompare(b.time));
  return events;
}

async function scrapeKinotekaDirect(
  formattedUrl: string,
  sourceName: string,
  filter: string,
  afterTime?: string
): Promise<ScrapedEvent[]> {
  const response = await fetch(formattedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; event-scraper/1.0)',
      'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    console.error(`Kinoteka fetch failed: ${response.status}`);
    return [];
  }

  const html = await response.text();
  return parseKinotekaEventsFromHtml(html, sourceName, filter, afterTime);
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
          prompt: `Extract all events/shows/performances/screenings happening ${dateDescription}.${afterTime ? ` Only include events starting at or after ${afterTime}.` : ''}${promptHint ? ` IMPORTANT: ${promptHint}.` : ''} Only include events within this date range. If no events match, return an empty array. CRITICAL: Read the screening/show times EXACTLY as they appear on the page — do NOT guess or invent times. If a single film/show has MULTIPLE screening times (e.g. 14:30, 17:30, 20:30), create a SEPARATE entry for EACH screening time with the same title but different time values. For each event extract as much detail as possible, including the direct URL link to the specific event/film detail page (not the listing page).`,
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
