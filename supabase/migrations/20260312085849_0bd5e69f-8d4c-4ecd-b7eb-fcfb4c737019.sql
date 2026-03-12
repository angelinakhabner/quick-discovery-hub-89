
-- Create folders table
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create folder_sources table
CREATE TABLE public.folder_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_sources ENABLE ROW LEVEL SECURITY;

-- Folders: users can CRUD their own
CREATE POLICY "Users can read own folders" ON public.folders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own folders" ON public.folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON public.folders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON public.folders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Folder sources: users can CRUD sources for their own folders
CREATE POLICY "Users can read own folder sources" ON public.folder_sources FOR SELECT TO authenticated USING (folder_id IN (SELECT id FROM public.folders WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own folder sources" ON public.folder_sources FOR INSERT TO authenticated WITH CHECK (folder_id IN (SELECT id FROM public.folders WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own folder sources" ON public.folder_sources FOR DELETE TO authenticated USING (folder_id IN (SELECT id FROM public.folders WHERE user_id = auth.uid()));
