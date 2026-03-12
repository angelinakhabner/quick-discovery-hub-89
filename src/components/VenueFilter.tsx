const venueCategories: { label: string; venues: string[] }[] = [
  { label: "Cinema", venues: ["Kino Muranów", "Kinoteka", "Kino Iluzjon"] },
  { label: "Theatre", venues: ["Teatr Powszechny", "Teatr Dramatyczny", "Teatr Żydowski"] },
  { label: "Other", venues: ["Klub Komediowy", "Jassmine Jazz Club"] },
];

interface VenueFilterProps {
  selected: string | null; // category label or null for all
  onChange: (category: string | null) => void;
}

const VenueFilter = ({ selected, onChange }: VenueFilterProps) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
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
      {venueCategories.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onChange(selected === cat.label ? null : cat.label)}
          className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-heading font-medium rounded-full border transition-colors ${
            selected === cat.label
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/40"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export { venueCategories };
export default VenueFilter;
