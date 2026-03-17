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

// --- Date utilities ---

const POLISH_MONTHS: Record<string, number> = {
  'stycznia': 0, 'lutego': 1, 'marca': 2, 'kwietnia': 3,
  'maja': 4, 'czerwca': 5, 'lipca': 6, 'sierpnia': 7,
  'września': 8, 'października': 9, 'listopada': 10, 'grudnia': 11,
};

function getWarsawDateOnly(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit',
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
  if (filter === 'today') { const d = toIsoDate(today); return { start: d, end: d }; }
  if (filter === 'tomorrow') { const d = toIsoDate(addDays(today, 1)); return { start: d, end: d }; }
  if (filter === 'next3days') return { start: toIsoDate(today), end: toIsoDate(addDays(today, 2)) };
  if (filter === 'thisweek') { const dow = today.getUTCDay(); return { start: toIsoDate(today), end: toIsoDate(addDays(today, 7 - dow)) }; }
  if (filter === 'nextweek') {
    const dow = today.getUTCDay();
    const s = addDays(today, 8 - dow);
    return { start: toIsoDate(s), end: toIsoDate(addDays(s, 6)) };
  }
  if (filter === 'thismonth') {
    return { start: toIsoDate(today), end: toIsoDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))) };
  }
  if (filter === 'nextmonth') {
    const s = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
    const e = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 2, 0));
    return { start: toIsoDate(s), end: toIsoDate(e) };
  }
  const d = toIsoDate(today);
  return { start: d, end: d };
}

function formatPolishDateFromIso(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'long' });
}

function buildDateDescription(filter: string): string {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtShort = (d: Date) => d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
  if (filter === 'today') return `today, ${fmt(now)}`;
  if (filter === 'tomorrow') { const t = new Date(now); t.setDate(t.getDate() + 1); return `tomorrow, ${fmt(t)}`; }
  if (filter === 'next3days') { const e = new Date(now); e.setDate(e.getDate() + 2); return `today (${fmtShort(now)}) through ${fmt(e)}`; }
  if (filter === 'thisweek') { const dow = now.getDay(); const e = new Date(now); e.setDate(now.getDate() + (7 - dow)); return `this week, from ${fmtShort(now)} through ${fmt(e)}`; }
  if (filter === 'nextweek') { const dow = now.getDay(); const s = new Date(now); s.setDate(now.getDate() + (8 - dow)); const e = new Date(s); e.setDate(s.getDate() + 6); return `next week, from ${fmtShort(s)} through ${fmt(e)}`; }
  if (filter === 'thismonth') { const e = new Date(now.getFullYear(), now.getMonth() + 1, 0); return `this month, from ${fmtShort(now)} through ${fmt(e)}`; }
  if (filter === 'nextmonth') { const s = new Date(now.getFullYear(), now.getMonth() + 1, 1); const e = new Date(now.getFullYear(), now.getMonth() + 2, 0); return `next month, from ${fmtShort(s)} through ${fmt(e)}`; }
  return `today, ${fmt(now)}`;
}

function decodeHtml(text: string): string {
  return text.replace(/&#038;|&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function getAttr(tag: string, attrName: string): string {
  const regex = new RegExp(`${attrName}="([^"]*)"`);
  return tag.match(regex)?.[1] || '';
}

// --- Source detection ---

function getSourceType(url: string): 'kinoteka' | 'muranow' | 'iluzjon' | 'generic' {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname === 'kinoteka.pl' || hostname.endsWith('.kinoteka.pl')) return 'kinoteka';
    if (hostname === 'kinomuranow.pl' || hostname.endsWith('.kinomuranow.pl')) return 'muranow';
    if (hostname.includes('iluzjon.fn.org.pl')) return 'iluzjon';
  } catch {}
  return 'generic';
}

async function fetchHtml(url: string): Promise<string | null> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; event-scraper/1.0)',
      'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
    },
  });
  if (!response.ok) {
    console.error(`Fetch failed for ${url}: ${response.status}`);
    return null;
  }
  return response.text();
}

// --- Kinoteka parser ---

function buildFilmPageMap(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const linkRegex = /<a\b[^>]*href="(https?:\/\/kinoteka\.pl\/film\/[^"]+)"[^>]*aria-label="([^"]*)"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(html)) !== null) {
    const url = m[1].replace(/\?.*$/, '');
    const label = decodeHtml(m[2]);
    if (label && !map.has(label)) map.set(label, url);
  }
  return map;
}

