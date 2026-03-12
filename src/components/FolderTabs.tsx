import { Pencil } from "lucide-react";
import type { Folder } from "@/lib/mock-data";

interface FolderTabsProps {
  folders: Folder[];
  activeFolderId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onEdit: (folder: Folder) => void;
}

const FolderTabs = ({ folders, activeFolderId, onSelect, onEdit }: FolderTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {folders.map((folder) => {
        const isActive = activeFolderId === folder.id;

        return (
          <div key={folder.id} className="relative group">
            <button
              onClick={() => onSelect(folder.id)}
              className={`px-4 py-2 text-sm font-heading font-medium rounded-full transition-all pr-8 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-foreground border border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {folder.name}
              <span className={`ml-1 text-xs ${isActive ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {folder.sources.length}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                isActive ? "text-primary-foreground/60 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Edit ${folder.name}`}
            >
              <Pencil size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FolderTabs;
