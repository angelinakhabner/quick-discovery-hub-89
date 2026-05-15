import { supabase } from '@/integrations/supabase/client';
import type { ResultItem, Source, TimeFilter } from '@/lib/mock-data';

/** Scrape a single source. Returns events for that source. */
export async function scrapeSingleSource(
  source: Source,
  filter: TimeFilter,
  afterTime?: string,
  promptHint?: string
): Promise<{ success: boolean; data?: ResultItem[]; error?: string }> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('request timeout')), 40000)
  );

  const invoke = supabase.functions.invoke('scrape-events', {
    body: { source, filter, afterTime: afterTime || undefined, promptHint: promptHint || undefined },
  }).then(({ data, error }) => {
    if (error) return { success: false, error: error.message };
    return data;
  });

  return Promise.race([invoke, timeout]);
}

/**
 * Scrape all sources progressively with limited concurrency,
 * calling onPartial as each source completes.
 */
export async function scrapeEventsProgressive(
  sources: Source[],
  filter: TimeFilter,
  afterTime?: string,
  promptHint?: string,
  onPartial?: (events: ResultItem[], sourceName: string) => void,
  signal?: AbortSignal
): Promise<{ success: boolean; data: ResultItem[]; errors: string[] }> {
  const allEvents: ResultItem[] = [];
  const errors: string[] = [];
  const CONCURRENCY = 3;

  // Simple semaphore: process in batches of CONCURRENCY
  for (let i = 0; i < sources.length; i += CONCURRENCY) {
    if (signal?.aborted) break;
    const batch = sources.slice(i, i + CONCURRENCY);

    await Promise.allSettled(batch.map(async (source) => {
      if (signal?.aborted) return;
      try {
        const result = await scrapeSingleSource(source, filter, afterTime, promptHint);
        if (signal?.aborted) return;
        if (result.success) {
          if (result.data) allEvents.push(...result.data);
          onPartial?.(result.data || [], source.name);
        } else {
          onPartial?.([], source.name);
          if (result.error) errors.push(`${source.name}: ${result.error}`);
        }
      } catch (err) {
        if (signal?.aborted) return;
        onPartial?.([], source.name);
        errors.push(`${source.name}: ${err instanceof Error ? err.message : 'Failed'}`);
      }
    }));
  }

  allEvents.sort((a, b) => {
    const timeA = a.time.replace('—', '99:99');
    const timeB = b.time.replace('—', '99:99');
    return timeA.localeCompare(timeB);
  });

  return { success: true, data: allEvents, errors };
}
