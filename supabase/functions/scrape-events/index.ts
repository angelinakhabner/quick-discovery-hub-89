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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sources, filter, afterTime, promptHint } = await req.json() as {
      sources: SourceUrl[];
      filter: 'today' | 'tomorrow' | 'next3days' | 'thisweek' | 'nextweek' | 'thismonth' | 'nextmonth';
      afterTime?: string;
      promptHint?: string;
    };

    if (!sources?.length || !filter) {
      return new Response(
        JSON.stringify({ success: false, error: 'sources and filter are required' }),
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

    // Build date range description for the AI prompt
    const now = new Date();
    let dateDescription: string;
    if (filter === 'today') {
      dateDescription = `today, ${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateDescription = `tomorrow, ${tomorrow.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else {
      const day3 = new Date(now);
      day3.setDate(day3.getDate() + 2);
      dateDescription = `today (${now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}) through ${day3.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }

    console.log(`Scraping ${sources.length} sources for filter: ${filter}`);

    // Scrape all sources in parallel
    const scrapePromises = sources.map(async (source) => {
      try {
        let formattedUrl = source.url.trim();
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
          formattedUrl = `https://${formattedUrl}`;
        }

        console.log(`Scraping: ${formattedUrl}`);

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
            waitFor: 5000,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Firecrawl error for ${formattedUrl}:`, data);
          return [];
        }

        // Extract events from response, adding venue and source info
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
          sourceUrl: formattedUrl,
        }));

        console.log(`Found ${events.length} events from ${source.name}`);
        return events;
      } catch (err) {
        console.error(`Error scraping ${source.name}:`, err);
        return [];
      }
    });

    const allResults = await Promise.all(scrapePromises);
    const events = allResults.flat().sort((a, b) => {
      // Sort by time
      const timeA = a.time.replace('—', '99:99');
      const timeB = b.time.replace('—', '99:99');
      return timeA.localeCompare(timeB);
    });

    console.log(`Total events found: ${events.length}`);

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
