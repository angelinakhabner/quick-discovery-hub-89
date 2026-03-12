import { supabase } from '@/integrations/supabase/client';
import type { ResultItem, Source, TimeFilter } from '@/lib/mock-data';

export async function scrapeEvents(
  sources: Source[],
  filter: TimeFilter,
  afterTime?: string,
  promptHint?: string
): Promise<{ success: boolean; data?: ResultItem[]; error?: string }> {
  const { data, error } = await supabase.functions.invoke('scrape-events', {
    body: { sources, filter, afterTime: afterTime || undefined, promptHint: promptHint || undefined },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}
