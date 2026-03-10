import { useState, useCallback } from "react";
import { Plus, Sparkles, LogOut } from "lucide-react";
import FolderTabs from "@/components/FolderTabs";
import TimeFilters from "@/components/TimeFilters";
import EventList from "@/components/EventList";
import { useAuth } from "@/hooks/useAuth";
import AddFolderModal from "@/components/AddFolderModal";
import { defaultFolders, getMockResults, type Folder, type TimeFilter } from "@/lib/mock-data";

const Index = () => {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("today");
  const [showAddModal, setShowAddModal] = useState(false);

  const results = activeFolderId ? getMockResults(activeFolderId, activeFilter) : [];

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
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Sparkles size={28} className="text-primary" />
              <h1 className="font-heading font-bold text-3xl tracking-tight text-foreground">
                Whatsön
              </h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-heading font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              New folder
            </button>
          </div>
          <p className="text-muted-foreground font-body text-sm">
            Your curated event feed. Pick a folder to see what's on.
          </p>
        </header>

        {/* Folders */}
        <section className="mb-8">
          <p className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Folders
          </p>
          <FolderTabs
            folders={folders}
            activeFolderId={activeFolderId}
            onSelect={(id) => setActiveFolderId(activeFolderId === id ? null : id)}
            onAddNew={() => setShowAddModal(true)}
          />
        </section>

        {/* Content area */}
        {activeFolderId ? (
          <>
            <TimeFilters active={activeFilter} onSelect={setActiveFilter} />
            <EventList results={results} />
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-body text-base mb-1">
              Select a folder above to browse events
            </p>
            <p className="text-muted-foreground/60 font-body text-sm">
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
