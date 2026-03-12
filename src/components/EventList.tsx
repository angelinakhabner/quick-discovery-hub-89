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
      <p className="text-muted-foreground font-serif-display italic text-center py-16 text-lg">
        Nothing found for this period.
      </p>
    );
  }

  return (
    <div className="crossfade-enter">
      {results.map((item, i) => {
        const isOpen = expandedIndex === i;
        return (
          <div key={`${item.title}-${item.time}-${i}`} className="border-b border-border">
            {/* Main row */}
            <div
              className="flex items-center gap-3 py-3.5 cursor-pointer group"
              onClick={() => setExpandedIndex(isOpen ? null : i)}
            >
              <ChevronDown
                size={12}
                className={`text-muted-foreground group-hover:text-foreground transition-all shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />

              <span className="text-foreground font-heading font-medium text-sm min-w-0 flex-1 truncate">
                {item.title}
              </span>

              {item.genre && (
                <span className="text-[10px] font-heading text-muted-foreground bg-secondary px-2 py-0.5 rounded-full whitespace-nowrap hidden md:inline tracking-wide">
                  {item.genre}
                </span>
              )}

              <span className="text-foreground font-heading text-xs font-medium whitespace-nowrap tabular-nums">
                {item.time}
              </span>

              <span className="text-muted-foreground font-heading text-xs whitespace-nowrap hidden sm:inline">
                {item.venue}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="relative" ref={calendarOpenIndex === i ? calendarRef : undefined}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarOpenIndex(calendarOpenIndex === i ? null : i);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-heading font-medium tracking-wide rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <Calendar size={10} />
                    <span className="hidden sm:inline">Cal</span>
                    <ChevronDown size={8} className={`transition-transform ${calendarOpenIndex === i ? "rotate-180" : ""}`} />
                  </button>
                  {calendarOpenIndex === i && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[140px] crossfade-enter">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadICS(item);
                          setCalendarOpenIndex(null);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] font-heading text-foreground hover:bg-secondary transition-colors"
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
                            className="block w-full text-left px-3 py-2 text-[11px] font-heading text-foreground hover:bg-secondary transition-colors"
                          >
                            Google Calendar
                          </a>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                <a
                  href={item.sourceUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-heading font-medium tracking-wide rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  <span className="hidden sm:inline">Reserve</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="pl-7 pr-2 pb-5 crossfade-enter">
                <div className="flex items-center gap-2 mb-2 sm:hidden">
                  <span className="text-[11px] font-heading text-muted-foreground">{item.venue}</span>
                  {item.genre && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-[11px] font-heading text-muted-foreground">{item.genre}</span>
                    </>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <p className="text-sm font-serif-display text-foreground/70 leading-relaxed">
                    {item.description || "No description."}
                  </p>

                  <div className="text-[11px] font-heading space-y-1.5 text-muted-foreground sm:text-right sm:min-w-[160px]">
                    {item.director && (
                      <p>
                        <span className="text-foreground/60">Dir.</span> {item.director}
                      </p>
                    )}
                    {item.cast && (
                      <p>
                        <span className="text-foreground/60">Cast:</span> {item.cast}
                      </p>
                    )}
                    {item.duration && (
                      <p>
                        <span className="text-foreground/60">Duration:</span> {item.duration}
                      </p>
                    )}
                    <p>
                      <span className="text-foreground/60">Date:</span> {item.date}
                    </p>
                    <p className="hidden sm:block">
                      <span className="text-foreground/60">Venue:</span> {item.venue}
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
