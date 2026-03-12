import type { TimeFilter } from "@/lib/mock-data";

interface TimeFiltersProps {
  active: TimeFilter;
  onSelect: (filter: TimeFilter) => void;
}

const buttons: { label: string; shortLabel: string; value: TimeFilter }[] = [
  { label: "Today", shortLabel: "Today", value: "today" },
  { label: "Tomorrow", shortLabel: "Tomorrow", value: "tomorrow" },
  { label: "Next 3 days", shortLabel: "3 days", value: "next3days" },
];

const TimeFilters = ({ active, onSelect }: TimeFiltersProps) => {
  return (
    <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
      {buttons.map((btn) => (
        <button
          key={btn.value}
          onClick={() => onSelect(btn.value)}
          className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-heading font-medium rounded-full border transition-colors ${
            active === btn.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/40"
          }`}
        >
          <span className="sm:hidden">{btn.shortLabel}</span>
          <span className="hidden sm:inline">{btn.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TimeFilters;
