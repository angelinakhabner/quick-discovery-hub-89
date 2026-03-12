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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-xl crossfade-enter">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-xl text-card-foreground">Edit Sources</h2>
            <p className="text-sm text-muted-foreground font-heading mt-0.5">{folderName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        {/* Source list */}
        <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
          {sources.length === 0 && (
            <p className="text-sm text-muted-foreground font-body py-4 text-center">No sources yet.</p>
          )}
          {sources.map((src) => (
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

        {/* Add new */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="example.com/events"
            className="flex-1 px-4 py-2.5 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleAdd}
            disabled={!newUrl.trim()}
            className="px-4 py-2.5 text-sm font-heading font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-sm font-heading font-medium rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export { EditSourcesModal };

// Compact inline source indicator with edit button
interface SourcesIndicatorProps {
  sources: Source[];
  onEdit: () => void;
}

export const SourcesIndicator = ({ sources, onEdit }: SourcesIndicatorProps) => (
  <button
    onClick={onEdit}
    className="flex items-center gap-1.5 px-3 py-1 text-xs font-heading text-muted-foreground hover:text-foreground rounded-full border border-border hover:border-primary/40 transition-colors mb-4 sm:mb-6"
  >
    <Settings2 size={12} />
    {sources.length} source{sources.length !== 1 ? "s" : ""}
  </button>
);
