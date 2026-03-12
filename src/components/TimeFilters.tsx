import type { TimeFilter, DateFilterMode } from "@/lib/mock-data";

interface TimeFiltersProps {
  active: TimeFilter;
  onSelect: (filter: TimeFilter) => void;
  afterTime: string;
  onAfterTimeChange: (time: string) => void;
  mode: DateFilterMode;
}

const dailyButtons: { label: string; shortLabel: string; value: TimeFilter }[] = [
  { label: "Today", shortLabel: "Today", value: "today" },
  { label: "Tomorrow", shortLabel: "Tmrw", value: "tomorrow" },
  { label: "Next 3 days", shortLabel: "3 days", value: "next3days" },
];

const weeklyButtons: { label: string; shortLabel: string; value: TimeFilter }[] = [
  { label: "This week", shortLabel: "This wk", value: "thisweek" },
  { label: "Next week", shortLabel: "Next wk", value: "nextweek" },
];

const monthlyButtons: { label: string; shortLabel: string; value: TimeFilter }[] = [
  { label: "This month", shortLabel: "This mo", value: "thismonth" },
  { label: "Next month", shortLabel: "Next mo", value: "nextmonth" },
];

const buttonsByMode: Record<DateFilterMode, typeof dailyButtons> = {
  daily: dailyButtons,
  weekly: weeklyButtons,
  monthly: monthlyButtons,
};

const TimeFilters = ({ active, onSelect, afterTime, onAfterTimeChange, mode }: TimeFiltersProps) => {
  const buttons = buttonsByMode[mode];

  return (
    <div className="flex items-center gap-1.5 mb-6 flex-wrap">
      {buttons.map((btn) => (
        <button
          key={btn.value}
          onClick={() => onSelect(btn.value)}
          className={`px-3 py-1.5 text-[11px] font-heading font-medium tracking-wide rounded-full border transition-colors ${
            active === btn.value
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
          }`}
        >
          <span className="sm:hidden">{btn.shortLabel}</span>
          <span className="hidden sm:inline">{btn.label}</span>
        </button>
      ))}

      {mode === "daily" && (
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-muted-foreground font-heading tracking-wide uppercase">after</span>
          <input
            type="time"
            value={afterTime}
            onChange={(e) => onAfterTimeChange(e.target.value)}
            className="px-2 py-1 text-[11px] font-heading rounded-full border border-border bg-transparent text-foreground focus:border-foreground/40 focus:outline-none w-[5.5rem]"
          />
          {afterTime && (
            <button
              onClick={() => onAfterTimeChange("")}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeFilters;
