import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { resolveMediaUrl } from "@/lib/media";

export const ClipEditorDialog = ({ clip, job, open, onOpenChange, onSave }) => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [range, setRange] = useState([0, 0]);

  const maxRange = useMemo(() => {
    if (job?.duration) return job.duration;
    if (!clip) return 120;
    return Math.max(clip.end_time + 60, 120);
  }, [clip, job]);

  const highlight = useMemo(() => {
    if (!job?.duration) return { left: "0%", width: "0%" };
    const left = (range[0] / job.duration) * 100;
    const width = ((range[1] - range[0]) / job.duration) * 100;
    return { left: `${left}%`, width: `${width}%` };
  }, [range, job]);

  useEffect(() => {
    if (!clip) return;
    setTitle(clip.title);
    setCaption(clip.caption);
    setRange([clip.start_time, clip.end_time]);
  }, [clip]);

  const handleNudge = (delta, isStart) => {
    setRange((prev) => {
      const next = [...prev];
      if (isStart) {
        next[0] = Math.max(0, next[0] + delta);
      } else {
        next[1] = Math.min(maxRange, next[1] + delta);
      }
      if (next[1] <= next[0] + 1) {
        next[1] = next[0] + 1;
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!clip) return;
    onSave({
      title,
      caption,
      start_time: range[0],
      end_time: range[1],
    });
  };

  if (!clip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass-card border border-white/10"
        data-testid="clip-editor-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-[Outfit]" data-testid="clip-editor-title">
            Edição manual do corte
          </DialogTitle>
          <DialogDescription data-testid="clip-editor-description">
            Ajuste início, fim e legenda antes de exportar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {job?.waveform_url && (
            <div className="flex flex-col gap-2" data-testid="clip-editor-waveform-section">
              <div className="text-xs text-white/60" data-testid="clip-editor-waveform-label">
                Waveform do áudio
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={resolveMediaUrl(job.waveform_url)}
                  alt="Waveform"
                  className="w-full object-cover"
                  data-testid="clip-editor-waveform-image"
                />
                <div
                  className="absolute top-0 bottom-0 bg-[var(--e1-secondary)]/20 border border-[var(--e1-secondary)]"
                  style={highlight}
                  data-testid="clip-editor-waveform-highlight"
                />
              </div>
            </div>
          )}
          {job?.sprite_url && (
            <div className="flex flex-col gap-2" data-testid="clip-editor-sprite-section">
              <div className="text-xs text-white/60" data-testid="clip-editor-sprite-label">
                Thumbnails por frame
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={resolveMediaUrl(job.sprite_url)}
                  alt="Frames"
                  className="w-full object-cover"
                  data-testid="clip-editor-sprite-image"
                />
                <div
                  className="absolute top-0 bottom-0 bg-[var(--e1-primary)]/15 border border-[var(--e1-primary)]"
                  style={highlight}
                  data-testid="clip-editor-sprite-highlight"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70" data-testid="clip-editor-name-label">
              Título do corte
            </label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="bg-black/40 border-white/10"
              data-testid="clip-editor-title-input"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70" data-testid="clip-editor-caption-label">
              Legenda sugerida
            </label>
            <Textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="bg-black/40 border-white/10 min-h-[96px]"
              data-testid="clip-editor-caption-input"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span data-testid="clip-editor-range-label">Trecho selecionado</span>
              <span
                className="text-[var(--e1-secondary)]"
                data-testid="clip-editor-range-value"
              >
                {range[0]}s → {range[1]}s ({range[1] - range[0]}s)
              </span>
            </div>
            <Slider
              value={range}
              onValueChange={setRange}
              min={0}
              max={maxRange}
              step={1}
              className="[&_[role=slider]]:bg-[var(--e1-primary)]"
              data-testid="clip-editor-range-slider"
            />
            <div className="flex flex-wrap gap-2 text-xs">
              <Button
                variant="ghost"
                className="bg-white/5 hover:bg-white/10"
                onClick={() => handleNudge(-1, true)}
                data-testid="clip-editor-start-minus"
              >
                -1s início
              </Button>
              <Button
                variant="ghost"
                className="bg-white/5 hover:bg-white/10"
                onClick={() => handleNudge(1, true)}
                data-testid="clip-editor-start-plus"
              >
                +1s início
              </Button>
              <Button
                variant="ghost"
                className="bg-white/5 hover:bg-white/10"
                onClick={() => handleNudge(-1, false)}
                data-testid="clip-editor-end-minus"
              >
                -1s fim
              </Button>
              <Button
                variant="ghost"
                className="bg-white/5 hover:bg-white/10"
                onClick={() => handleNudge(1, false)}
                data-testid="clip-editor-end-plus"
              >
                +1s fim
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="pill-button bg-[var(--e1-primary)] text-white"
            data-testid="clip-editor-save"
          >
            Salvar ajustes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
