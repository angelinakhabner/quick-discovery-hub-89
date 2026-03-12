import { useState, useCallback, useRef } from "react";
import { Plus, Sparkles, LogOut, Loader2 } from "lucide-react";
import FolderTabs from "@/components/FolderTabs";
import TimeFilters from "@/components/TimeFilters";
import EventList from "@/components/EventList";
import { SourcesIndicator } from "@/components/EditSourcesModal";
import EditFolderModal from "@/components/EditFolderModal";
import VenueFilter, { venueCategories } from "@/components/VenueFilter";
import { useAuth } from "@/hooks/useAuth";
import { useFolders } from "@/hooks/useFolders";
import AddFolderModal from "@/components/AddFolderModal";
import { type Folder, type TimeFilter, type ResultItem } from "@/lib/mock-data";
import { scrapeEvents } from "@/lib/api/scrape-events";
import { toast } from "sonner";

const Index = () => {
  const { user, signOut } = useAuth();
  const { folders, isLoadingFolders, createFolder, addSource, removeSource, renameFolder, deleteFolder } = useFolders();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("today");
  const [showAddModal, setShowAddModal] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [afterTime, setAfterTime] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [selectedVenues, setSelectedVenues] = useState<string | null>(null);

  // Cache: folderId-filter -> results
  const cache = useRef<Record<string, ResultItem[]>>({});

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const editingFolder = folders.find((f) => f.id === editingFolderId) || null;

  const filteredResults = results;

  const fetchResults = useCallback(async (folder: Folder, filter: TimeFilter, venueCategory: string | null, timeAfter: string) => {
    let sourcesToScrape = folder.sources;
    if (venueCategory) {
      const cat = venueCategories.find((c) => c.label === venueCategory);
      if (cat) {
        sourcesToScrape = folder.sources.filter((s) => cat.venues.includes(s.name));
      }
    }

    if (sourcesToScrape.length === 0) {
      setResults([]);
      return;
    }

    const cacheKey = `${folder.id}-${filter}-${venueCategory || 'all'}-${timeAfter || 'any'}`;
    if (cache.current[cacheKey]) {
      setResults(cache.current[cacheKey]);
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const response = await scrapeEvents(sourcesToScrape, filter, timeAfter || undefined);
      if (response.success && response.data) {
        cache.current[cacheKey] = response.data;
        setResults(response.data);
      } else {
        toast.error(response.error || "Failed to fetch events");
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Failed to fetch events. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFolderSelect = useCallback((id: string) => {
    if (activeFolderId === id) {
      setActiveFolderId(null);
      setResults([]);
      return;
    }
    setActiveFolderId(id);
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      fetchResults(folder, activeFilter, selectedVenues, afterTime);
    }
  }, [activeFolderId, folders, activeFilter, selectedVenues, afterTime, fetchResults]);

  const handleFilterSelect = useCallback((filter: TimeFilter) => {
    setActiveFilter(filter);
    if (activeFolder) {
      fetchResults(activeFolder, filter, selectedVenues, afterTime);
    }
  }, [activeFolder, selectedVenues, afterTime, fetchResults]);

  const handleVenueChange = useCallback((category: string | null) => {
    setSelectedVenues(category);
    if (activeFolder) {
      fetchResults(activeFolder, activeFilter, category, afterTime);
    }
  }, [activeFolder, activeFilter, afterTime, fetchResults]);

  const handleAfterTimeChange = useCallback((time: string) => {
    setAfterTime(time);
    if (activeFolder) {
      fetchResults(activeFolder, activeFilter, selectedVenues, time);
    }
  }, [activeFolder, activeFilter, selectedVenues, fetchResults]);

  const handleCreateFolder = useCallback(async (name: string, urls: string[]) => {
    const newFolder = await createFolder(name, urls);
    if (newFolder) {
      setActiveFolderId(newFolder.id);
      setShowAddModal(false);
      fetchResults(newFolder, activeFilter, selectedVenues, afterTime);
    }
  }, [createFolder, activeFilter, selectedVenues, afterTime, fetchResults]);

  const handleAddSource = useCallback(async (url: string) => {
    const folderId = editingFolder?.id;
    if (!folderId) return;
    await addSource(folderId, url);
    Object.keys(cache.current).forEach((key) => {
      if (key.startsWith(folderId)) delete cache.current[key];
    });
  }, [editingFolder, addSource]);

  const handleRemoveSource = useCallback(async (url: string) => {
    const folderId = editingFolder?.id;
    if (!folderId) return;
    await removeSource(folderId, url);
    Object.keys(cache.current).forEach((key) => {
      if (key.startsWith(folderId)) delete cache.current[key];
    });
  }, [editingFolder, removeSource]);

  const handleRenameFolder = useCallback(async (id: string, newName: string) => {
    await renameFolder(id, newName);
  }, [renameFolder]);

  const handleDeleteFolder = useCallback(async (id: string) => {
    await deleteFolder(id);
    if (activeFolderId === id) {
      setActiveFolderId(null);
      setResults([]);
    }
  }, [deleteFolder, activeFolderId]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-10 pb-16">
        {/* Header */}
        <header className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={22} className="text-primary sm:hidden" />
              <Sparkles size={28} className="text-primary hidden sm:block" />
              <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight text-foreground">
                Whatsön
              </h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-heading font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} className="sm:hidden" />
                <Plus size={16} className="hidden sm:block" />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">New</span>
              </button>
              <button
                onClick={signOut}
                className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} className="sm:hidden" />
                <LogOut size={18} className="hidden sm:block" />
              </button>
            </div>
          </div>
          <p className="text-muted-foreground font-body text-xs sm:text-sm">
            Hi, <span className="text-foreground font-medium">{displayName}</span> 👋
          </p>
        </header>

        {/* Folders */}
        <section className="mb-6 sm:mb-8">
          <p className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
            Folders
          </p>
          {isLoadingFolders ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={16} className="text-muted-foreground animate-spin" />
              <span className="text-muted-foreground text-sm">Loading folders…</span>
            </div>
          ) : (
            <FolderTabs
              folders={folders}
              activeFolderId={activeFolderId}
              onSelect={handleFolderSelect}
              onAddNew={() => setShowAddModal(true)}
              onEdit={(folder) => setEditingFolder(folder)}
            />
          )}
        </section>

        {/* Content area */}
        {activeFolderId && activeFolder ? (
          <>
            <SourcesIndicator
              sources={activeFolder.sources}
              onEdit={() => setEditingFolder(activeFolder)}
            />
            <VenueFilter selected={selectedVenues} onChange={handleVenueChange} />
            <TimeFilters
              active={activeFilter}
              onSelect={handleFilterSelect}
              afterTime={afterTime}
              onAfterTimeChange={handleAfterTimeChange}
            />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 crossfade-enter">
                <Loader2 size={24} className="text-primary animate-spin" />
                <p className="text-muted-foreground font-body text-sm">
                  Scanning sources…
                </p>
              </div>
            ) : (
              <EventList results={filteredResults} />
            )}
          </>
        ) : !isLoadingFolders ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground font-body text-sm sm:text-base mb-1">
              {folders.length === 0
                ? "Create your first folder to get started"
                : "Select a folder above to browse events"}
            </p>
            <p className="text-muted-foreground/60 font-body text-xs sm:text-sm">
              {folders.length === 0
                ? "Add source URLs to track events from your favorite venues"
                : "or create a new one with your own sources"}
            </p>
          </div>
        ) : null}
      </div>

      {showAddModal && (
        <AddFolderModal
          onCreateFolder={handleCreateFolder}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingFolder && (
        <EditFolderModal
          folder={editingFolder}
          onRename={handleRenameFolder}
          onAddSource={handleAddSource}
          onRemoveSource={handleRemoveSource}
          onDelete={handleDeleteFolder}
          onClose={() => setEditingFolder(null)}
        />
      )}
    </div>
  );
};

export default Index;
