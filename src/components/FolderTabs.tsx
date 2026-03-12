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
              className={`px-4 py-2 text-xs font-heading font-medium tracking-wide rounded-full transition-all pr-8 ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-secondary text-secondary-foreground hover:text-foreground border border-border"
              }`}
            >
              {folder.name}
              <span className={`ml-1.5 text-[10px] ${isActive ? "opacity-50" : "opacity-40"}`}>
                {folder.sources.length}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
              }}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                isActive ? "text-background/50 hover:text-background" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Edit ${folder.name}`}
            >
              <Pencil size={11} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FolderTabs;
