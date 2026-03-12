import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { DateFilterMode } from "@/lib/mock-data";

interface SourceEntry {
  url: string;
  category: string;
}

interface AddFolderModalProps {
  onCreateFolder: (name: string, sources: { url: string; category?: string }[], promptHint?: string, dateFilterMode?: DateFilterMode) => void;
  onClose: () => void;
}

const modeOptions: { label: string; value: DateFilterMode }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const AddFolderModal = ({ onCreateFolder, onClose }: AddFolderModalProps) => {
  const [name, setName] = useState("");
  const [promptHint, setPromptHint] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("daily");
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
      sources.map((s) => ({ url: s.url, category: s.category || undefined })),
      promptHint.trim() || undefined,
      dateFilterMode
    );
  };

  const inputClass = "w-full px-3 py-2.5 text-xs bg-transparent text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 border border-border crossfade-enter max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground">New Collection</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jazz in Warsaw"
              autoFocus
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
              Date range
            </label>
            <div className="flex gap-1.5">
              {modeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDateFilterMode(opt.value)}
                  className={`flex-1 px-2 py-2 text-[11px] font-heading font-medium tracking-wide rounded-lg border transition-colors ${
                    dateFilterMode === opt.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
              Content filter <span className="normal-case tracking-normal opacity-60">(optional)</span>
            </label>
            <input
              type="text"
              value={promptHint}
              onChange={(e) => setPromptHint(e.target.value)}
              placeholder="e.g. only exhibitions, only concerts"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5">
              Sources
            </label>
            {sources.length > 0 && (
              <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                {sources.map((src, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-[11px]">
                    <span className="truncate flex-1 font-heading text-foreground">{src.url}</span>
                    {src.category && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-heading text-[10px]">{src.category}</span>
                    )}
                    <button type="button" onClick={() => handleRemoveSource(idx)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-1.5">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSource(); } }}
                placeholder="example.com/events"
                className="flex-1 px-3 py-2.5 text-xs bg-transparent text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
              />
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSource(); } }}
                placeholder="tag"
                list="add-folder-cat"
                className="w-20 px-3 py-2.5 text-xs bg-transparent text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
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
                className="px-3 py-2.5 text-xs font-heading font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 text-xs font-heading font-medium tracking-wide rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-heading font-medium tracking-wide rounded-lg bg-secondary text-foreground hover:bg-accent transition-colors"
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
