import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import type { Folder, DateFilterMode } from "@/lib/mock-data";

interface EditFolderModalProps {
  folder: Folder;
  onRename: (id: string, newName: string) => void;
  onAddSource: (url: string, category?: string) => void;
  onRemoveSource: (url: string) => void;
  onUpdateSourceCategory: (url: string, category: string) => void;
  onUpdatePromptHint: (id: string, hint: string) => void;
  onUpdateDateFilterMode: (id: string, mode: DateFilterMode) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const modeOptions: { label: string; value: DateFilterMode; description: string }[] = [
  { label: "Daily", value: "daily", description: "Today / Tomorrow / 3 days + time" },
  { label: "Weekly", value: "weekly", description: "This week / Next week" },
  { label: "Monthly", value: "monthly", description: "This month / Next month" },
];

const EditFolderModal = ({ folder, onRename, onAddSource, onRemoveSource, onUpdateSourceCategory, onUpdatePromptHint, onUpdateDateFilterMode, onDelete, onClose }: EditFolderModalProps) => {
  const [name, setName] = useState(folder.name);
  const [promptHint, setPromptHint] = useState(folder.promptHint || "");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const existingCategories = Array.from(
    new Set(folder.sources.map((s) => s.category).filter(Boolean))
  ) as string[];

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== folder.name) {
      onRename(folder.id, trimmed);
    }
  };

  const handleAddSource = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onAddSource(trimmed, newCategory.trim() || undefined);
    setNewUrl("");
    setNewCategory("");
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(folder.id);
    onClose();
  };

  const inputClass = "w-full px-3 py-2.5 text-xs bg-transparent text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30";
  const labelClass = "block text-[10px] font-heading font-medium text-muted-foreground uppercase tracking-[0.2em] mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 border border-border crossfade-enter max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground">Edit Collection</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNameBlur(); (e.target as HTMLInputElement).blur(); } }}
            className={inputClass}
          />
        </div>

        <div className="mb-5">
          <label className={labelClass}>Date range</label>
          <div className="flex gap-1.5">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  if (opt.value !== folder.dateFilterMode) {
                    onUpdateDateFilterMode(folder.id, opt.value);
                  }
                }}
                className={`flex-1 px-2 py-2 text-[11px] font-heading font-medium tracking-wide rounded-lg border transition-colors ${
                  folder.dateFilterMode === opt.value
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                }`}
                title={opt.description}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-heading tracking-wide">
            {modeOptions.find((o) => o.value === folder.dateFilterMode)?.description}
          </p>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Content filter</label>
          <input
            type="text"
            value={promptHint}
            onChange={(e) => setPromptHint(e.target.value)}
            onBlur={() => {
              if (promptHint.trim() !== (folder.promptHint || "")) {
                onUpdatePromptHint(folder.id, promptHint.trim());
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (promptHint.trim() !== (folder.promptHint || "")) {
                  onUpdatePromptHint(folder.id, promptHint.trim());
                }
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="e.g. only exhibitions, only concerts"
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground mt-1 font-heading tracking-wide">Tells the scraper what to extract</p>
        </div>

        <div className="mb-5">
          <label className={labelClass}>Sources ({folder.sources.length})</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto mb-3">
            {folder.sources.length === 0 && (
              <p className="text-xs text-muted-foreground font-heading py-4 text-center tracking-wide">No sources yet.</p>
            )}
            {folder.sources.map((src) => (
              <div key={src.url} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary border border-border group">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-heading font-medium text-foreground truncate">{src.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{src.url}</p>
                </div>
                <input
                  type="text"
                  value={src.category || ""}
                  onChange={(e) => onUpdateSourceCategory(src.url, e.target.value)}
                  placeholder="tag"
                  list={`cat-${src.url}`}
                  className="w-16 shrink-0 px-2 py-1 text-[10px] bg-transparent text-foreground rounded-md border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
                />
                {existingCategories.length > 0 && (
                  <datalist id={`cat-${src.url}`}>
                    {existingCategories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                )}
                <button onClick={() => onRemoveSource(src.url)} className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors" aria-label={`Remove ${src.name}`}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
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
              list="edit-new-cat"
              className="w-16 shrink-0 px-3 py-2.5 text-xs bg-transparent text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
            />
            {existingCategories.length > 0 && (
              <datalist id="edit-new-cat">
                {existingCategories.map((c) => <option key={c} value={c} />)}
              </datalist>
            )}
            <button onClick={handleAddSource} disabled={!newUrl.trim()} className="px-3 py-2.5 text-xs font-heading font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={handleDelete}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-heading font-medium tracking-wide rounded-lg transition-colors ${
              confirmDelete ? "bg-destructive text-destructive-foreground" : "text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            }`}
          >
            <Trash2 size={12} />
            {confirmDelete ? "Confirm" : "Delete"}
          </button>
          <button onClick={onClose} className="px-5 py-2 text-xs font-heading font-medium tracking-wide rounded-lg bg-secondary text-foreground hover:bg-accent transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
