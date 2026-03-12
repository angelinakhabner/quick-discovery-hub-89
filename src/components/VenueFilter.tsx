import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type VenueCategory = {
  label: string;
  venues: string[];
};

const venueCategories: VenueCategory[] = [
  {
    label: "Cinema",
    venues: ["Kino Muranów", "Kinoteka", "Kino Iluzjon"],
  },
  {
    label: "Theatre",
    venues: ["Teatr Powszechny", "Teatr Dramatyczny", "Teatr Żydowski"],
  },
  {
    label: "Other",
    venues: ["Klub Komediowy", "Jassmine Jazz Club"],
  },
];

interface VenueFilterProps {
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

const VenueFilter = ({ selected, onChange }: VenueFilterProps) => {
  const [open, setOpen] = useState(false);

  const allVenues = venueCategories.flatMap((c) => c.venues);
  const isAll = selected.size === 0;

  const toggleVenue = (venue: string) => {
    const next = new Set(selected);
    if (next.has(venue)) {
      next.delete(venue);
    } else {
      next.add(venue);
    }
    onChange(next);
  };

  const toggleCategory = (venues: string[]) => {
    const allSelected = venues.every((v) => selected.has(v));
    const next = new Set(selected);
    if (allSelected) {
      venues.forEach((v) => next.delete(v));
    } else {
      venues.forEach((v) => next.add(v));
    }
    onChange(next);
  };

  const setAll = () => onChange(new Set());

  const activeLabel = isAll
    ? "All venues"
    : selected.size === 1
      ? [...selected][0]
      : `${selected.size} venues`;

  return (
    <div className="relative mb-4 sm:mb-6">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-heading font-medium rounded-full border transition-colors ${
          isAll
            ? "bg-card text-foreground border-border hover:border-primary/40"
            : "bg-primary text-primary-foreground border-primary"
        }`}
      >
        {activeLabel}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-2 min-w-[200px] crossfade-enter">
            {/* All */}
            <button
              onClick={() => { setAll(); setOpen(false); }}
              className={`w-full text-left px-4 py-1.5 text-sm font-heading transition-colors ${
                isAll ? "text-primary font-semibold" : "text-foreground hover:bg-muted"
              }`}
            >
              All venues
            </button>

            <div className="border-t border-border my-1" />

            {venueCategories.map((cat) => {
              const catSelected = cat.venues.every((v) => selected.has(v));
              const catPartial = cat.venues.some((v) => selected.has(v)) && !catSelected;

              return (
                <div key={cat.label}>
                  <button
                    onClick={() => toggleCategory(cat.venues)}
                    className={`w-full text-left px-4 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider transition-colors ${
                      catSelected
                        ? "text-primary"
                        : catPartial
                          ? "text-primary/60"
                          : "text-muted-foreground"
                    } hover:bg-muted`}
                  >
                    {cat.label}
                  </button>
                  {cat.venues.map((venue) => (
                    <button
                      key={venue}
                      onClick={() => toggleVenue(venue)}
                      className={`w-full text-left px-6 py-1 text-sm font-heading transition-colors ${
                        selected.has(venue)
                          ? "text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="mr-2 inline-block w-3 text-center text-xs">
                        {selected.has(venue) ? "✓" : ""}
                      </span>
                      {venue}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default VenueFilter;
