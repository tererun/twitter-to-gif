import type { MediaExtended } from "@/types/vxtwitter";

type Props = {
  media: MediaExtended[];
  selectedMedia: MediaExtended | null;
  onSelect: (media: MediaExtended) => void;
};

export function MediaSelector({ media, selectedMedia, onSelect }: Props) {
  if (media.length <= 1) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Select Media ({media.length} found)
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {media.map((m, i) => (
          <button
            key={i}
            onClick={() => onSelect(m)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              selectedMedia === m
                ? "border-blue-500 ring-2 ring-blue-500/50"
                : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
            }`}
          >
            <img
              src={m.thumbnail_url}
              alt={m.altText || `Media ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
