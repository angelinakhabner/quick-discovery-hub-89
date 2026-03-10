import type { Folder } from "@/lib/mock-data";

interface FolderTabsProps {
  folders: Folder[];
  activeFolderId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

const FolderTabs = ({ folders, activeFolderId, onSelect }: FolderTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onSelect(folder.id)}
          className={`px-5 py-2 text-sm font-heading font-medium rounded-full transition-colors ${
            activeFolderId === folder.id
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          }`}
        >
          {folder.name}
          <span className="ml-1.5 text-xs opacity-60">
            {folder.sources.length}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FolderTabs;
