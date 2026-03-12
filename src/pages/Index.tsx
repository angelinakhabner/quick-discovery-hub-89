import { useState, useCallback, useRef, useMemo } from "react";
import { Plus, Sparkles, LogOut, Loader2 } from "lucide-react";
import FolderTabs from "@/components/FolderTabs";
import TimeFilters from "@/components/TimeFilters";
import EventList from "@/components/EventList";
import { EditSourcesModal, SourcesIndicator } from "@/components/EditSourcesModal";
import { useAuth } from "@/hooks/useAuth";
import AddFolderModal from "@/components/AddFolderModal";
import { defaultFolders, type Folder, type TimeFilter, type ResultItem } from "@/lib/mock-data";
import { scrapeEvents } from "@/lib/api/scrape-events";
import { toast } from "sonner";

const Index = () => {
  const { user, signOut } = useAuth();
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("today");
  const [showAddModal, setShowAddModal] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [afterTime, setAfterTime] = useState("");
  const [showEditSources, setShowEditSources] = useState(false);

  // Cache: folderId-filter -> results
  const cache = useRef<Record<string, ResultItem[]>>({});

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "there";

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  const filteredResults = useMemo(() => {
    if (!afterTime) return results;
    return results.filter((item) => {
      if (!item.time) return true;
      const eventTime = item.time.replace(/[^\d:]/g, "").slice(0, 5);
      return eventTime >= afterTime;
    });
  }, [results, afterTime]);

  const fetchResults = useCallback(async (folder: Folder, filter: TimeFilter) => {
    const cacheKey = `${folder.id}-${filter}`;
    if (cache.current[cacheKey]) {
      setResults(cache.current[cacheKey]);
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const response = await scrapeEvents(folder.sources, filter);
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
      fetchResults(folder, activeFilter);
    }
  }, [activeFolderId, folders, activeFilter, fetchResults]);

  const handleFilterSelect = useCallback((filter: TimeFilter) => {
    setActiveFilter(filter);
    if (activeFolder) {
      fetchResults(activeFolder, filter);
    }
  }, [activeFolder, fetchResults]);

  const handleCreateFolder = useCallback((name: string, urls: string[]) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      sources: urls.map((url) => ({
        url,
        name: url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      })),
    };
    setFolders((prev) => [...prev, newFolder]);
    setActiveFolderId(newFolder.id);
    setShowAddModal(false);
    fetchResults(newFolder, activeFilter);
  }, [activeFilter, fetchResults]);

  const handleAddSource = useCallback((url: string) => {
    if (!activeFolderId) return;
    const source = { url, name: url.replace(/^https?:\/\//, "").replace(/\/$/, "") };
    setFolders((prev) =>
      prev.map((f) =>
        f.id === activeFolderId ? { ...f, sources: [...f.sources, source] } : f
      )
    );
    // Clear cache for this folder so next fetch includes new source
    Object.keys(cache.current).forEach((key) => {
      if (key.startsWith(activeFolderId)) delete cache.current[key];
    });
  }, [activeFolderId]);

  const handleRemoveSource = useCallback((url: string) => {
    if (!activeFolderId) return;
    setFolders((prev) =>
      prev.map((f) =>
        f.id === activeFolderId
          ? { ...f, sources: f.sources.filter((s) => s.url !== url) }
          : f
      )
    );
    Object.keys(cache.current).forEach((key) => {
      if (key.startsWith(activeFolderId)) delete cache.current[key];
    });
  }, [activeFolderId]);

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
          <FolderTabs
            folders={folders}
            activeFolderId={activeFolderId}
            onSelect={handleFolderSelect}
            onAddNew={() => setShowAddModal(true)}
          />
        </section>

        {/* Content area */}
        {activeFolderId && activeFolder ? (
          <>
            <SourcesBar
              sources={activeFolder.sources}
              onAddSource={handleAddSource}
              onRemoveSource={handleRemoveSource}
            />
            <TimeFilters
              active={activeFilter}
              onSelect={handleFilterSelect}
              afterTime={afterTime}
              onAfterTimeChange={setAfterTime}
            />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 crossfade-enter">
                <Loader2 size={24} className="text-primary animate-spin" />
                <p className="text-muted-foreground font-body text-sm">
                  Scanning {activeFolder?.sources.length} sources…
                </p>
              </div>
            ) : (
              <EventList results={filteredResults} />
            )}
          </>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground font-body text-sm sm:text-base mb-1">
              Select a folder above to browse events
            </p>
            <p className="text-muted-foreground/60 font-body text-xs sm:text-sm">
              or create a new one with your own sources
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddFolderModal
          onCreateFolder={handleCreateFolder}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default Index;
