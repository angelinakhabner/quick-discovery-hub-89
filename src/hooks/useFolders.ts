import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { defaultFolders, type Folder, type Source } from "@/lib/mock-data";

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  // Load folders from database
  useEffect(() => {
    if (!user) {
      setFolders([]);
      setIsLoadingFolders(false);
      return;
    }

    const seedDefaultFolders = async (userId: string) => {
      try {
        for (const df of defaultFolders) {
          const { data: folder, error: folderError } = await supabase
            .from("folders")
            .insert({ name: df.name, user_id: userId })
            .select("id")
            .single();

          if (folderError) throw folderError;

          if (df.sources.length > 0) {
            const { error: srcError } = await supabase
              .from("folder_sources")
              .insert(df.sources.map((s) => ({ folder_id: folder.id, url: s.url, name: s.name })));
            if (srcError) throw srcError;
          }
        }
        // Reload after seeding
        loadFolders();
        return;
      } catch (err) {
        console.error("Error seeding default folders:", err);
      } finally {
        setIsLoadingFolders(false);
      }
    };

    const loadFolders = async () => {
      setIsLoadingFolders(true);
      try {
        const { data: foldersData, error: foldersError } = await supabase
          .from("folders")
          .select("id, name, created_at, prompt_hint, date_filter_mode")
          .order("created_at", { ascending: true });

        if (foldersError) throw foldersError;

        if (!foldersData?.length) {
          // Seed default folders for new users
          await seedDefaultFolders(user.id);
          return;
        }

        const { data: sourcesData, error: sourcesError } = await supabase
          .from("folder_sources")
          .select("id, folder_id, url, name, category");

        if (sourcesError) throw sourcesError;

        const mapped: Folder[] = foldersData.map((f) => ({
          id: f.id,
          name: f.name,
          promptHint: f.prompt_hint || undefined,
          dateFilterMode: (f.date_filter_mode as DateFilterMode) || "daily",
          sources: (sourcesData || [])
            .filter((s) => s.folder_id === f.id)
            .map((s) => ({ url: s.url, name: s.name, category: s.category || undefined })),
        }));

        setFolders(mapped);
      } catch (err) {
        console.error("Error loading folders:", err);
        toast.error("Failed to load folders");
      } finally {
        setIsLoadingFolders(false);
      }
    };

    loadFolders();
  }, [user]);

  const createFolder = useCallback(async (name: string, sources: { url: string; category?: string }[], promptHint?: string): Promise<Folder | null> => {
    if (!user) return null;

    try {
      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .insert({ name, user_id: user.id, prompt_hint: promptHint || null })
        .select("id, name, prompt_hint")
        .single();

      if (folderError) throw folderError;

      const mappedSources: Source[] = sources.map((s) => ({
        url: s.url,
        name: s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        category: s.category,
      }));

      if (mappedSources.length > 0) {
        const { error: sourcesError } = await supabase
          .from("folder_sources")
          .insert(mappedSources.map((s) => ({ folder_id: folder.id, url: s.url, name: s.name, category: s.category || null })));

        if (sourcesError) throw sourcesError;
      }

      const newFolder: Folder = { id: folder.id, name: folder.name, sources: mappedSources, promptHint: folder.prompt_hint || undefined };
      setFolders((prev) => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error("Failed to create folder");
      return null;
    }
  }, [user]);

  const addSource = useCallback(async (folderId: string, url: string, category?: string) => {
    const source: Source = { url, name: url.replace(/^https?:\/\//, "").replace(/\/$/, ""), category };

    try {
      const { error } = await supabase
        .from("folder_sources")
        .insert({ folder_id: folderId, url: source.url, name: source.name, category: category || null });

      if (error) throw error;

      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, sources: [...f.sources, source] } : f
        )
      );
    } catch (err) {
      console.error("Error adding source:", err);
      toast.error("Failed to add source");
    }
  }, []);

  const updateSourceCategory = useCallback(async (folderId: string, url: string, category: string) => {
    try {
      const { error } = await supabase
        .from("folder_sources")
        .update({ category: category || null })
        .eq("folder_id", folderId)
        .eq("url", url);

      if (error) throw error;

      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId
            ? { ...f, sources: f.sources.map((s) => s.url === url ? { ...s, category: category || undefined } : s) }
            : f
        )
      );
    } catch (err) {
      console.error("Error updating source category:", err);
      toast.error("Failed to update category");
    }
  }, []);

  const removeSource = useCallback(async (folderId: string, url: string) => {
    try {
      const { error } = await supabase
        .from("folder_sources")
        .delete()
        .eq("folder_id", folderId)
        .eq("url", url);

      if (error) throw error;

      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId
            ? { ...f, sources: f.sources.filter((s) => s.url !== url) }
            : f
        )
      );
    } catch (err) {
      console.error("Error removing source:", err);
      toast.error("Failed to remove source");
    }
  }, []);

  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ name: newName })
        .eq("id", folderId);
      if (error) throw error;
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f))
      );
    } catch (err) {
      console.error("Error renaming folder:", err);
      toast.error("Failed to rename folder");
    }
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      const { error } = await supabase.from("folders").delete().eq("id", folderId);
      if (error) throw error;
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
    } catch (err) {
      console.error("Error deleting folder:", err);
      toast.error("Failed to delete folder");
    }
  }, []);

  const updatePromptHint = useCallback(async (folderId: string, promptHint: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .update({ prompt_hint: promptHint || null })
        .eq("id", folderId);
      if (error) throw error;
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, promptHint: promptHint || undefined } : f))
      );
    } catch (err) {
      console.error("Error updating prompt hint:", err);
      toast.error("Failed to update content filter");
    }
  }, []);

  return { folders, isLoadingFolders, createFolder, addSource, removeSource, updateSourceCategory, renameFolder, deleteFolder, updatePromptHint };
}
