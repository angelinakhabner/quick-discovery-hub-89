import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import FolderCard from "@/components/FolderCard";
import ResultsList from "@/components/ResultsList";
import NewFolderForm from "@/components/NewFolderForm";
import {
  defaultFolders,
  getMockResults,
  type Folder,
  type TimeFilter,
  type ResultItem,
} from "@/lib/mock-data";

const Index = () => {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders);
  const [activeFilter, setActiveFilter] = useState<{
    folderId: string;
    filter: TimeFilter;
  } | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [creatingFolder, setCreatingFolder] = useState(false);

  const handleTimeFilter = useCallback(
    (folderId: string, filter: TimeFilter) => {
      if (activeFilter?.folderId === folderId && activeFilter?.filter === filter) {
        setActiveFilter(null);
        setResults([]);
        return;
      }
      setActiveFilter({ folderId, filter });
      setResults(getMockResults(folderId, filter));
    },
    [activeFilter]
  );

  const handleCreateFolder = useCallback(
    (name: string, urls: string[]) => {
      const newFolder: Folder = {
        id: crypto.randomUUID(),
        name,
        sources: urls.map((url) => ({
          url,
          name: url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        })),
      };
      setFolders((prev) => [...prev, newFolder]);
      setCreatingFolder(false);
    },
    []
  );

  const handleClose = useCallback(() => {
    setActiveFilter(null);
    setResults([]);
  }, []);

  const activeFolder = folders.find((f) => f.id === activeFilter?.folderId);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-12 sm:pt-24">
        {/* Query Zone */}
        <div className="mb-12">
          <h1 className="font-heading font-bold text-2xl text-foreground mb-6 text-center">
            Quick check
          </h1>
          <SearchBar onSearch={() => {}} />
        </div>

        {/* Results or Folders */}
        {activeFilter && activeFolder ? (
          <ResultsList
            results={results}
            folderName={activeFolder.name}
            filter={activeFilter.filter}
            onClose={handleClose}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 crossfade-enter">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onTimeFilter={handleTimeFilter}
                activeFilter={activeFilter}
              />
            ))}

            {creatingFolder ? (
              <NewFolderForm
                onCreateFolder={handleCreateFolder}
                onCancel={() => setCreatingFolder(false)}
              />
            ) : (
              <button
                onClick={() => setCreatingFolder(true)}
                className="bg-card rounded-lg p-5 border border-dashed border-border flex items-center justify-center text-muted-foreground font-heading text-3xl min-h-[140px]"
              >
                +
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
