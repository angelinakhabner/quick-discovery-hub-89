import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import type { Folder, Source } from "@/lib/mock-data";

interface EditFolderModalProps {
  folder: Folder;
  onRename: (id: string, newName: string) => void;
  onAddSource: (url: string) => void;
  onRemoveSource: (url: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const EditFolderModal = ({ folder, onRename, onAddSource, onRemoveSource, onDelete, onClose }: EditFolderModalProps) => {
  const [name, setName] = useState(folder.name);
  const [newUrl, setNewUrl] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== folder.name) {
      onRename(folder.id, trimmed);
    }
  };

  const handleAddSource = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onAddSource(trimmed);
    setNewUrl("");
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(folder.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-xl crossfade-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-xl text-card-foreground">Edit Folder</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        {/* Folder name */}
        <div className="mb-6">
          <label className="block text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNameBlur(); (e.target as HTMLInputElement).blur(); } }}
            className="w-full px-4 py-2.5 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Sources */}
        <div className="mb-6">
          <label className="block text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Sources ({folder.sources.length})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
            {folder.sources.length === 0 && (
              <p className="text-sm text-muted-foreground font-body py-3 text-center">No sources yet.</p>
            )}
            {folder.sources.map((src) => (
              <div
                key={src.url}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-background border border-border group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-heading font-medium text-foreground truncate">{src.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{src.url}</p>
                </div>
                <button
                  onClick={() => onRemoveSource(src.url)}
                  className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${src.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSource(); } }}
              placeholder="example.com/events"
              className="flex-1 px-4 py-2.5 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleAddSource}
              disabled={!newUrl.trim()}
              className="px-4 py-2.5 text-sm font-heading font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            onClick={handleDelete}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-heading font-medium rounded-xl transition-colors ${
              confirmDelete
                ? "bg-destructive text-destructive-foreground"
                : "text-destructive hover:bg-destructive/10"
            }`}
          >
            <Trash2 size={13} />
            {confirmDelete ? "Confirm Delete" : "Delete Folder"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-heading font-medium rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
