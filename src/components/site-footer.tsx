export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-[11px] tracking-[0.18em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Jaydoten. All rights reserved.</p>
        <p>Contemporary art & creative studio</p>
      </div>
    </footer>
  );
}
