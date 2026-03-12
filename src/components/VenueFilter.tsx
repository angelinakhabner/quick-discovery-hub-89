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
    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 text-[11px] font-heading font-medium tracking-wide rounded-full border transition-colors ${
          selected === null
            ? "bg-foreground text-background border-foreground"
            : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={`px-3 py-1.5 text-[11px] font-heading font-medium tracking-wide rounded-full border transition-colors ${
            selected === cat
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default VenueFilter;