function parseKinotekaEventsFromHtml(html: string, sourceName: string, filter: string, afterTime?: string): ScrapedEvent[] {
  const { start, end } = getDateRangeForFilter(filter);
  const filmPages = buildFilmPageMap(html);
  const anchors = html.match(/<a\b[^>]*>/g) || [];
  const seen = new Set<string>();
  const events: ScrapedEvent[] = [];

  for (const tag of anchors) {
    if (!tag.includes('data-title="') || !tag.includes('data-day="') || !tag.includes('data-hour="')) continue;
    const title = decodeHtml(getAttr(tag, 'data-title'));
    const day = getAttr(tag, 'data-day');
    const time = getAttr(tag, 'data-hour');
    if (!title || !day || !time) continue;
    if (day < start || day > end) continue;
    if (afterTime && time < afterTime) continue;
    const filmPageUrl = filmPages.get(title);
    const sourceUrl = filmPageUrl || decodeHtml(getAttr(tag, 'data-reserve-link') || getAttr(tag, 'href'));
    const description = decodeHtml(getAttr(tag, 'data-description'));
    const dedupeKey = `${title}|${day}|${time}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    events.push({ title, time, venue: sourceName, date: formatPolishDateFromIso(day), description: description || undefined, sourceUrl: sourceUrl || undefined });
  }
  events.sort((a, b) => a.time.localeCompare(b.time));
  return events;
}

// --- Kino Muranów parser ---

function parseMuranowEventsFromHtml(html: string, sourceName: string, filter: string, afterTime?: string): ScrapedEvent[] {
  const { start, end } = getDateRangeForFilter(filter);
  const warsawDate = getWarsawDateOnly();
  const currentYear = warsawDate.getUTCFullYear();
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  // Find all day headers with positions: <span class="cell-date-header__day-num">17</span>...<span class="cell-date-header__day-month">marca</span>
  const dayHeaderRegex = /cell-date-header__day-num">(\d+)<\/span>.*?cell-date-header__day-month">(\w+)<\/span>/gs;
  const dayHeaders: { pos: number; isoDate: string }[] = [];
  let dh;
  while ((dh = dayHeaderRegex.exec(html)) !== null) {
    const dayNum = Number(dh[1]);
    const monthName = dh[2].toLowerCase();
    const monthNum = POLISH_MONTHS[monthName];
    if (monthNum === undefined) continue;
    const isoDate = `${currentYear}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    dayHeaders.push({ pos: dh.index, isoDate });
  }

  for (let i = 0; i < dayHeaders.length; i++) {
    const { pos, isoDate } = dayHeaders[i];
    if (isoDate < start || isoDate > end) continue;

    const nextPos = i + 1 < dayHeaders.length ? dayHeaders[i + 1].pos : html.length;
    const section = html.slice(pos, nextPos);

    // Find each event block: movie-calendar-info__date + movie-calendar-info__title + film link
    // Each event is in a <div class="movie-calendar-info"> block
    const blockRegex = /movie-calendar-info__date">(\d{2}:\d{2})<\/span>\s*<h5 class="movie-calendar-info__title">([^<]+)<\/h5>/g;
    let em;
    while ((em = blockRegex.exec(section)) !== null) {
      const time = em[1];
      const title = decodeHtml(em[2]);
      if (afterTime && time < afterTime) continue;

      const dedupeKey = `${title}|${isoDate}|${time}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      // Find film URL in the expand section after this match (within ~1500 chars)
      const afterBlock = section.slice(em.index, em.index + 1500);
      const filmUrlMatch = afterBlock.match(/href="(https:\/\/kinomuranow\.pl\/film\/[^"]+)"/);
      const sourceUrl = filmUrlMatch ? filmUrlMatch[1] : 'https://kinomuranow.pl/repertuar';

      events.push({
        title,
        time,
        venue: sourceName,
        date: formatPolishDateFromIso(isoDate),
        sourceUrl,
      });
    }
  }

  events.sort((a, b) => a.time.localeCompare(b.time));
  return events;
}

// --- Kino Iluzjon parser ---

function parseIluzjonEventsFromHtml(html: string, sourceName: string, filter: string, afterTime?: string): ScrapedEvent[] {
  const { start, end } = getDateRangeForFilter(filter);
  const warsawDate = getWarsawDateOnly();
  const currentYear = warsawDate.getUTCFullYear();
  const events: ScrapedEvent[] = [];

  // Split by day headers: <h3>17 Marca - Wtorek</h3>
  const parts = html.split(/<h3>(\d+)\s+(\w+)\s*-\s*\w+<\/h3>/i);
  // parts: [before, day1, month1, content1, day2, month2, content2, ...]

  for (let i = 1; i + 2 < parts.length; i += 3) {
    const dayNum = Number(parts[i]);
    const monthName = parts[i + 1].toLowerCase();
    const content = parts[i + 2];

    const monthNum = POLISH_MONTHS[monthName];
    if (monthNum === undefined) continue;

    const isoDate = `${currentYear}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    if (isoDate < start || isoDate > end) continue;

    // Events: <span class="hour"><a href="URL">HH:MM - Title</a></span>
    const eventRegex = /<span class="hour"><a href="([^"]+)">(\d{2}:\d{2})\s*-\s*([^<]+)<\/a><\/span>/g;
    let em;
    while ((em = eventRegex.exec(content)) !== null) {
      const rawUrl = em[1];
      const time = em[2];
      const title = decodeHtml(em[3]);
      if (afterTime && time < afterTime) continue;

      const sourceUrl = rawUrl.startsWith('http') ? rawUrl : `https://www.iluzjon.fn.org.pl${rawUrl}`;

      // Extract description from nearby info-add divs
      const afterEvent = content.slice(em.index, em.index + 2000);
      let description = '';
      const infoMatch = afterEvent.match(/alt="Informacje dodatkowe">\s*([^<]+)/);
      if (infoMatch) description = decodeHtml(infoMatch[1]);
      if (!description) {
        const kronika = afterEvent.match(/alt="Kronika">\s*([^<]+)/);
        if (kronika) description = decodeHtml(kronika[1]);
      }

      events.push({
        title,
        time,
        venue: sourceName,
        date: formatPolishDateFromIso(isoDate),
        description: description || undefined,
        sourceUrl,
      });
    }
  }

  events.sort((a, b) => a.time.localeCompare(b.time));
  return events;
}

