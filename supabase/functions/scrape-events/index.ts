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

function isSpecificDetailPage(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    return pathname.length > 1 && !pathname.match(/^\/(repertuar|program|schedule|index)\/?$/i);
  } catch {
    return false;
  }
}

async function fetchDescriptionFromPage(url: string): Promise<string | undefined> {
  try {
    const html = await fetchHtml(url, 6000);
    if (!html) return undefined;
    const match =
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']{20,})["']/i) ||
      html.match(/<meta\s+content=["']([^"']{20,})["']\s+name=["']description["']/i) ||
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']{20,})["']/i) ||
      html.match(/<meta\s+content=["']([^"']{20,})["']\s+property=["']og:description["']/i);
    return match ? decodeHtml(match[1]).trim() : undefined;
  } catch {
    return undefined;
  }
}

async function enrichWithDescriptions(events: ScrapedEvent[]): Promise<ScrapedEvent[]> {
  const urlsToFetch = new Set<string>();
  for (const e of events) {
    if (!e.description && e.sourceUrl && isSpecificDetailPage(e.sourceUrl)) {
      urlsToFetch.add(e.sourceUrl);
    }
  }
  if (urlsToFetch.size === 0) return events;

  const descMap = new Map<string, string | undefined>();
  await Promise.all([...urlsToFetch].map(async url => {
    descMap.set(url, await fetchDescriptionFromPage(url));
  }));

  return events.map(e =>
    !e.description && e.sourceUrl && descMap.has(e.sourceUrl)
      ? { ...e, description: descMap.get(e.sourceUrl) }
      : e
  );
}

/** Fix commonly-saved old/short URLs to their actual repertuar pages. */
function normalizeSourceUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname;
    if ((host === 'kinoteka.pl' || host === 'www.kinoteka.pl') && !path.includes('repertuar')) {
      return 'https://kinoteka.pl/repertuar/';
    }
    if ((host === 'kinomuranow.pl' || host === 'www.kinomuranow.pl') && (path === '/' || path === '')) {
      return 'https://kinomuranow.pl/repertuar';
    }
    if (host.includes('iluzjon.fn.org.pl')) {
      return 'https://www.iluzjon.fn.org.pl/repertuar.html';
    }
    if ((host === 'jassmine.com' || host === 'www.jassmine.com') && (path === '/' || path === '')) {
      return 'https://jassmine.com/koncerty/';
    }
    if ((host === 'powszechny.com' || host === 'www.powszechny.com') && !path.includes('repertuar')) {
      return 'https://powszechny.com/pl/repertuar';
    }
    return url;
  } catch {
    return url;
  }
}

/** Append ?miesiac=YYYY-MM to Teatr Powszechny URLs based on the active filter. */
function addPowszechnyMonth(url: string, filter: string): string {
  try {
    const u = new URL(url);
    if (u.hostname !== 'powszechny.com' && u.hostname !== 'www.powszechny.com') return url;
    if (u.searchParams.has('miesiac')) return url;
    const today = getWarsawDateOnly();
    const target = filter === 'nextmonth'
      ? new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1))
      : today;
    u.searchParams.set('miesiac', `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}`);
    return u.toString();
  } catch {
    return url;
  }
}

function getSourceType(url: string): 'kinoteka' | 'muranow' | 'iluzjon' | 'generic' {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname === 'kinoteka.pl' || hostname.endsWith('.kinoteka.pl')) return 'kinoteka';
    if (hostname === 'kinomuranow.pl' || hostname.endsWith('.kinomuranow.pl')) return 'muranow';
    if (hostname.includes('iluzjon.fn.org.pl')) return 'iluzjon';
  } catch {}
  return 'generic';
}

/** Extract embedded JSON payload from Next.js SSR pages (<script id="__NEXT_DATA__">). */
function extractNextJsData(html: string): string | null {
  const m = html.match(/<script\s+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  return m ? m[1].trim() : null;
}

async function fetchHtml(url: string, timeoutMs: number = 20000): Promise<string | null> {
  const startedAt = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    const elapsed = Date.now() - startedAt;
    if (!response.ok) {
      console.error(`Fetch failed for ${url}: ${response.status} (${elapsed}ms)`);
      return null;
    }
    const text = await response.text();
    console.log(`Fetched ${url}: ${text.length} bytes in ${Date.now() - startedAt}ms`);
    return text;
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    console.error(`Fetch threw for ${url} after ${elapsed}ms (timeout=${timeoutMs}ms):`, err instanceof Error ? err.message : err);
    return null;
  }
}

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

