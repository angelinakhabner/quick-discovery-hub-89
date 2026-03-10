import type { Folder } from "@/lib/mock-data";

interface HeroCardProps {
  folders: Folder[];
  onFolderClick: (folderId: string) => void;
  onAddMore: () => void;
  activeFolderId?: string | null;
}

const HeroCard = ({ folders, onFolderClick, onAddMore, activeFolderId }: HeroCardProps) => {
  return (
    <div className="relative bg-primary rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[440px]">
      {/* Decorative flower */}
      <svg
        className="absolute right-0 top-0 h-full w-[55%] opacity-90"
        viewBox="0 0 400 500"
        fill="none"
        preserveAspectRatio="xMaxYMid slice"
      >
        <ellipse cx="320" cy="250" rx="180" ry="220" fill="hsl(var(--secondary))" />
        <path d="M200 250 Q260 100 320 250 Q260 400 200 250Z" fill="hsl(var(--primary))" />
        <path d="M320 80 Q380 200 320 250 Q260 200 320 80Z" fill="hsl(var(--primary))" />
        <path d="M420 150 Q360 220 320 250 Q360 280 420 350" stroke="hsl(var(--primary))" strokeWidth="40" fill="hsl(var(--primary))" />
        <path d="M320 250 Q280 320 220 420" stroke="hsl(var(--primary))" strokeWidth="35" fill="none" strokeLinecap="round" />
      </svg>

      {/* Content */}
      <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full min-h-[380px] sm:min-h-[440px]">
        {/* Title */}
        <h1 className="font-heading font-bold text-5xl sm:text-7xl text-primary-foreground tracking-tight mb-8 sm:mb-12">
          Whatsön
        </h1>

        {/* Folder chips */}
        <div className="flex flex-wrap gap-3 mb-auto">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderClick(folder.id)}
              className={`px-5 py-2 text-sm sm:text-base font-heading font-medium rounded-full border-2 border-primary-foreground transition-all ${
                activeFolderId === folder.id
                  ? "bg-primary-foreground text-primary"
                  : "bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {folder.name}
            </button>
          ))}
        </div>

        {/* Add more starburst */}
        <div className="mt-6">
          <button
            onClick={onAddMore}
            className="relative group"
            aria-label="Add more folders"
          >
            <svg width="90" height="90" viewBox="0 0 90 90" className="transition-transform group-hover:scale-110">
              {/* Starburst rays */}
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i * 20) * Math.PI / 180;
                const x1 = 45 + Math.cos(angle) * 18;
                const y1 = 45 + Math.sin(angle) * 18;
                const x2 = 45 + Math.cos(angle) * 42;
                const y2 = 45 + Math.sin(angle) * 42;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="hsl(var(--accent))"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                );
              })}
              <circle cx="45" cy="45" r="18" fill="hsl(var(--accent))" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-heading font-bold text-accent-foreground">
              add more
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
