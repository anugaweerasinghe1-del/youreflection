import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[0.4em] text-white/70 transition hover:text-white"
        >
          Beyond
        </Link>
        <nav className="flex items-center gap-8 text-[10px] uppercase tracking-[0.35em] text-white/60">
          <Link to="/reflect" className="transition hover:text-white [&.active]:text-white">
            Reflect
          </Link>
          <Link to="/wall" className="transition hover:text-white [&.active]:text-white">
            Wall
          </Link>
        </nav>
      </div>
    </header>
  );
}
