import type { Folder, TimeFilter } from "@/lib/mock-data";

interface FolderCardProps {
  folder: Folder;
  onTimeFilter: (folderId: string, filter: TimeFilter) => void;
  activeFilter?: { folderId: string; filter: TimeFilter } | null;
}

const timeButtons: { label: string; value: TimeFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Next 3 days", value: "next3days" },
];

const FolderCard = ({ folder, onTimeFilter, activeFilter }: FolderCardProps) => {
  const isActive = activeFilter?.folderId === folder.id;

  return (
    <div className="bg-card rounded-lg p-5 border border-border">
      <h3 className="font-heading font-semibold text-foreground text-lg mb-1">
        {folder.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 font-body">
        {folder.sources.length} source{folder.sources.length !== 1 ? "s" : ""}
      </p>
      <div className="flex gap-2">
        {timeButtons.map((btn) => {
          const isActiveBtn = isActive && activeFilter?.filter === btn.value;
          return (
            <button
              key={btn.value}
              onClick={() => onTimeFilter(folder.id, btn.value)}
              className={`px-3 py-1.5 text-sm font-heading font-medium rounded transition-colors ${
                isActiveBtn
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FolderCard;
