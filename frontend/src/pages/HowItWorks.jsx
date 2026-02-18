import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="app-shell" data-testid="how-page">
      <Navbar />
      <main className="section-padding">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Badge
              className="w-fit bg-white/10 text-white"
              data-testid="how-hero-badge"
            >
              Workflow completo
            </Badge>
            <h1 className="font-[Outfit] text-4xl" data-testid="how-hero-title">
              Do YouTube aos cortes prontos em quatro etapas.
            </h1>
            <p className="text-white/70" data-testid="how-hero-subtitle">
              O mesmo fluxo que você vê no OpnusClips, com foco em velocidade, clareza e
              aprovação rápida.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Importe seu vídeo",
                text: "Cole o link do YouTube e escolha o tamanho dos cortes.",
              },
              {
                title: "Análise inteligente",
                text: "A IA detecta ganchos, pausas e momentos de impacto.",
              },
              {
                title: "Refino rápido",
                text: "Ajuste os melhores trechos com sugestões de legenda.",
              },
              {
                title: "Download em lote",
                text: "Receba versões prontas para Reels, Shorts e TikTok.",
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="glass-card p-6"
                data-testid={`how-step-${index + 1}`}
              >
                <div
                  className="text-sm text-white/60"
                  data-testid={`how-step-${index + 1}-label`}
                >
                  Etapa {index + 1}
                </div>
                <h3
                  className="font-[Outfit] text-2xl mt-3"
                  data-testid={`how-step-${index + 1}-title`}
                >
                  {step.title}
                </h3>
                <p
                  className="text-white/70 mt-2"
                  data-testid={`how-step-${index + 1}-text`}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => navigate("/create")}
              className="pill-button bg-[var(--e1-primary)] text-white"
              data-testid="how-cta-primary"
            >
              Começar agora
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="pill-button text-white/70 hover:text-white hover:bg-white/10"
              data-testid="how-cta-secondary"
            >
              Voltar ao início
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
