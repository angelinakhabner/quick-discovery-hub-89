import { useState } from "react";
import type { Folder, TimeFilter, ResultItem } from "@/lib/mock-data";
import { getMockResults } from "@/lib/mock-data";
import ResultsList from "./ResultsList";

interface FolderDetailProps {
  folder: Folder;
  onBack: () => void;
}

const timeButtons: { label: string; value: TimeFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Next 3 days", value: "next3days" },
];

const FolderDetail = ({ folder, onBack }: FolderDetailProps) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);

  const handleFilter = (filter: TimeFilter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
      setResults([]);
      return;
    }
    setActiveFilter(filter);
    setResults(getMockResults(folder.id, filter));
  };

  return (
    <div className="crossfade-enter">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-muted-foreground font-heading text-sm hover:text-foreground transition-colors"
        >
          ← back
        </button>
        <h2 className="font-heading font-bold text-xl text-foreground">{folder.name}</h2>
      </div>

      {/* Sources */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground font-heading mb-2">
          {folder.sources.length} source{folder.sources.length !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {folder.sources.map((src) => (
            <span
              key={src.url}
              className="px-3 py-1 text-xs font-heading rounded-full bg-muted text-muted-foreground"
            >
              {src.name}
            </span>
          ))}
        </div>
      </div>

      {/* Time filters */}
      <div className="flex gap-2 mb-6">
        {timeButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleFilter(btn.value)}
            className={`px-4 py-2 text-sm font-heading font-medium rounded-full border-2 transition-colors ${
              activeFilter === btn.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {activeFilter && (
        <ResultsList
          results={results}
          folderName={folder.name}
          filter={activeFilter}
          onClose={() => {
            setActiveFilter(null);
            setResults([]);
          }}
        />
      )}
    </div>
  );
};

export default FolderDetail;
