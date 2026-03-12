import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { DateFilterMode } from "@/lib/mock-data";

interface SourceEntry { url: string; category: string; }

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

  const existingCategories = Array.from(new Set(sources.map((s) => s.category).filter(Boolean)));

  const handleAddSource = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setSources((prev) => [...prev, { url: trimmed, category: newCategory.trim() }]);
    setNewUrl(""); setNewCategory("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateFolder(name.trim(), sources.map((s) => ({ url: s.url, category: s.category || undefined })), promptHint.trim() || undefined, dateFilterMode);
  };

  const inputClass = "w-full px-4 py-3 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40";
  const labelClass = "block text-xs font-heading font-semibold text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-xl border border-border crossfade-enter max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-foreground">New Folder</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Topic name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jazz in Warsaw" autoFocus className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Date range</label>
            <div className="flex gap-2">
              {modeOptions.map((opt) => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setDateFilterMode(opt.value)}
                  className={`flex-1 px-2 py-2.5 text-sm font-heading font-medium rounded-xl transition-all ${
                    dateFilterMode === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-foreground border border-border hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Content filter <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input type="text" value={promptHint} onChange={(e) => setPromptHint(e.target.value)} placeholder="e.g. only exhibitions, only concerts" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Sources</label>
            {sources.length > 0 && (
              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                {sources.map((src, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-border text-sm">
                    <span className="truncate flex-1 font-heading text-foreground">{src.url}</span>
                    {src.category && <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-heading font-medium">{src.category}</span>}
                    <button type="button" onClick={() => setSources((prev) => prev.filter((_, i) => i !== idx))} className="shrink-0 text-muted-foreground hover:text-destructive"><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSource(); } }} placeholder="example.com/events" className="flex-1 px-3 py-3 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" />
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSource(); } }} placeholder="tag" list="add-folder-cat" className="w-20 px-3 py-3 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" />
              {existingCategories.length > 0 && <datalist id="add-folder-cat">{existingCategories.map((c) => <option key={c} value={c} />)}</datalist>}
              <button type="button" onClick={handleAddSource} disabled={!newUrl.trim()} className="px-3 py-3 text-sm font-heading font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-40"><Plus size={16} /></button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={!name.trim()} className="flex-1 px-4 py-3 text-sm font-heading font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-40">Create Folder</button>
            <button type="button" onClick={onClose} className="px-4 py-3 text-sm font-heading font-medium rounded-full bg-secondary text-foreground hover:bg-muted transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;
