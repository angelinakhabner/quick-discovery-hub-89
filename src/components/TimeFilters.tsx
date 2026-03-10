import type { TimeFilter } from "@/lib/mock-data";

interface TimeFiltersProps {
  active: TimeFilter;
  onSelect: (filter: TimeFilter) => void;
}

const buttons: { label: string; value: TimeFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Next 3 days", value: "next3days" },
];

const TimeFilters = ({ active, onSelect }: TimeFiltersProps) => {
  return (
    <div className="flex gap-2 mb-6">
      {buttons.map((btn) => (
        <button
          key={btn.value}
          onClick={() => onSelect(btn.value)}
          className={`px-4 py-1.5 text-sm font-heading font-medium rounded-full border transition-colors ${
            active === btn.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/40"
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default TimeFilters;
