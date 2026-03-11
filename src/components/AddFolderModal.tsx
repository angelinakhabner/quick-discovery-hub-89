import { useState } from "react";

interface AddFolderModalProps {
  onCreateFolder: (name: string, urls: string[]) => void;
  onClose: () => void;
}

const AddFolderModal = ({ onCreateFolder, onClose }: AddFolderModalProps) => {
  const [name, setName] = useState("");
  const [urls, setUrls] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedUrls = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    onCreateFolder(name.trim(), parsedUrls);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-xl crossfade-enter">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-xl text-card-foreground">Nowy folder</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-medium text-card-foreground mb-1">
              Nazwa tematu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Jazz w Warszawie"
              autoFocus
              className="w-full px-4 py-3 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-medium text-card-foreground mb-1">
              Sources (one URL per line)
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder={"jassmine.pl\nklubkomediowy.pl\nmuranow.waw.pl"}
              rows={4}
              className="w-full px-4 py-3 text-sm bg-background text-foreground rounded-xl border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-sm font-heading font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
            >
              Create folder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-sm font-heading font-medium rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;
