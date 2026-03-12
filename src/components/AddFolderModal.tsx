import { useState } from "react";
import { Plus, X } from "lucide-react";

interface SourceEntry {
  url: string;
  category: string;
}

interface AddFolderModalProps {
  onCreateFolder: (name: string, sources: { url: string; category?: string }[], promptHint?: string) => void;
  onClose: () => void;
}

const AddFolderModal = ({ onCreateFolder, onClose }: AddFolderModalProps) => {
  const [name, setName] = useState("");
  const [sources, setSources] = useState<SourceEntry[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const existingCategories = Array.from(
    new Set(sources.map((s) => s.category).filter(Boolean))
  );

  const handleAddSource = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setSources((prev) => [...prev, { url: trimmed, category: newCategory.trim() }]);
    setNewUrl("");
    setNewCategory("");
  };

  const handleRemoveSource = (idx: number) => {
    setSources((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateFolder(
      name.trim(),
      sources.map((s) => ({ url: s.url, category: s.category || undefined }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-xl crossfade-enter">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-xl text-card-foreground">New Folder</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-medium text-card-foreground mb-1">
              Topic name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jazz in Warsaw"
              autoFocus
              className="w-full px-4 py-3 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Sources list */}
          <div>
            <label className="block text-sm font-heading font-medium text-card-foreground mb-1">
              Sources
            </label>
            {sources.length > 0 && (
              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                {sources.map((src, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border text-xs">
                    <span className="truncate flex-1 font-heading text-foreground">{src.url}</span>
                    {src.category && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-heading">{src.category}</span>
                    )}
                    <button type="button" onClick={() => handleRemoveSource(idx)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add source row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSource(); } }}
                placeholder="example.com/events"
                className="flex-1 px-3 py-2.5 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSource(); } }}
                placeholder="category"
                list="add-folder-cat"
                className="w-24 px-3 py-2.5 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {existingCategories.length > 0 && (
                <datalist id="add-folder-cat">
                  {existingCategories.map((c) => <option key={c} value={c} />)}
                </datalist>
              )}
              <button
                type="button"
                onClick={handleAddSource}
                disabled={!newUrl.trim()}
                className="px-3 py-2.5 text-sm font-heading font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 text-sm font-heading font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Create Folder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-sm font-heading font-medium rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;
