import type { ResultItem, TimeFilter } from "@/lib/mock-data";

interface ResultsListProps {
  results: ResultItem[];
  folderName: string;
  filter: TimeFilter;
  onClose: () => void;
}

const filterLabels: Record<TimeFilter, string> = {
  today: "Dziś",
  tomorrow: "Jutro",
  next3days: "Najbliższe 3 dni",
};

const ResultsList = ({ results, folderName, filter, onClose }: ResultsListProps) => {
  return (
    <div className="crossfade-enter">
      <div className="flex items-center gap-3 mb-6">
        <span className="px-3 py-1.5 text-sm font-heading font-medium rounded bg-primary text-primary-foreground">
          {filterLabels[filter]}
        </span>
        <span className="text-muted-foreground font-heading text-sm">{folderName}</span>
        <button
          onClick={onClose}
          className="ml-auto text-muted-foreground font-heading text-sm px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="space-y-0">
        {results.map((item, i) => (
          <div
            key={`${item.title}-${item.time}-${i}`}
            className="py-3 border-b border-border last:border-b-0"
          >
            <div className="flex items-baseline gap-4">
              <span className="text-primary font-body font-medium text-base min-w-0 flex-1">
                {item.title}
              </span>
              <span className="text-muted-foreground font-heading text-sm whitespace-nowrap">
                {item.venue}
              </span>
              <span className="text-foreground font-heading text-sm font-medium whitespace-nowrap">
                {item.time}
              </span>
              <span className="text-muted-foreground font-heading text-xs whitespace-nowrap">
                {item.date}
              </span>
            </div>
            {item.description && (
              <p className="text-muted-foreground font-body text-sm mt-1.5 leading-relaxed">
                {item.description}
                {item.director && <span className="text-muted-foreground/70"> · Dir: {item.director}</span>}
                {item.duration && <span className="text-muted-foreground/70"> · {item.duration}</span>}
                {item.genre && <span className="text-muted-foreground/70"> · {item.genre}</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-muted-foreground font-body text-center py-8">
          Nothing found for this timeframe.
        </p>
      )}
    </div>
  );
};

export default ResultsList;
