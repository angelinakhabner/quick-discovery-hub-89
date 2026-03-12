import { useState, useRef, useEffect } from "react";
import { ChevronDown, ExternalLink, Calendar } from "lucide-react";
import type { ResultItem } from "@/lib/mock-data";
import { downloadICS, getGoogleCalendarUrl } from "@/lib/calendar";

interface EventListProps {
  results: ResultItem[];
}

const EventList = ({ results }: EventListProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [calendarOpenIndex, setCalendarOpenIndex] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground font-body text-center py-12">
        Nothing found for this period.
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
              className="flex items-center gap-2 sm:gap-3 py-3 cursor-pointer group"
              onClick={() => setExpandedIndex(isOpen ? null : i)}
            >
              {/* Expand toggle */}
              <ChevronDown
                size={14}
                className={`text-muted-foreground group-hover:text-foreground transition-all shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />

              {/* Title */}
              <span className="text-foreground font-body font-medium text-sm sm:text-base min-w-0 flex-1 truncate">
                {item.title}
              </span>

              {/* Genre badge - desktop only */}
              {item.genre && (
                <span className="text-xs font-heading text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap hidden md:inline">
                  {item.genre}
                </span>
              )}

              {/* Time */}
              <span className="text-foreground font-heading text-xs sm:text-sm font-medium whitespace-nowrap">
                {item.time}
              </span>

              {/* Venue - desktop only */}
              <span className="text-muted-foreground font-heading text-sm whitespace-nowrap hidden sm:inline">
                {item.venue}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Calendar dropdown */}
                <div className="relative" ref={calendarOpenIndex === i ? calendarRef : undefined}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarOpenIndex(calendarOpenIndex === i ? null : i);
                    }}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-heading font-medium rounded-full border border-border text-foreground hover:border-primary/40 transition-colors whitespace-nowrap"
                  >
                    <Calendar size={10} />
                    <span className="hidden sm:inline">Calendar</span>
                    <ChevronDown size={10} className={`transition-transform ${calendarOpenIndex === i ? "rotate-180" : ""}`} />
                  </button>
                  {calendarOpenIndex === i && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] crossfade-enter">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadICS(item);
                          setCalendarOpenIndex(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-heading text-foreground hover:bg-muted transition-colors"
                      >
                        Apple / iCal
                      </button>
                      {(() => {
                        const gcalUrl = getGoogleCalendarUrl(item);
                        return gcalUrl ? (
                          <a
                            href={gcalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCalendarOpenIndex(null);
                            }}
                            className="block w-full text-left px-3 py-1.5 text-xs font-heading text-foreground hover:bg-muted transition-colors"
                          >
                            Google Calendar
                          </a>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Reserve button */}
                <a
                  href={item.sourceUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-heading font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Reserve</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="pl-6 sm:pl-8 pr-2 sm:pr-4 pb-4 sm:pb-5 crossfade-enter">
                {/* Mobile: venue + genre row */}
                <div className="flex items-center gap-2 mb-2 sm:hidden">
                  <span className="text-xs font-heading text-muted-foreground">{item.venue}</span>
                  {item.genre && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs font-heading text-muted-foreground">{item.genre}</span>
                    </>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  {/* Description */}
                  <p className="text-xs sm:text-sm font-body text-foreground/80 leading-relaxed">
                    {item.description || "No description."}
                  </p>

                  {/* Meta column */}
                  <div className="text-xs font-heading space-y-1 sm:space-y-1.5 text-muted-foreground sm:text-right sm:min-w-[160px]">
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
                    <p className="hidden sm:block">
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
