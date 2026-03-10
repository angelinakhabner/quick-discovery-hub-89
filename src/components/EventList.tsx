import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { ResultItem } from "@/lib/mock-data";

interface EventListProps {
  results: ResultItem[];
}

const EventList = ({ results }: EventListProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground font-body text-center py-12">
        Nothing found for this timeframe.
      </p>
    );
  }

  return (
    <div className="space-y-0 crossfade-enter">
      {results.map((item, i) => {
        const isOpen = expandedIndex === i;
        return (
          <div key={`${item.title}-${item.time}-${i}`} className="border-b border-border">
            {/* Main row */}
            <div className="flex items-center gap-3 py-3">
              {/* Expand toggle */}
              <button
                onClick={() => setExpandedIndex(isOpen ? null : i)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label={isOpen ? "Collapse" : "Expand"}
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Title */}
              <span className="text-foreground font-body font-medium text-base min-w-0 flex-1">
                {item.title}
              </span>

              {/* Time */}
              <span className="text-foreground font-heading text-sm font-medium whitespace-nowrap">
                {item.time}
              </span>

              {/* Venue */}
              <span className="text-muted-foreground font-heading text-sm whitespace-nowrap hidden sm:inline">
                {item.venue}
              </span>

              {/* Reserve button */}
              <button className="flex items-center gap-1 px-3 py-1 text-xs font-heading font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0">
                Reserve
                <ExternalLink size={10} />
              </button>
            </div>

            {/* Expanded info */}
            {isOpen && (
              <div className="pl-8 pb-4 crossfade-enter">
                <div className="text-sm space-y-1 text-muted-foreground font-body">
                  <p><span className="font-heading font-medium text-foreground">Venue:</span> {item.venue}</p>
                  <p><span className="font-heading font-medium text-foreground">Date:</span> {item.date}</p>
                  <p><span className="font-heading font-medium text-foreground">Time:</span> {item.time}</p>
                  <p className="pt-1 text-muted-foreground">
                    More details available on the venue's website.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EventList;
