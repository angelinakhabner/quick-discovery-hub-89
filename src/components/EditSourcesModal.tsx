import { useState } from "react";
import { Plus, X, Settings2 } from "lucide-react";
import type { Source } from "@/lib/mock-data";

interface EditSourcesModalProps {
  folderName: string;
  sources: Source[];
  onAddSource: (url: string) => void;
  onRemoveSource: (url: string) => void;
  onClose: () => void;
}

const EditSourcesModal = ({ folderName, sources, onAddSource, onRemoveSource, onClose }: EditSourcesModalProps) => {
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onAddSource(trimmed);
    setNewUrl("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-xl border border-border crossfade-enter">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-foreground">Edit Sources</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{folderName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        <div className="space-y-1.5 mb-5 max-h-60 overflow-y-auto">
          {sources.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No sources yet.</p>}
          {sources.map((src) => (
            <div key={src.url} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-background border border-border group">
              <div className="min-w-0">
                <p className="text-sm font-heading font-medium text-foreground truncate">{src.name}</p>
                <p className="text-xs text-muted-foreground truncate">{src.url}</p>
              </div>
              <button onClick={() => onRemoveSource(src.url)} className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"><X size={14} /></button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }} placeholder="example.com/events"
            className="flex-1 px-4 py-3 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" />
          <button onClick={handleAdd} disabled={!newUrl.trim()} className="px-4 py-3 text-sm font-heading font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-40"><Plus size={16} /></button>
        </div>

        <div className="mt-6">
          <button onClick={onClose} className="w-full px-4 py-3 text-sm font-heading font-medium rounded-full bg-secondary text-foreground hover:bg-muted transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
};

export { EditSourcesModal };

interface SourcesIndicatorProps { sources: Source[]; onEdit: () => void; }

export const SourcesIndicator = ({ sources, onEdit }: SourcesIndicatorProps) => (
  <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-medium text-muted-foreground hover:text-foreground rounded-full border border-border hover:border-primary/40 transition-colors mb-4">
    <Settings2 size={12} />
    {sources.length} source{sources.length !== 1 ? "s" : ""}
  </button>
);
