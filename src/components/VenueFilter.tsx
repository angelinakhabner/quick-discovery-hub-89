import type { Source } from "@/lib/mock-data";

interface VenueFilterProps {
  sources: Source[];
  selected: string | null;
  onChange: (category: string | null) => void;
}

const VenueFilter = ({ sources, selected, onChange }: VenueFilterProps) => {
  const categories = Array.from(
    new Set(sources.map((s) => s.category).filter(Boolean))
  ) as string[];

  if (categories.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={`px-3.5 py-1.5 text-sm font-heading font-medium rounded-full transition-all ${
          selected === null
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-card text-foreground border border-border hover:border-primary/40"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={`px-3.5 py-1.5 text-sm font-heading font-medium rounded-full transition-all ${
            selected === cat
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-foreground border border-border hover:border-primary/40"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default VenueFilter;
