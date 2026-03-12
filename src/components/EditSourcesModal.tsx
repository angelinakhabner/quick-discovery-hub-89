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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-xl p-6 w-full max-w-md mx-4 border border-border crossfade-enter">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">Edit Sources</h2>
            <p className="text-xs text-muted-foreground font-heading mt-0.5 tracking-wide">{folderName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        <div className="space-y-1.5 mb-5 max-h-60 overflow-y-auto">
          {sources.length === 0 && (
            <p className="text-xs text-muted-foreground font-heading py-6 text-center tracking-wide">No sources yet.</p>
          )}
          {sources.map((src) => (
            <div
              key={src.url}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-secondary border border-border group"
            >
              <div className="min-w-0">
                <p className="text-xs font-heading font-medium text-foreground truncate">{src.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{src.url}</p>
              </div>
              <button
                onClick={() => onRemoveSource(src.url)}
                className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${src.name}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="example.com/events"
            className="flex-1 px-3 py-2.5 text-xs bg-transparent text-foreground rounded-lg border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
          />
          <button
            onClick={handleAdd}
            disabled={!newUrl.trim()}
            className="px-3 py-2.5 text-xs font-heading font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-xs font-heading font-medium tracking-wide rounded-lg bg-secondary text-foreground hover:bg-accent transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export { EditSourcesModal };

interface SourcesIndicatorProps {
  sources: Source[];
  onEdit: () => void;
}

export const SourcesIndicator = ({ sources, onEdit }: SourcesIndicatorProps) => (
  <button
    onClick={onEdit}
    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-heading font-medium tracking-wide text-muted-foreground hover:text-foreground rounded-full border border-border hover:border-foreground/30 transition-colors mb-4"
  >
    <Settings2 size={11} />
    {sources.length} source{sources.length !== 1 ? "s" : ""}
  </button>
);
