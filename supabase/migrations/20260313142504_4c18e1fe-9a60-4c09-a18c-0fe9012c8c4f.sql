CREATE TABLE public.scrape_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  filter TEXT NOT NULL,
  prompt_hint TEXT,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '2 hours')
);

CREATE INDEX idx_scrape_cache_lookup ON public.scrape_cache (source_url, filter, prompt_hint);
CREATE INDEX idx_scrape_cache_expires ON public.scrape_cache (expires_at);

ALTER TABLE public.scrape_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache" ON public.scrape_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manages cache" ON public.scrape_cache FOR ALL TO service_role USING (true);