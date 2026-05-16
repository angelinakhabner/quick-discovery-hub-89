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

async function fetchWithFirecrawl(url: string, firecrawlKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({ url, formats: ['markdown'] }),
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`Firecrawl error for ${url}: ${res.status} ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const markdown: string = data?.data?.markdown || '';
    console.log(`Firecrawl fetched ${url}: ${markdown.length} chars`);
    return markdown || null;
  } catch (err) {
    console.error(`Firecrawl threw for ${url}:`, err instanceof Error ? err.message : err);
    return null;
  }
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

    let url = source.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    console.log(`Request: source="${source.name}" url="${url}" filter="${filter}"`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cacheKey = promptHint || '';

    // Check cache
    let cached: { events: ScrapedEvent[] } | null = null;
    try {
      const { data } = await supabase
        .from('scrape_cache')
        .select('events')
        .eq('source_url', url)
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

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!firecrawlKey || !anthropicKey) {
      const missing = [!firecrawlKey && 'FIRECRAWL_API_KEY', !anthropicKey && 'ANTHROPIC_API_KEY'].filter(Boolean).join(', ');
      console.error(`Missing secrets: ${missing}`);
      return new Response(
        JSON.stringify({ success: true, data: [], error: `Missing secrets: ${missing}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch page content via Firecrawl (handles JS rendering for any site)
    const markdown = await fetchWithFirecrawl(url, firecrawlKey);
    if (!markdown) {
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { start, end } = getDateRangeForFilter(filter);
    const dateDescription = buildDateDescription(filter);
    const pageText = markdown.slice(0, 20000);

    // Extract events with Claude
    let claudeRes: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Extract events from this webpage content. Return only valid JSON, no markdown fences.\n\nSource: ${source.name} (${url})\nDate range: ${dateDescription} (${start} to ${end})${afterTime ? `\nOnly include events at or after ${afterTime}.` : ''}${promptHint ? `\nContext: ${promptHint}` : ''}\n\nRules:\n1. Only include events whose date falls within ${start} to ${end}.\n2. Time format: HH:MM (24-hour). Read exactly as shown — never invent times.\n3. Multiple showtimes for the same title → create a SEPARATE entry for each time.\n4. If no events match the date range, return {"events":[]}.\n5. Description: brief synopsis from the page text. Never invent content.\n6. Link: direct URL to the event page if visible, otherwise omit.\n\nReturn this exact JSON shape:\n{"events":[{"title":"","time":"HH:MM","date":"DD month","description":"","director":"","cast":"","duration":"","genre":"","link":""}]}\n\nWebpage content:\n${pageText}`,
          }],
        }),
      });
      clearTimeout(timeout);
    } catch (err) {
      console.error(`Claude threw for ${url}:`, err instanceof Error ? err.message : err);
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!claudeRes.ok) {
      console.error(`Claude API error for ${url}:`, await claudeRes.text());
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

    const events: ScrapedEvent[] = (parsed.events || [])
      .filter((evt: any) => !afterTime || evt.time >= afterTime)
      .map((evt: any) => ({
        title: evt.title || 'Untitled',
        time: evt.time || '—',
        venue: source.name,
        date: evt.date || '',
        description: evt.description || undefined,
        director: evt.director || undefined,
        cast: evt.cast || undefined,
        duration: evt.duration || undefined,
        genre: evt.genre || undefined,
        sourceUrl: evt.link || url,
      }));

    console.log(`Found ${events.length} events from ${source.name}`);

    // Cache result for 2 hours
    try {
      await supabase.from('scrape_cache').insert({
        source_url: url,
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
    console.error('Unexpected error:', error instanceof Error ? error.stack || error.message : error);
    return new Response(
      JSON.stringify({ success: true, data: [], error: error instanceof Error ? error.message : 'unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
