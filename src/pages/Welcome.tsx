import { useNavigate } from "react-router-dom";
import { Sparkles, Folder, Clock, Plus } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-xl mx-auto px-5 pt-12 sm:pt-16 pb-12 sm:pb-20 flex flex-col items-center text-center flex-1">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <Sparkles size={32} className="text-primary" />
          <h1 className="font-heading font-bold text-4xl tracking-tight text-foreground">
            Whatsön
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-foreground font-body text-lg leading-relaxed mb-12 max-w-md">
          Your personal event feed. Aggregate listings from cinemas, theatres, clubs, and job boards — all in one place.
        </p>

        {/* Features */}
        <div className="grid gap-6 w-full max-w-sm text-left mb-12">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Folder size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-foreground">Create topic folders</p>
              <p className="text-muted-foreground text-xs font-body">
                Group your favourite venues and sources into folders like "leisure" or "NGO jobs".
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-foreground">Filter by time</p>
              <p className="text-muted-foreground text-xs font-body">
                See what's on today, tomorrow, or in the next 3 days at a glance.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm text-foreground">Add your own sources</p>
              <p className="text-muted-foreground text-xs font-body">
                Paste any URL — event listings, job boards, blogs — and we'll pull the data for you.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/auth")}
            className="w-full py-3 text-sm font-heading font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get started
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="w-full py-3 text-sm font-heading font-medium rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
