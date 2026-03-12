import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Folder } from "@/lib/mock-data";

interface FolderTabsProps {
  folders: Folder[];
  activeFolderId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onRename?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
}

const FolderTabs = ({ folders, activeFolderId, onSelect, onRename, onDelete }: FolderTabsProps) => {
  const [menuFolderId, setMenuFolderId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuFolderId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuFolderId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuFolderId]);

  // Focus input when renaming
  useEffect(() => {
    if (renamingId) inputRef.current?.focus();
  }, [renamingId]);

  const startRename = (folder: Folder) => {
    setRenamingId(folder.id);
    setRenameValue(folder.name);
    setMenuFolderId(null);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim() && onRename) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {folders.map((folder) => {
        const isActive = activeFolderId === folder.id;
        const isRenaming = renamingId === folder.id;

        return (
          <div key={folder.id} className="relative group">
            {isRenaming ? (
              <form
                onSubmit={(e) => { e.preventDefault(); commitRename(); }}
                className="inline-flex"
              >
                <input
                  ref={inputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  className="px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-heading font-medium rounded-full bg-foreground text-background border-2 border-primary focus:outline-none w-32 sm:w-40"
                />
              </form>
            ) : (
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
            )}

            {/* Menu trigger */}
            {!isRenaming && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuFolderId(menuFolderId === folder.id ? null : folder.id);
                }}
                className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  isActive ? "text-background/60 hover:text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MoreHorizontal size={14} />
              </button>
            )}

            {/* Dropdown menu */}
            {menuFolderId === folder.id && (
              <div
                ref={menuRef}
                className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px] crossfade-enter"
              >
                <button
                  onClick={() => startRename(folder)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-heading text-card-foreground hover:bg-muted transition-colors"
                >
                  <Pencil size={12} />
                  Rename
                </button>
                <button
                  onClick={() => {
                    setMenuFolderId(null);
                    onDelete?.(folder.id);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-heading text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FolderTabs;
