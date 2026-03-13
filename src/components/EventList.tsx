import { useCallback } from "react";
import { Printer } from "lucide-react";
import type { ResultItem } from "@/lib/mock-data";

interface EventListProps {
  results: ResultItem[];
}

const EventList = ({ results }: EventListProps) => {
  const handlePrint = useCallback(() => {
    const rows = results.map((item) => {
      let line = `${item.time}  ${item.title}`;
      if (item.venue) line += `  —  ${item.venue}`;
      if (item.genre) line += `  [${item.genre}]`;
      if (item.description) line += `\n    ${item.description}`;
      if (item.director) line += `\n    Dir. ${item.director}`;
      if (item.duration) line += `  |  ${item.duration}`;
      return line;
    }).join('\n\n');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Events</title><style>
      body { font-family: 'DM Sans', sans-serif; font-size: 11px; line-height: 1.7; padding: 32px; white-space: pre-wrap; color: #3a3a3a; }
    </style></head><body>${rows}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, [results]);

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-16 font-display text-xl italic">
        Nothing found for this period.
      </p>
    );
  }

  return (
    <div className="crossfade-enter">
      <div className="flex justify-end mb-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <Printer size={12} />
          Print
        </button>
      </div>

      <div className="space-y-0">
        {results.map((item, i) => (
          <div key={`${item.title}-${item.time}-${i}`} className="border-b border-border py-4 first:pt-0">
            {/* Header row */}
            <div className="flex items-baseline gap-2.5 mb-1.5">
              <span className="text-foreground font-heading font-semibold text-sm min-w-0 flex-1">
                {item.title}
              </span>

              {item.genre && (
                <span className="text-xs font-heading text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap hidden md:inline font-medium shrink-0">
                  {item.genre}
                </span>
              )}

              <span className="text-foreground font-heading text-sm font-medium whitespace-nowrap tabular-nums shrink-0">
                {item.time}
              </span>
            </div>

            {/* Venue & meta line */}
            <div className="flex items-center gap-2 text-xs font-heading text-muted-foreground mb-2.5">
              <span>{item.venue}</span>
              {item.duration && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span>{item.duration}</span>
                </>
              )}
              {item.genre && (
                <span className="md:hidden">
                  <span className="text-muted-foreground/30 mr-2">·</span>
                  {item.genre}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-foreground/70 leading-relaxed mb-2">
                {item.description}
              </p>
            )}

            {/* Credits */}
            {(item.director || item.cast) && (
              <div className="text-xs font-heading text-muted-foreground space-y-0.5">
                {item.director && (
                  <p><span className="font-semibold text-foreground/80">Dir.</span> {item.director}</p>
                )}
                {item.cast && (
                  <p><span className="font-semibold text-foreground/80">Cast:</span> {item.cast}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
