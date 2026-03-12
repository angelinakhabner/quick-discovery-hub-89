import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Source } from "@/lib/mock-data";

interface SourcesBarProps {
  sources: Source[];
  onAddSource: (url: string) => void;
  onRemoveSource: (url: string) => void;
}

const SourcesBar = ({ sources, onAddSource, onRemoveSource }: SourcesBarProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onAddSource(trimmed);
    setNewUrl("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Escape") {
      setIsAdding(false);
      setNewUrl("");
    }
  };

  return (
    <div className="mb-4 sm:mb-6">
      <p className="text-xs font-heading font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Sources
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {sources.map((src) => (
          <span
            key={src.url}
            className="group flex items-center gap-1 px-2.5 py-1 text-xs font-heading rounded-full bg-muted text-muted-foreground"
          >
            {src.name}
            <button
              onClick={() => onRemoveSource(src.url)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${src.name}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {isAdding ? (
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newUrl.trim()) setIsAdding(false);
            }}
            placeholder="example.com/events"
            autoFocus
            className="px-2.5 py-1 text-xs font-heading rounded-full border border-primary/40 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-40 sm:w-48"
          />
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-0.5 px-2.5 py-1 text-xs font-heading rounded-full border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
          >
            <Plus size={10} />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default SourcesBar;