// --- Direct scrape handler for deterministic sources ---

async function scrapeDirect(
  formattedUrl: string,
  sourceName: string,
  sourceType: 'kinoteka' | 'muranow' | 'iluzjon',
  filter: string,
  afterTime?: string
): Promise<ScrapedEvent[]> {
  console.log(`Scraping ${sourceType} directly: ${formattedUrl}`);
  const html = await fetchHtml(formattedUrl);
  if (!html) return [];

  let events: ScrapedEvent[];
  switch (sourceType) {
    case 'kinoteka':
      events = parseKinotekaEventsFromHtml(html, sourceName, filter, afterTime);
      break;
    case 'muranow':
      events = parseMuranowEventsFromHtml(html, sourceName, filter, afterTime);
      break;
    case 'iluzjon':
      events = parseIluzjonEventsFromHtml(html, sourceName, filter, afterTime);
      break;
  }

  console.log(`Found ${events.length} events from ${sourceName} (${sourceType} parser)`);
  return events;
}

// --- Main handler ---

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let formattedUrl = source.url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const sourceType = getSourceType(formattedUrl);

    // Deterministic parsers bypass cache entirely for freshest data
    if (sourceType !== 'generic') {
      const events = await scrapeDirect(formattedUrl, source.name, sourceType, filter, afterTime);
      return new Response(
        JSON.stringify({ success: true, data: events }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- Generic AI extraction (theaters, clubs, etc.) ---
    const cacheKey = promptHint || '';

    // Check cache
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
      if (afterTime) events = events.filter(e => e.time >= afterTime);
      return new Response(
        JSON.stringify({ success: true, data: events, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraping (AI): ${formattedUrl}`);
    const dateDescription = buildDateDescription(filter);
    const { start, end } = getDateRangeForFilter(filter);

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
                    description: { type: 'string', description: 'The actual plot synopsis or content description of the film/show/event — NOT the title or a label like "opis filmu". Write 1-3 sentences summarizing what the event is about, in Polish if the source is in Polish.' },
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
          prompt: `Extract ONLY events/shows/performances happening ${dateDescription} (ISO date range: ${start} to ${end}).${afterTime ? ` Only include events starting at or after ${afterTime}.` : ''}${promptHint ? ` IMPORTANT: ${promptHint}.` : ''}

CRITICAL RULES:
1. ONLY include events whose date on the page falls within the range ${start} to ${end}. Do NOT include events on other dates.
2. Read times EXACTLY as they appear on the page. NEVER guess or invent times.
3. Read dates EXACTLY as shown. If a show is listed for "19 marca" and the requested date is "17 marca", do NOT include it.
4. If a single show has MULTIPLE screening times (e.g. 14:30, 17:30, 20:30), create a SEPARATE entry for EACH time.
5. If no events match the date range, return an empty events array — do NOT make up events.
6. For each event extract the direct URL link to the specific event detail page (not the listing page).
7. Leave fields empty ("") rather than inventing data you don't see on the page.`,
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

    // Store in cache
    await supabase.from('scrape_cache').insert({
      source_url: formattedUrl,
      filter,
      prompt_hint: cacheKey,
      events,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }).then(({ error }) => {
      if (error) console.error('Cache write error:', error);
    });

    // Clean expired cache occasionally
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
