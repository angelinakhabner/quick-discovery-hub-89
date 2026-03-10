import { useState } from "react";

interface NewFolderFormProps {
  onCreateFolder: (name: string, urls: string[]) => void;
  onCancel: () => void;
}

const NewFolderForm = ({ onCreateFolder, onCancel }: NewFolderFormProps) => {
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
    <div className="bg-card rounded-lg p-5 border border-border crossfade-enter">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          autoFocus
          className="w-full px-3 py-2 text-sm bg-background text-foreground rounded border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={"Paste URLs, one per line\ne.g. example.com"}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-background text-foreground rounded border border-border font-heading placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-1.5 text-sm font-heading font-medium rounded bg-primary text-primary-foreground"
          >
            Create
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm font-heading font-medium rounded bg-secondary text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewFolderForm;
