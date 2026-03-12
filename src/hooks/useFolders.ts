import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Folder, Source } from "@/lib/mock-data";

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

    const loadFolders = async () => {
      setIsLoadingFolders(true);
      try {
        const { data: foldersData, error: foldersError } = await supabase
          .from("folders")
          .select("id, name, created_at")
          .order("created_at", { ascending: true });

        if (foldersError) throw foldersError;

        if (!foldersData?.length) {
          setFolders([]);
          setIsLoadingFolders(false);
          return;
        }

        const { data: sourcesData, error: sourcesError } = await supabase
          .from("folder_sources")
          .select("id, folder_id, url, name");

        if (sourcesError) throw sourcesError;

        const mapped: Folder[] = foldersData.map((f) => ({
          id: f.id,
          name: f.name,
          sources: (sourcesData || [])
            .filter((s) => s.folder_id === f.id)
            .map((s) => ({ url: s.url, name: s.name })),
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

  const createFolder = useCallback(async (name: string, urls: string[]): Promise<Folder | null> => {
    if (!user) return null;

    try {
      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .insert({ name, user_id: user.id })
        .select("id, name")
        .single();

      if (folderError) throw folderError;

      const sources: Source[] = urls.map((url) => ({
        url,
        name: url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      }));

      if (sources.length > 0) {
        const { error: sourcesError } = await supabase
          .from("folder_sources")
          .insert(sources.map((s) => ({ folder_id: folder.id, url: s.url, name: s.name })));

        if (sourcesError) throw sourcesError;
      }

      const newFolder: Folder = { id: folder.id, name: folder.name, sources };
      setFolders((prev) => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error("Failed to create folder");
      return null;
    }
  }, [user]);

  const addSource = useCallback(async (folderId: string, url: string) => {
    const source: Source = { url, name: url.replace(/^https?:\/\//, "").replace(/\/$/, "") };

    try {
      const { error } = await supabase
        .from("folder_sources")
        .insert({ folder_id: folderId, url: source.url, name: source.name });

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

  return { folders, isLoadingFolders, createFolder, addSource, removeSource, deleteFolder };
}
