import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ClipCard } from "@/components/ClipCard";
import { createJob, listJobs, getJob, advanceJob } from "@/lib/api";
import { toast } from "sonner";
import { Scissors, Sparkles, Timer } from "lucide-react";

export default function Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState("");
  const [clipLength, setClipLength] = useState([30]);
  const [style, setStyle] = useState("dinamico");
  const [language, setLanguage] = useState("pt");
  const [currentJob, setCurrentJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setUrl(urlParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await listJobs();
        setJobs(data);
      } catch (error) {
        toast.error("Não foi possível carregar os jobs.");
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!currentJob || ["completed", "error"].includes(currentJob.status)) {
      return undefined;
    }
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const updated = await getJob(currentJob.id);
        if (cancelled) return;
        setCurrentJob(updated);
        setJobs((prev) => {
          const exists = prev.find((job) => job.id === updated.id);
          if (!exists) return [updated, ...prev];
          return prev.map((job) => (job.id === updated.id ? updated : job));
        });
        if (updated.status === "completed") {
          toast.success("Cortes prontos para revisão!");
        }
        if (updated.status === "error") {
          toast.error("Falha no processamento. Verifique o link do YouTube.");
        }
      } catch (error) {
        toast.error("Falha ao atualizar o progresso.");
      }
    }, 1400);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentJob]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!url) {
      toast.error("Cole uma URL do YouTube para começar.");
      return;
    }
    setIsSubmitting(true);
    try {
      const job = await createJob({
        youtube_url: url,
        clip_length: clipLength[0],
        language,
        style,
      });
      setCurrentJob(job);
      setJobs((prev) => [job, ...prev]);
      toast.success("Processamento iniciado.");
    } catch (error) {
      toast.error("Não foi possível iniciar o processamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!currentJob) return;
    try {
      const updated = await advanceJob(currentJob.id);
      setCurrentJob(updated);
      toast.success("Reprocessamento iniciado.");
    } catch (error) {
      toast.error("Não foi possível reprocessar.");
    }
  };

  return (
    <div className="app-shell" data-testid="create-page">
      <Navbar />
      <div className="sidebar-shell" data-testid="studio-sidebar">
        <div className="font-[Outfit] text-lg" data-testid="studio-sidebar-title">
          Studio
        </div>
        <div className="text-sm text-white/60" data-testid="studio-sidebar-subtitle">
          Configurações rápidas
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="glass-card px-4 py-3" data-testid="sidebar-tip-1">
            <div className="text-xs text-white/50" data-testid="sidebar-tip-1-label">
              Dica
            </div>
            <div className="text-sm" data-testid="sidebar-tip-1-text">
              Use vídeos com áudio claro.
            </div>
          </div>
          <div className="glass-card px-4 py-3" data-testid="sidebar-tip-2">
            <div className="text-xs text-white/50" data-testid="sidebar-tip-2-label">
              Foco
            </div>
            <div className="text-sm" data-testid="sidebar-tip-2-text">
              Cortes entre 25-45s performam melhor.
            </div>
          </div>
        </div>
      </div>
      <main className="dashboard-content">
        <section className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <Badge
              className="w-fit bg-[var(--e1-secondary)] text-black"
              data-testid="studio-badge"
            >
              Estúdio de cortes
            </Badge>
            <h1 className="font-[Outfit] text-3xl" data-testid="studio-title">
              Configure seu vídeo do YouTube
            </h1>
            <p className="text-white/70" data-testid="studio-subtitle">
              Defina o tamanho dos cortes e o estilo de edição. A IA cuida do resto.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass-card p-6 flex flex-col gap-6"
            data-testid="studio-form"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white/70" data-testid="studio-url-label">
                URL do YouTube
              </label>
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-black/40 border-white/10"
                data-testid="studio-url-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3" data-testid="studio-length-field">
                <div className="flex items-center justify-between text-sm">
                  <span data-testid="studio-length-label">Duração do corte</span>
                  <span
                    className="text-[var(--e1-secondary)]"
                    data-testid="studio-length-value"
                  >
                    {clipLength[0]}s
                  </span>
                </div>
                <Slider
                  value={clipLength}
                  onValueChange={setClipLength}
                  min={15}
                  max={90}
                  step={5}
                  className="[&_[role=slider]]:bg-[var(--e1-primary)]"
                  data-testid="studio-length-slider"
                />
              </div>
              <div className="flex flex-col gap-3" data-testid="studio-style-field">
                <label className="text-sm text-white/70" data-testid="studio-style-label">
                  Estilo
                </label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger
                    className="bg-black/40 border-white/10"
                    data-testid="studio-style-trigger"
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent data-testid="studio-style-content">
                    <SelectItem value="dinamico" data-testid="studio-style-dinamico">
                      Dinâmico
                    </SelectItem>
                    <SelectItem value="calmo" data-testid="studio-style-calmo">
                      Calmo
                    </SelectItem>
                    <SelectItem value="podcast" data-testid="studio-style-podcast">
                      Podcast
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3" data-testid="studio-language-field">
                <label
                  className="text-sm text-white/70"
                  data-testid="studio-language-label"
                >
                  Idioma
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger
                    className="bg-black/40 border-white/10"
                    data-testid="studio-language-trigger"
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent data-testid="studio-language-content">
                    <SelectItem value="pt" data-testid="studio-language-pt">
                      Português
                    </SelectItem>
                    <SelectItem value="es" data-testid="studio-language-es">
                      Espanhol
                    </SelectItem>
                    <SelectItem value="en" data-testid="studio-language-en">
                      Inglês
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="pill-button bg-[var(--e1-primary)] text-white w-fit"
              data-testid="studio-submit-button"
            >
              {isSubmitting ? "Processando..." : "Gerar cortes"}
            </Button>
          </form>

          {currentJob && (
            <div className="glass-card p-6 flex flex-col gap-4" data-testid="studio-progress">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} />
                  <span data-testid="studio-progress-label">Processamento em tempo real</span>
                </div>
                <Badge
                  className="bg-white/10 text-white"
                  data-testid="studio-progress-status"
                >
                  {currentJob.status === "completed" ? "Completo" : "Processando"}
                </Badge>
              </div>
              <Progress
                value={currentJob.progress}
                className="h-3 bg-white/10"
                data-testid="studio-progress-bar"
              />
              <div className="flex items-center justify-between text-sm text-white/60">
                <span data-testid="studio-progress-value">
                  {currentJob.progress}%
                </span>
                <span data-testid="studio-progress-hint">
                  {currentJob.status === "completed"
                    ? "Cortes prontos para revisão"
                    : currentJob.status === "error"
                      ? "Falha no processamento"
                      : "Analisando momentos-chave"}
                </span>
              </div>
              {currentJob.status === "completed" && (
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate(`/results/${currentJob.id}`)}
                    className="pill-button bg-[var(--e1-secondary)] text-black"
                    data-testid="studio-view-results"
                  >
                    Ver resultados
                  </Button>
                  <Button
                    variant="ghost"
                    className="pill-button text-white/70 hover:text-white hover:bg-white/10"
                    data-testid="studio-new-job"
                    onClick={() => setCurrentJob(null)}
                  >
                    Criar novo corte
                  </Button>
                </div>
              )}
              {currentJob.status === "error" && (
                <div className="flex flex-wrap gap-4">
                  <div className="text-sm text-red-300" data-testid="studio-error-text">
                    {currentJob.error_message || "Erro ao processar o vídeo."}
                  </div>
                  <Button
                    onClick={handleRetry}
                    className="pill-button bg-[var(--e1-secondary)] text-black"
                    data-testid="studio-retry-button"
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentJob?.status === "completed" && currentJob.clips?.length > 0 && (
            <div className="flex flex-col gap-6" data-testid="studio-clips-preview">
              <div className="flex items-center gap-3">
                <Scissors size={18} />
                <h2 className="font-[Outfit] text-2xl" data-testid="studio-clips-title">
                  Prévia dos cortes
                </h2>
              </div>
              <div className="clip-grid" data-testid="studio-clips-grid">
                {currentJob.clips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6" data-testid="studio-recent-jobs">
            <div className="flex items-center gap-3">
              <Timer size={18} />
              <h2 className="font-[Outfit] text-2xl" data-testid="studio-recent-title">
                Últimos processamentos
              </h2>
            </div>
            {jobs.length === 0 ? (
              <div
                className="glass-card p-6 text-white/60"
                data-testid="studio-empty-jobs"
              >
                Nenhum processamento iniciado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="glass-card p-4 flex flex-col gap-3"
                    data-testid={`studio-job-${job.id}`}
                  >
                    <div className="flex items-center justify-between">
                    <div
                      className="text-sm text-white/60"
                      data-testid={`studio-job-title-${job.id}`}
                    >
                      {job.title}
                    </div>
                      <Badge
                        className="bg-white/10 text-white"
                        data-testid={`studio-job-status-${job.id}`}
                      >
                        {job.status === "completed" ? "Completo" : "Processando"}
                      </Badge>
                    </div>
                    <div className="text-xs text-white/50" data-testid={`studio-job-url-${job.id}`}>
                      {job.youtube_url}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span data-testid={`studio-job-length-${job.id}`}>
                        {job.clip_length}s
                      </span>
                      <span data-testid={`studio-job-count-${job.id}`}>
                        {job.clip_count} cortes
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate(`/results/${job.id}`)}
                      className="pill-button bg-white/10 hover:bg-white/20"
                      data-testid={`studio-job-open-${job.id}`}
                    >
                      Abrir resultados
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
