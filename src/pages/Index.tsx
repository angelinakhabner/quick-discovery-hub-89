import { useState, useCallback } from "react";
import HeroCard from "@/components/HeroCard";
import FolderDetail from "@/components/FolderDetail";
import AddFolderModal from "@/components/AddFolderModal";
import { defaultFolders, type Folder } from "@/lib/mock-data";

const Index = () => {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleFolderClick = useCallback((folderId: string) => {
    setActiveFolderId((prev) => (prev === folderId ? null : folderId));
  }, []);

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
    setShowAddModal(false);
  }, []);

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12 sm:pt-10">
        {/* Hero */}
        <HeroCard
          folders={folders}
          onFolderClick={handleFolderClick}
          onAddMore={() => setShowAddModal(true)}
          activeFolderId={activeFolderId}
        />

        {/* Folder detail section */}
        {activeFolder && (
          <div className="mt-6">
            <FolderDetail
              folder={activeFolder}
              onBack={() => setActiveFolderId(null)}
            />
          </div>
        )}
      </div>

      {/* Add folder modal */}
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
