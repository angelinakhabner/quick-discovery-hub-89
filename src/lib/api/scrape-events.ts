import { supabase } from '@/integrations/supabase/client';
import type { ResultItem, Source, TimeFilter } from '@/lib/mock-data';

/** Scrape a single source. Returns events for that source. */
export async function scrapeSingleSource(
  source: Source,
  filter: TimeFilter,
  afterTime?: string,
  promptHint?: string
): Promise<{ success: boolean; data?: ResultItem[]; error?: string }> {
  const { data, error } = await supabase.functions.invoke('scrape-events', {
    body: { source, filter, afterTime: afterTime || undefined, promptHint: promptHint || undefined },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}

/**
 * Scrape all sources progressively, calling onPartial as each source completes.
 * Returns the full combined results when done.
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

  // Fire all source requests in parallel, but stream results as they arrive
  const promises = sources.map(async (source) => {
    if (signal?.aborted) return;
    try {
      const result = await scrapeSingleSource(source, filter, afterTime, promptHint);
      if (signal?.aborted) return;
      if (result.success && result.data) {
        allEvents.push(...result.data);
        onPartial?.(result.data, source.name);
      } else if (result.error) {
        errors.push(`${source.name}: ${result.error}`);
      }
    } catch (err) {
      if (signal?.aborted) return;
      errors.push(`${source.name}: ${err instanceof Error ? err.message : 'Failed'}`);
    }
  });

  await Promise.allSettled(promises);

  // Sort all events by time
  allEvents.sort((a, b) => {
    const timeA = a.time.replace('—', '99:99');
    const timeB = b.time.replace('—', '99:99');
    return timeA.localeCompare(timeB);
  });

  return { success: true, data: allEvents, errors };
}
