import Link from "next/link";
import { navLinks } from "@/lib/content";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="#"
          className="font-serif text-xl font-medium tracking-[0.12em] text-foreground uppercase md:text-2xl"
        >
          Jaydoten
        </Link>
        <nav
          className="hidden items-center gap-10 text-[11px] font-medium tracking-[0.2em] text-muted uppercase md:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="#visit"
          className="border border-foreground px-4 py-2 text-[10px] font-medium tracking-[0.18em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background md:hidden"
        >
          Visit
        </Link>
      </div>
    </header>
  );
}
