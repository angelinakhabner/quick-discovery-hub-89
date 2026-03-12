import { useState, useCallback, useRef } from "react";
import { Plus, LogOut, Loader2, ArrowRight } from "lucide-react";
import FolderTabs from "@/components/FolderTabs";
import TimeFilters from "@/components/TimeFilters";
import EventList from "@/components/EventList";
import { SourcesIndicator } from "@/components/EditSourcesModal";
import EditFolderModal from "@/components/EditFolderModal";
import VenueFilter from "@/components/VenueFilter";
import { useAuth } from "@/hooks/useAuth";
import { useFolders } from "@/hooks/useFolders";
import AddFolderModal from "@/components/AddFolderModal";
import { type Folder, type TimeFilter, type ResultItem, type DateFilterMode } from "@/lib/mock-data";
import { scrapeEvents } from "@/lib/api/scrape-events";
import { toast } from "sonner";

const Index = () => {
  const { user, signOut } = useAuth();
  const { folders, isLoadingFolders, createFolder, addSource, removeSource, updateSourceCategory, renameFolder, deleteFolder, updatePromptHint, updateDateFilterMode } = useFolders();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("today");
  const [showAddModal, setShowAddModal] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [afterTime, setAfterTime] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [selectedVenues, setSelectedVenues] = useState<string | null>(null);

  const cache = useRef<Record<string, ResultItem[]>>({});

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const editingFolder = folders.find((f) => f.id === editingFolderId) || null;

  const filteredResults = results;

  const fetchResults = useCallback(async (folder: Folder, filter: TimeFilter, venueCategory: string | null, timeAfter: string) => {
    let sourcesToScrape = folder.sources;
    if (venueCategory) {
      sourcesToScrape = folder.sources.filter((s) => s.category === venueCategory);
    }
    if (sourcesToScrape.length === 0) { setResults([]); return; }

    const cacheKey = `${folder.id}-${filter}-${venueCategory || 'all'}-${timeAfter || 'any'}`;
    if (cache.current[cacheKey]) { setResults(cache.current[cacheKey]); return; }

    setIsLoading(true);
    setResults([]);
    try {
      const response = await scrapeEvents(sourcesToScrape, filter, timeAfter || undefined, folder.promptHint);
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

  const defaultFilterForMode = (mode: DateFilterMode): TimeFilter => {
    if (mode === "weekly") return "thisweek";
    if (mode === "monthly") return "thismonth";
    return "today";
  };

  const handleFolderSelect = useCallback((id: string) => {
    if (activeFolderId === id) { setActiveFolderId(null); setResults([]); return; }
    setActiveFolderId(id);
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      const filter = defaultFilterForMode(folder.dateFilterMode);
      setActiveFilter(filter);
      fetchResults(folder, filter, selectedVenues, afterTime);
    }
  }, [activeFolderId, folders, selectedVenues, afterTime, fetchResults]);

  const handleFilterSelect = useCallback((filter: TimeFilter) => {
    setActiveFilter(filter);
    if (activeFolder) fetchResults(activeFolder, filter, selectedVenues, afterTime);
  }, [activeFolder, selectedVenues, afterTime, fetchResults]);

  const handleVenueChange = useCallback((category: string | null) => {
    setSelectedVenues(category);
    if (activeFolder) fetchResults(activeFolder, activeFilter, category, afterTime);
  }, [activeFolder, activeFilter, afterTime, fetchResults]);

  const handleAfterTimeChange = useCallback((time: string) => {
    setAfterTime(time);
    if (activeFolder) fetchResults(activeFolder, activeFilter, selectedVenues, time);
  }, [activeFolder, activeFilter, selectedVenues, fetchResults]);

  const handleCreateFolder = useCallback(async (name: string, sources: { url: string; category?: string }[], promptHint?: string, dateFilterMode?: DateFilterMode) => {
    const newFolder = await createFolder(name, sources, promptHint, dateFilterMode);
    if (newFolder) {
      setActiveFolderId(newFolder.id);
      setShowAddModal(false);
      const filter = defaultFilterForMode(newFolder.dateFilterMode);
      setActiveFilter(filter);
      fetchResults(newFolder, filter, selectedVenues, afterTime);
    }
  }, [createFolder, selectedVenues, afterTime, fetchResults]);

  const handleUpdatePromptHint = useCallback(async (id: string, hint: string) => {
    await updatePromptHint(id, hint);
    Object.keys(cache.current).forEach((key) => { if (key.startsWith(id)) delete cache.current[key]; });
  }, [updatePromptHint]);

  const handleUpdateDateFilterMode = useCallback(async (id: string, mode: DateFilterMode) => {
    await updateDateFilterMode(id, mode);
    Object.keys(cache.current).forEach((key) => { if (key.startsWith(id)) delete cache.current[key]; });
    const filter = defaultFilterForMode(mode);
    setActiveFilter(filter);
    const folder = folders.find((f) => f.id === id);
    if (folder && activeFolderId === id) fetchResults({ ...folder, dateFilterMode: mode }, filter, selectedVenues, afterTime);
  }, [updateDateFilterMode, folders, activeFolderId, selectedVenues, afterTime, fetchResults]);

  const handleAddSource = useCallback(async (url: string, category?: string) => {
    if (!editingFolderId) return;
    await addSource(editingFolderId, url, category);
    Object.keys(cache.current).forEach((key) => { if (key.startsWith(editingFolderId)) delete cache.current[key]; });
  }, [editingFolderId, addSource]);

  const handleRemoveSource = useCallback(async (url: string) => {
    if (!editingFolderId) return;
    await removeSource(editingFolderId, url);
    Object.keys(cache.current).forEach((key) => { if (key.startsWith(editingFolderId)) delete cache.current[key]; });
  }, [editingFolderId, removeSource]);

  const handleUpdateSourceCategory = useCallback(async (url: string, category: string) => {
    if (!editingFolderId) return;
    await updateSourceCategory(editingFolderId, url, category);
    Object.keys(cache.current).forEach((key) => { if (key.startsWith(editingFolderId)) delete cache.current[key]; });
  }, [editingFolderId, updateSourceCategory]);

  const handleRenameFolder = useCallback(async (id: string, newName: string) => {
    await renameFolder(id, newName);
  }, [renameFolder]);

  const handleDeleteFolder = useCallback(async (id: string) => {
    await deleteFolder(id);
    if (activeFolderId === id) { setActiveFolderId(null); setResults([]); }
  }, [deleteFolder, activeFolderId]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 pt-6 sm:pt-10 pb-20">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-display text-3xl sm:text-4xl text-foreground">
              Whatsön
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-heading font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-95 transition-opacity"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">New</span>
              </button>
              <button
                onClick={signOut}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Hi, <span className="text-foreground font-medium">{displayName}</span> 👋
          </p>
        </header>

        {/* Folders */}
        <section className="mb-8">
          <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Folders
          </p>
          {isLoadingFolders ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={16} className="text-muted-foreground animate-spin" />
              <span className="text-muted-foreground text-sm">Loading…</span>
            </div>
          ) : (
            <FolderTabs
              folders={folders}
              activeFolderId={activeFolderId}
              onSelect={handleFolderSelect}
              onAddNew={() => setShowAddModal(true)}
              onEdit={(folder) => setEditingFolderId(folder.id)}
            />
          )}
        </section>

        {/* Content area */}
        {activeFolderId && activeFolder ? (
          <>
            <SourcesIndicator
              sources={activeFolder.sources}
              onEdit={() => setEditingFolderId(activeFolder.id)}
            />
            <VenueFilter
              sources={activeFolder.sources}
              selected={selectedVenues}
              onChange={handleVenueChange}
            />
            <TimeFilters
              active={activeFilter}
              onSelect={handleFilterSelect}
              afterTime={afterTime}
              onAfterTimeChange={handleAfterTimeChange}
              mode={activeFolder.dateFilterMode}
            />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 crossfade-enter">
                <Loader2 size={22} className="text-primary animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Scanning sources…
                </p>
              </div>
            ) : (
              <EventList results={filteredResults} />
            )}
          </>
        ) : !isLoadingFolders ? (
          <div className="text-center py-16 sm:py-20">
            <p className="font-display text-2xl sm:text-3xl text-foreground mb-2">
              {folders.length === 0 ? "Start discovering." : "Pick a folder."}
            </p>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {folders.length === 0
                ? "Create your first folder and add source URLs to track events from your favorite venues."
                : "Select a folder above to browse events, or create a new one."}
            </p>
            {folders.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-heading font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-95 transition-opacity"
              >
                Get Started <ArrowRight size={16} />
              </button>
            )}
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
          onUpdateSourceCategory={handleUpdateSourceCategory}
          onUpdatePromptHint={handleUpdatePromptHint}
          onUpdateDateFilterMode={handleUpdateDateFilterMode}
          onDelete={handleDeleteFolder}
          onClose={() => setEditingFolderId(null)}
        />
      )}

    </div>
  );
};

export default Index;
