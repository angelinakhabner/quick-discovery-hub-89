import type { Source } from "@/lib/mock-data";

interface VenueFilterProps {
  sources: Source[];
  selected: string | null;
  onChange: (category: string | null) => void;
}

const VenueFilter = ({ sources, selected, onChange }: VenueFilterProps) => {
  // Derive unique categories from sources
  const categories = Array.from(
    new Set(sources.map((s) => s.category).filter(Boolean))
  ) as string[];

  if (categories.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-heading font-medium rounded-full border transition-colors ${
          selected === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-foreground border-border hover:border-primary/40"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-heading font-medium rounded-full border transition-colors ${
            selected === cat
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/40"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default VenueFilter;
