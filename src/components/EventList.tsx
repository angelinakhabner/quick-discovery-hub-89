import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ExternalLink, Calendar, Printer } from "lucide-react";
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

  const handlePrint = useCallback(() => {
    const rows = results.map((item) => {
      const genre = item.genre ? ` <span class="genre">[${item.genre}]</span>` : '';
      const venue = item.venue ? `<div class="venue">${item.venue}${item.duration ? ` · ${item.duration}` : ''}</div>` : '';
      const desc = item.description ? `<div class="desc">${item.description}</div>` : '';
      const director = item.director ? `<div class="credit"><b>Dir.</b> ${item.director}</div>` : '';
      const cast = item.cast ? `<div class="credit"><b>Cast:</b> ${item.cast}</div>` : '';
      return `<div class="event">
        <div class="header"><span class="title">${item.title}${genre}</span><span class="time">${item.time}</span></div>
        ${venue}${desc}${director}${cast}
      </div>`;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Events</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; color: #3a3a3a; padding: 28px 32px; }
      .event { border-bottom: 1px solid #e8e4df; padding: 12px 0; }
      .event:first-child { padding-top: 0; }
      .header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 2px; }
      .title { font-weight: 600; font-size: 12px; }
      .genre { font-weight: 500; color: #6b7a5a; font-size: 10px; }
      .time { font-size: 12px; font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums; }
      .venue { font-size: 10px; color: #888; margin-bottom: 4px; }
      .desc { font-size: 11px; line-height: 1.6; color: #555; margin: 4px 0; }
      .credit { font-size: 10px; color: #888; }
      .credit b { color: #555; }
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
      <div className="flex justify-end mb-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <Printer size={12} />
          Print
        </button>
      </div>
      {results.map((item, i) => {
        const isOpen = expandedIndex === i;
        return (
          <div key={`${item.title}-${item.time}-${i}`} className="border-b border-border">
            <div
              className="flex items-center gap-2.5 py-3.5 cursor-pointer group"
              onClick={() => setExpandedIndex(isOpen ? null : i)}
            >
              <ChevronDown
                size={14}
                className={`text-muted-foreground group-hover:text-foreground transition-all shrink-0 ${isOpen ? "rotate-180" : ""}`}
              />

              <span className="text-foreground font-heading font-medium text-sm min-w-0 flex-1 truncate">
                {item.title}
              </span>

              {item.genre && (
                <span className="text-xs font-heading text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap hidden md:inline font-medium">
                  {item.genre}
                </span>
              )}

              <span className="text-foreground font-heading text-sm font-medium whitespace-nowrap tabular-nums">
                {item.time}
              </span>

              <span className="text-muted-foreground font-heading text-sm whitespace-nowrap hidden sm:inline">
                {item.venue}
              </span>
            </div>

            {item.description && (
              <p className="text-xs text-muted-foreground leading-relaxed truncate pl-5 -mt-1 mb-1 max-w-[85%]">
                {item.description}
              </p>
            )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarOpenIndex(calendarOpenIndex === i ? null : i);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-heading font-medium rounded-full border border-border text-foreground hover:border-primary/40 transition-colors"
                  >
                    <Calendar size={11} />
                    <span className="hidden sm:inline">Cal</span>
                    <ChevronDown size={10} className={`transition-transform ${calendarOpenIndex === i ? "rotate-180" : ""}`} />
                  </button>
                  {calendarOpenIndex === i && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px] crossfade-enter">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadICS(item);
                          setCalendarOpenIndex(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-heading text-foreground hover:bg-secondary transition-colors"
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
                            className="block w-full text-left px-3 py-2 text-xs font-heading text-foreground hover:bg-secondary transition-colors"
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
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-heading font-medium rounded-full bg-primary text-primary-foreground hover:opacity-95 transition-opacity"
                >
                  <span className="hidden sm:inline">Reserve</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {isOpen && (
              <div className="pl-7 pr-2 pb-5 crossfade-enter">
                <div className="flex items-center gap-2 mb-2 sm:hidden">
                  <span className="text-xs font-heading text-muted-foreground">{item.venue}</span>
                  {item.genre && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs font-heading text-muted-foreground">{item.genre}</span>
                    </>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {item.description || "No description."}
                  </p>

                  <div className="text-xs font-heading space-y-1.5 text-muted-foreground sm:text-right sm:min-w-[160px]">
                    {item.director && (
                      <p><span className="font-semibold text-foreground">Dir.</span> {item.director}</p>
                    )}
                    {item.cast && (
                      <p><span className="font-semibold text-foreground">Cast:</span> {item.cast}</p>
                    )}
                    {item.duration && (
                      <p><span className="font-semibold text-foreground">Duration:</span> {item.duration}</p>
                    )}
                    <p><span className="font-semibold text-foreground">Date:</span> {item.date}</p>
                    <p className="hidden sm:block"><span className="font-semibold text-foreground">Venue:</span> {item.venue}</p>
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