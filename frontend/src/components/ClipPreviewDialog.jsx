import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media";

export const ClipPreviewDialog = ({ clip, open, onOpenChange, onDownload }) => {
  if (!clip) return null;
  const videoUrl = resolveMediaUrl(clip.video_url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border border-white/10" data-testid="clip-preview-dialog">
        <DialogHeader>
          <DialogTitle className="font-[Outfit]" data-testid="clip-preview-title">
            Prévia do corte
          </DialogTitle>
          <DialogDescription data-testid="clip-preview-description">
            Assista antes de baixar o arquivo final.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <video
            controls
            src={videoUrl}
            className="w-full rounded-2xl border border-white/10"
            data-testid="clip-preview-video"
          />
          <Button
            onClick={() => onDownload?.(clip)}
            className="pill-button bg-[var(--e1-secondary)] text-black"
            data-testid="clip-preview-download"
          >
            Baixar este corte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
