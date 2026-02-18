export const Footer = () => {
  return (
    <footer className="px-6 md:px-12 py-12 border-t border-white/5" data-testid="footer">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-[Outfit] text-lg" data-testid="footer-title">
            Corte&Recorte
          </div>
          <p className="text-sm text-white/60" data-testid="footer-subtitle">
            Cortes prontos para viralizar em minutos.
          </p>
        </div>
        <div className="text-xs text-white/50" data-testid="footer-copy">
          © 2025 Corte&Recorte. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
