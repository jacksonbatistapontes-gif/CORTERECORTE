import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="w-full px-6 md:px-12 py-6 flex items-center justify-between relative z-20">
      <Link
        to="/"
        className="flex items-center gap-3"
        data-testid="nav-logo-link"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--e1-primary)] flex items-center justify-center text-black font-bold">
          <Sparkles size={18} data-testid="nav-logo-icon" />
        </div>
        <div>
          <div
            className="font-[Outfit] text-xl tracking-tight"
            data-testid="nav-logo-text"
          >
            Cortes&Recorte
          </div>
          <div
            className="text-xs text-[var(--e1-muted)]"
            data-testid="nav-logo-subtitle"
          >
            Estúdio de cortes rápidos
          </div>
        </div>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-sm">
        <NavLink
          to="/"
          className="text-white/70 hover:text-white transition"
          data-testid="nav-home-link"
        >
          Início
        </NavLink>
        <NavLink
          to="/como-funciona"
          className="text-white/70 hover:text-white transition"
          data-testid="nav-how-link"
        >
          Como funciona
        </NavLink>
        <NavLink
          to="/create"
          className="text-white/70 hover:text-white transition"
          data-testid="nav-studio-link"
        >
          Studio
        </NavLink>
      </nav>
      <Button
        asChild
        className="pill-button bg-[var(--e1-primary)] text-white shadow-[0_0_25px_rgba(124,58,237,0.6)]"
        data-testid="nav-cta-button"
      >
        <Link to="/create">Criar cortes</Link>
      </Button>
    </header>
  );
};
