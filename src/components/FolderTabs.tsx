import { Plus } from "lucide-react";
import type { Folder } from "@/lib/mock-data";

interface FolderTabsProps {
  folders: Folder[];
  activeFolderId: string;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

const FolderTabs = ({ folders, activeFolderId, onSelect, onAddNew }: FolderTabsProps) => {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onSelect(folder.id)}
          className={`px-4 py-1.5 text-sm font-heading font-medium rounded-full whitespace-nowrap transition-colors ${
            activeFolderId === folder.id
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {folder.name}
        </button>
      ))}
      <button
        onClick={onAddNew}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-heading font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
        aria-label="Add new folder"
      >
        <Plus size={14} />
        <span>add</span>
      </button>
    </div>
  );
};

export default FolderTabs;