function parseMuranowEventsFromHtml(html: string, sourceName: string, filter: string, afterTime?: string): ScrapedEvent[] {
  const { start, end } = getDateRangeForFilter(filter);
  const warsawDate = getWarsawDateOnly();
  const currentYear = warsawDate.getUTCFullYear();
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

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

    const blockRegex = /movie-calendar-info__date">(\d{2}:\d{2})<\/span>\s*<h5 class="movie-calendar-info__title">([^<]+)<\/h5>/g;
    let em;
    while ((em = blockRegex.exec(section)) !== null) {
      const time = em[1];
      const title = decodeHtml(em[2]);
      if (afterTime && time < afterTime) continue;

      const dedupeKey = `${title}|${isoDate}|${time}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

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

function parseIluzjonEventsFromHtml(html: string, sourceName: string, filter: string, afterTime?: string): ScrapedEvent[] {
  const { start, end } = getDateRangeForFilter(filter);
  const warsawDate = getWarsawDateOnly();
  const currentYear = warsawDate.getUTCFullYear();
  const events: ScrapedEvent[] = [];

  const parts = html.split(/<h3>(\d+)\s+(\w+)\s*-\s*\w+<\/h3>/i);

  for (let i = 1; i + 2 < parts.length; i += 3) {
    const dayNum = Number(parts[i]);
    const monthName = parts[i + 1].toLowerCase();
    const content = parts[i + 2];

    const monthNum = POLISH_MONTHS[monthName];
    if (monthNum === undefined) continue;

    const isoDate = `${currentYear}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    if (isoDate < start || isoDate > end) continue;

    const eventRegex = /<span class="hour"><a href="([^"]+)">(\d{2}:\d{2})\s*-\s*([^<]+)<\/a><\/span>/g;
    let em;
    while ((em = eventRegex.exec(content)) !== null) {
      const rawUrl = em[1];
      const time = em[2];
      const title = decodeHtml(em[3]);
      if (afterTime && time < afterTime) continue;

      const sourceUrl = rawUrl.startsWith('http') ? rawUrl : `https://www.iluzjon.fn.org.pl${rawUrl}`;

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

    console.log(`Request: source="${source.name}" url="${source.url}" filter="${filter}"`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let formattedUrl = source.url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    formattedUrl = normalizeSourceUrl(formattedUrl);
    formattedUrl = addPowszechnyMonth(formattedUrl, filter);

    const sourceType = getSourceType(formattedUrl);

    if (sourceType !== 'generic') {
      const events = await scrapeDirect(formattedUrl, source.name, sourceType, filter, afterTime);
      const enriched = await enrichWithDescriptions(events);
      return new Response(
        JSON.stringify({ success: true, data: enriched }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ success: true, data: [], error: 'ANTHROPIC_API_KEY missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cacheKey = promptHint || '';

    let cached: { events: ScrapedEvent[] } | null = null;
    try {
      const { data } = await supabase
        .from('scrape_cache')
        .select('events')
        .eq('source_url', formattedUrl)
        .eq('filter', filter)
        .eq('prompt_hint', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .order('cached_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      cached = data as any;
    } catch (err) {
      console.error('Cache lookup threw:', err instanceof Error ? err.message : err);
    }

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
    const html = await fetchHtml(formattedUrl);
    if (!html) {
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nextData = extractNextJsData(html);
    let pageText: string;
    if (nextData) {
      console.log(`Using __NEXT_DATA__ for ${source.name} (${nextData.length} chars)`);
      pageText = nextData.slice(0, 20000);
    } else {
      pageText = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z#0-9]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 20000);
      console.log(`Page text for ${source.name}: ${pageText.length} chars`);
    }

    if (pageText.length < 2000) {
      console.log(`Skipping Claude for ${source.name}: page text too short (${pageText.length} chars) — likely JS-rendered`);
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { start, end } = getDateRangeForFilter(filter);
    const dateDescription = buildDateDescription(filter);

    let claudeRes: Response;
    try {
      const claudeController = new AbortController();
      const claudeTimeout = setTimeout(() => claudeController.abort(), 25000);
      claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        signal: claudeController.signal,
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Extract events from this ${nextData ? 'Next.js page data (JSON)' : 'webpage'}. Return only valid JSON, no markdown fences.\n\nSource URL: ${formattedUrl}\nDate range: ${dateDescription} (${start} to ${end})${afterTime ? `\nOnly include events starting at or after ${afterTime}.` : ''}${promptHint ? `\nContext: ${promptHint}` : ''}\n\nRules:\n1. Only include events whose date falls within ${start} to ${end}. Exclude everything else.\n2. Time format: HH:MM (24-hour). Read times exactly as shown — never invent them.\n3. If a show has multiple times (e.g. 14:30, 17:30), create a SEPARATE entry for each.\n4. If no events match, return {"events":[]}.\n5. Description: 2-3 sentence synopsis from the page. Polish sites → Polish. Others → English. Never invent.\n6. Link: direct URL to the specific event page if visible, otherwise omit.\n\nReturn this exact JSON shape:\n{"events":[{"title":"","time":"HH:MM","date":"DD month","description":"","director":"","cast":"","duration":"","genre":"","link":""}]}\n\n${nextData ? 'Page data (JSON):' : 'Webpage text:'}\n${pageText}`,
          }],
        }),
      });
      clearTimeout(claudeTimeout);
    } catch (err) {
      console.error(`Claude fetch threw for ${formattedUrl}:`, err instanceof Error ? err.message : err);
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!claudeRes.ok) {
      console.error(`Claude API error for ${formattedUrl}:`, await claudeRes.text());
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeData = await claudeRes.json();
    const rawText: string = claudeData.content?.[0]?.text || '{"events":[]}';

    let parsed: { events: any[] } = { events: [] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const m = rawText.match(/\{[\s\S]*"events"[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* ignore */ } }
    }

    const events: ScrapedEvent[] = (parsed.events || []).map((evt: any) => ({
      title: evt.title || 'Untitled',
      time: evt.time || '—',
      venue: source.name,
      date: evt.date || '',
      description: evt.description || undefined,
      director: evt.director || undefined,
      cast: evt.cast || undefined,
      duration: evt.duration || undefined,
      genre: evt.genre || undefined,
      sourceUrl: evt.link || formattedUrl,
    }));

    console.log(`Found ${events.length} events from ${source.name} (Claude extraction)`);

    try {
      await supabase.from('scrape_cache').insert({
        source_url: formattedUrl,
        filter,
        prompt_hint: cacheKey,
        events,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });
    } catch (err) {
      console.error('Cache write threw:', err instanceof Error ? err.message : err);
    }

    return new Response(
      JSON.stringify({ success: true, data: events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in scrape-events:', error instanceof Error ? error.stack || error.message : error);
    return new Response(
      JSON.stringify({ success: true, data: [], error: error instanceof Error ? error.message : 'unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
