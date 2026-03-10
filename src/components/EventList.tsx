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
            <div
              className="flex items-center gap-3 py-3 cursor-pointer group"
              onClick={() => setExpandedIndex(isOpen ? null : i)}
            >
              {/* Expand toggle */}
              <ChevronDown
                size={14}
                className={`text-muted-foreground group-hover:text-foreground transition-all shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />

              {/* Title */}
              <span className="text-foreground font-body font-medium text-base min-w-0 flex-1">
                {item.title}
              </span>

              {/* Genre badge */}
              {item.genre && (
                <span className="text-xs font-heading text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline">
                  {item.genre}
                </span>
              )}

              {/* Time */}
              <span className="text-foreground font-heading text-sm font-medium whitespace-nowrap">
                {item.time}
              </span>

              {/* Venue */}
              <span className="text-muted-foreground font-heading text-sm whitespace-nowrap hidden sm:inline">
                {item.venue}
              </span>

              {/* Reserve button */}
              <a
                href={item.sourceUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-3 py-1 text-xs font-heading font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
              >
                Reserve
                <ExternalLink size={10} />
              </a>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="pl-8 pr-4 pb-5 crossfade-enter">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  {/* Description */}
                  <p className="text-sm font-body text-foreground/80 leading-relaxed">
                    {item.description || "No description available."}
                  </p>

                  {/* Meta column */}
                  <div className="text-xs font-heading space-y-1.5 text-muted-foreground sm:text-right sm:min-w-[160px]">
                    {item.director && (
                      <p>
                        <span className="font-medium text-foreground">Dir.</span> {item.director}
                      </p>
                    )}
                    {item.cast && (
                      <p>
                        <span className="font-medium text-foreground">Cast:</span> {item.cast}
                      </p>
                    )}
                    {item.duration && (
                      <p>
                        <span className="font-medium text-foreground">Duration:</span> {item.duration}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-foreground">Date:</span> {item.date}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Venue:</span> {item.venue}
                    </p>
                  </div>
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
