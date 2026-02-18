import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipCard } from "@/components/ClipCard";
import { ClipEditorDialog } from "@/components/ClipEditorDialog";
import { ClipPreviewDialog } from "@/components/ClipPreviewDialog";
import { getJob, getJobClips, updateClip, getDownloadUrl } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { toast } from "sonner";
import { ArrowLeft, DownloadCloud } from "lucide-react";

export default function Results() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clips, setClips] = useState([]);
  const [editingClip, setEditingClip] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewClip, setPreviewClip] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await getJob(jobId);
        setJob(data);
        if (data.clip_count > 0 || data.status === "completed") {
          const clipList = await getJobClips(jobId);
          setClips(clipList);
        } else {
          setClips(data.clips || []);
        }
      } catch (err) {
        setError("Não encontramos esse processamento.");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="app-shell" data-testid="results-loading">
        <Navbar />
        <main className="section-padding">
          <div className="max-w-4xl mx-auto glass-card p-6" data-testid="results-loading-card">
            Carregando resultados...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell" data-testid="results-error">
        <Navbar />
        <main className="section-padding">
          <div className="max-w-4xl mx-auto glass-card p-6" data-testid="results-error-card">
            <div className="text-white/70" data-testid="results-error-text">
              {error}
            </div>
            <Button
              onClick={() => navigate("/create")}
              className="pill-button bg-[var(--e1-primary)] text-white mt-4"
              data-testid="results-error-cta"
            >
              Voltar ao studio
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleDownloadAll = () => {
    const url = getDownloadUrl(jobId);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadClip = (clip) => {
    const url = resolveMediaUrl(clip.video_url);
    if (!url) {
      toast("Download indisponível", {
        description: "O corte ainda não possui vídeo gerado.",
      });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEdit = (clip) => {
    setEditingClip(clip);
    setEditorOpen(true);
  };

  const handlePreview = (clip) => {
    setPreviewClip(clip);
    setPreviewOpen(true);
  };

  const handleSaveEdit = async (payload) => {
    try {
      const updated = await updateClip(jobId, editingClip.id, payload);
      setClips((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Ajustes salvos.");
      setEditorOpen(false);
    } catch (err) {
      toast.error("Não foi possível salvar o corte.");
    }
  };

  const visibleClips = clips.length > 0 ? clips : job.clips || [];

  return (
    <div className="app-shell" data-testid="results-page">
      <Navbar />
      <main className="section-padding">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              className="pill-button text-white/70 hover:text-white hover:bg-white/10 w-fit"
              onClick={() => navigate("/create")}
              data-testid="results-back-button"
            >
              <ArrowLeft size={16} /> Voltar
            </Button>
            <h1 className="font-[Outfit] text-3xl" data-testid="results-title">
              Resultados prontos para publicação
            </h1>
            <p className="text-white/70" data-testid="results-subtitle">
              Revise os cortes, veja o score de viralização e baixe tudo em alta
              qualidade.
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-white/10 text-white" data-testid="results-job-status">
                Status: {job.status === "completed" ? "Completo" : "Processando"}
              </Badge>
              <Badge className="bg-white/10 text-white" data-testid="results-job-length">
                {job.clip_length}s por corte
              </Badge>
              <Badge className="bg-white/10 text-white" data-testid="results-job-style">
                Estilo: {job.style}
              </Badge>
            </div>
          </div>

          {job.status === "error" && (
            <div className="glass-card p-6" data-testid="results-error-card">
              <div className="text-red-300" data-testid="results-error-message">
                {job.error_message || "Erro ao processar o vídeo."}
              </div>
              <Button
                onClick={() => navigate("/create")}
                className="pill-button bg-[var(--e1-secondary)] text-black mt-4"
                data-testid="results-error-retry"
              >
                Voltar ao studio
              </Button>
            </div>
          )}

          {job.status !== "completed" && job.status !== "error" && (
            <div className="glass-card p-6 flex flex-col gap-3" data-testid="results-progress">
              <div className="text-sm text-white/70" data-testid="results-progress-text">
                Seu vídeo ainda está sendo processado. Volte ao studio para acompanhar.
              </div>
              <Progress
                value={job.progress}
                className="h-3 bg-white/10"
                data-testid="results-progress-bar"
              />
            </div>
          )}

          {job.status === "completed" && (
            <div className="flex flex-col gap-6" data-testid="results-complete">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-white/70" data-testid="results-count">
                {visibleClips.length} cortes disponíveis
                </div>
                <Button
                  onClick={handleDownloadAll}
                  className="pill-button bg-[var(--e1-secondary)] text-black"
                  data-testid="results-download-all"
                >
                  <DownloadCloud size={16} /> Baixar pacote
                </Button>
              </div>
              <div className="clip-grid" data-testid="results-clips-grid">
                {visibleClips.map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    onEdit={handleEdit}
                    onPreview={handlePreview}
                    onDownload={handleDownloadClip}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ClipEditorDialog
        clip={editingClip}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveEdit}
      />
      <ClipPreviewDialog
        clip={previewClip}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDownload={handleDownloadClip}
      />
    </div>
  );
}
