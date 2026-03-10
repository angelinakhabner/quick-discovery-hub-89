import { useState, useCallback } from "react";
import FolderTabs from "@/components/FolderTabs";
import TimeFilters from "@/components/TimeFilters";
import EventList from "@/components/EventList";
import AddFolderModal from "@/components/AddFolderModal";
import { defaultFolders, getMockResults, type Folder, type TimeFilter, type ResultItem } from "@/lib/mock-data";

const Index = () => {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [activeFolderId, setActiveFolderId] = useState<string>(defaultFolders[0].id);
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("today");
  const [showAddModal, setShowAddModal] = useState(false);

  const results = getMockResults(activeFolderId, activeFilter);

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
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        {/* Brand */}
        <h1 className="font-heading font-bold text-3xl text-foreground tracking-tight mb-8">
          Whatsön
        </h1>

        {/* Folder tabs */}
        <FolderTabs
          folders={folders}
          activeFolderId={activeFolderId}
          onSelect={setActiveFolderId}
          onAddNew={() => setShowAddModal(true)}
        />

        {/* Time filters */}
        <TimeFilters active={activeFilter} onSelect={setActiveFilter} />

        {/* Event list */}
        <EventList results={results} />
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
