import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Play } from "lucide-react";
import { toast } from "sonner";

export const ClipCard = ({ clip, onPreview, onDownload, onEdit }) => {
  const handlePreview = () => {
    if (onPreview) {
      onPreview(clip);
      return;
    }
    toast("Prévia simulada", {
      description: "A prévia abriria o corte em um player dedicado.",
    });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(clip);
      return;
    }
    toast("Download simulado", {
      description: "O arquivo final estaria disponível aqui.",
    });
  };

  return (
    <Card
      className="glass-card p-4 flex flex-col gap-4"
      data-testid={`clip-card-${clip.id}`}
    >
      <div className="relative">
        <img
          src={clip.thumbnail_url}
          alt={clip.title}
          className="w-full h-40 object-cover rounded-xl"
          data-testid={`clip-thumbnail-${clip.id}`}
        />
        <Badge
          className="absolute top-3 right-3 bg-[var(--e1-secondary)] text-black"
          data-testid={`clip-viral-score-${clip.id}`}
        >
          Viral {clip.viral_score}/100
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        <h3
          className="font-[Outfit] text-lg"
          data-testid={`clip-title-${clip.id}`}
        >
          {clip.title}
        </h3>
        <p className="text-sm text-white/60" data-testid={`clip-caption-${clip.id}`}>
          {clip.caption}
        </p>
        <div className="text-xs font-mono text-white/50" data-testid={`clip-timestamp-${clip.id}`}>
          {clip.start_time}s → {clip.end_time}s · {clip.duration}s
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handlePreview}
          className="flex-1 bg-white/10 hover:bg-white/20"
          data-testid={`clip-preview-button-${clip.id}`}
        >
          <Play size={16} /> Prévia
        </Button>
        <Button
          onClick={handleDownload}
          className="flex-1 bg-[var(--e1-primary)] hover:bg-[var(--e1-primary)]/90"
          data-testid={`clip-download-button-${clip.id}`}
        >
          <Download size={16} /> Baixar
        </Button>
        {onEdit && (
          <Button
            onClick={() => onEdit(clip)}
            className="col-span-2 bg-white/5 hover:bg-white/10"
            data-testid={`clip-edit-button-${clip.id}`}
          >
            <Pencil size={16} /> Editar corte
          </Button>
        )}
      </div>
    </Card>
  );
};
