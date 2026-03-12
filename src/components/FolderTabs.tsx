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
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {folders.map((folder) => {
        const isActive = activeFolderId === folder.id;

        return (
          <div key={folder.id} className="relative group">
            <button
              onClick={() => onSelect(folder.id)}
              className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-heading font-medium rounded-full transition-colors pr-8 sm:pr-9 ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {folder.name}
              <span className="ml-1 text-xs opacity-60">
                {folder.sources.length}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}
              className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                isActive ? "text-background/60 hover:text-background" : "text-muted-foreground hover:text-foreground"
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
