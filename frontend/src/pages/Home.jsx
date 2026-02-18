import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipCard } from "@/components/ClipCard";
import { ArrowUpRight, Scissors, Sparkles, Wand2 } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1764258559789-40cf1eb2025f?crop=entropy&cs=srgb&fm=jpg&q=85";
const editingImage =
  "https://images.unsplash.com/photo-1764557175375-9e2bea91530e?crop=entropy&cs=srgb&fm=jpg&q=85";
const creatorImage =
  "https://images.unsplash.com/photo-1673093774005-a5ee94ed98c4?crop=entropy&cs=srgb&fm=jpg&q=85";

const demoClips = [
  {
    id: "demo-1",
    title: "Gancho imediato",
    caption: "Os 3 segundos que explodem o alcance.",
    start_time: 42,
    end_time: 72,
    duration: 30,
    viral_score: 92,
    thumbnail_url: editingImage,
  },
  {
    id: "demo-2",
    title: "Momento épico",
    caption: "O trecho que gera comentários.",
    start_time: 120,
    end_time: 150,
    duration: 30,
    viral_score: 89,
    thumbnail_url: creatorImage,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  const handleStart = () => {
    const query = url ? `?url=${encodeURIComponent(url)}` : "";
    navigate(`/create${query}`);
  };

  return (
    <div className="app-shell" data-testid="home-page">
      <Navbar />
      <main>
        <section className="section-padding">
          <div
            className="hero-surface max-w-6xl mx-auto"
            style={{ backgroundImage: `url(${heroImage})` }}
            data-testid="hero-surface"
          >
            <div className="glow-orb" data-testid="hero-glow" />
            <div className="hero-content grid md:grid-cols-2 gap-12 p-8 md:p-14">
              <div className="flex flex-col gap-6">
                <Badge
                  className="w-fit bg-white/10 text-white border border-white/10"
                  data-testid="hero-badge"
                >
                  Nova geração de cortes curtos
                </Badge>
                <h1
                  className="font-[Outfit] text-4xl md:text-5xl leading-tight"
                  data-testid="hero-title"
                >
                  Transforme vídeos longos em cortes prontos para viralizar.
                </h1>
                <p
                  className="text-white/70 text-lg"
                  data-testid="hero-subtitle"
                >
                  Cole a URL do YouTube, defina o estilo e receba os melhores momentos
                  com score de viralização e legenda inteligente.
                </p>
                <div className="tracing-beam" data-testid="hero-url-wrapper">
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://youtube.com/…"
                    data-testid="hero-url-input"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    onClick={handleStart}
                    className="pill-button bg-[var(--e1-primary)] text-white"
                    data-testid="hero-cta-primary"
                  >
                    Criar cortes agora <ArrowUpRight size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="pill-button text-white/70 hover:text-white hover:bg-white/10"
                    data-testid="hero-cta-secondary"
                    onClick={() => navigate("/como-funciona")}
                  >
                    Ver fluxo completo
                  </Button>
                </div>
                <div className="flex flex-wrap gap-6">
                <div className="glass-card px-4 py-3" data-testid="hero-metric-1">
                    <div
                      className="text-sm text-white/60"
                      data-testid="hero-metric-1-label"
                    >
                      Tempo médio
                    </div>
                    <div
                      className="font-[Outfit] text-xl"
                      data-testid="hero-metric-1-value"
                    >
                      4 min
                    </div>
                  </div>
                  <div className="glass-card px-4 py-3" data-testid="hero-metric-2">
                    <div
                      className="text-sm text-white/60"
                      data-testid="hero-metric-2-label"
                    >
                      Cortes gerados
                    </div>
                    <div
                      className="font-[Outfit] text-xl"
                      data-testid="hero-metric-2-value"
                    >
                      +6 por vídeo
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="glass-card p-6" data-testid="hero-preview">
                  <div className="flex items-center gap-3 text-white/70 text-sm">
                    <Sparkles size={16} />
                    <span data-testid="hero-preview-label">Preview do fluxo</span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm" data-testid="hero-preview-row-1">
                      <span data-testid="hero-preview-row-1-label">Detecção de ganchos</span>
                      <span
                        className="text-[var(--e1-secondary)]"
                        data-testid="hero-preview-row-1-value"
                      >
                        98%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm" data-testid="hero-preview-row-2">
                      <span data-testid="hero-preview-row-2-label">Legenda automática</span>
                      <span
                        className="text-[var(--e1-secondary)]"
                        data-testid="hero-preview-row-2-value"
                      >
                        Ativa
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm" data-testid="hero-preview-row-3">
                      <span data-testid="hero-preview-row-3-label">
                        Formatação Reels/TikTok
                      </span>
                      <span
                        className="text-[var(--e1-secondary)]"
                        data-testid="hero-preview-row-3-value"
                      >
                        9:16
                      </span>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6" data-testid="hero-preview-secondary">
                  <div className="flex items-center gap-3 text-white/70 text-sm">
                    <Scissors size={16} />
                    <span data-testid="hero-preview-secondary-label">
                      Score de viralização
                    </span>
                  </div>
                  <div className="mt-5 text-4xl font-[Outfit]" data-testid="hero-viral-score">
                    94/100
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="max-w-6xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-4">
            <h2 className="font-[Outfit] text-3xl" data-testid="how-title">
                Como funciona no estilo Cortes&Recorte
              </h2>
              <p className="text-white/70" data-testid="how-subtitle">
                Um fluxo direto e rápido para transformar seu conteúdo em uma máquina de
                cortes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 glass-card p-6" data-testid="how-card-1">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <Wand2 size={16} />
                  <span data-testid="how-card-1-label">1. Envie o link</span>
                </div>
                <h3 className="font-[Outfit] text-2xl mt-3" data-testid="how-card-1-title">
                  Cole a URL e defina o estilo
                </h3>
                <p className="text-white/60 mt-2" data-testid="how-card-1-text">
                  Escolha o tamanho do corte, idioma e o ritmo. Nosso motor prepara o
                  terreno para os melhores ganchos.
                </p>
              </div>
              <div className="md:col-span-5 glass-card p-6" data-testid="how-card-2">
                <div className="text-sm text-white/70" data-testid="how-card-2-label">
                  2. IA encontra momentos
                </div>
                <h3 className="font-[Outfit] text-xl mt-3" data-testid="how-card-2-title">
                  Destaques automáticos
                </h3>
                <p className="text-white/60 mt-2" data-testid="how-card-2-text">
                  Score de viralização e sugestões de legenda prontos para ação.
                </p>
              </div>
              <div className="md:col-span-5 glass-card p-6" data-testid="how-card-3">
                <div className="text-sm text-white/70" data-testid="how-card-3-label">
                  3. Ajuste fino
                </div>
                <h3 className="font-[Outfit] text-xl mt-3" data-testid="how-card-3-title">
                  Controle rápido
                </h3>
                <p className="text-white/60 mt-2" data-testid="how-card-3-text">
                  Refine cortes e baixe em lote para publicar em segundos.
                </p>
              </div>
              <div className="md:col-span-7 glass-card p-6" data-testid="how-card-4">
                <div className="text-sm text-white/70" data-testid="how-card-4-label">
                  4. Pronto para viralizar
                </div>
                <h3 className="font-[Outfit] text-2xl mt-3" data-testid="how-card-4-title">
                  Exportação imediata
                </h3>
                <p className="text-white/60 mt-2" data-testid="how-card-4-text">
                  Baixe cada corte ou um pacote completo com thumb e legenda.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="font-[Outfit] text-3xl" data-testid="clips-title">
                Prévia dos cortes gerados
              </h2>
              <Button
                onClick={handleStart}
                className="pill-button bg-[var(--e1-secondary)] text-black"
                data-testid="clips-cta"
              >
                Testar com meu vídeo
              </Button>
            </div>
            <div className="clip-grid" data-testid="clips-grid">
              {demoClips.map((clip) => (
                <ClipCard key={clip.id} clip={clip} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
