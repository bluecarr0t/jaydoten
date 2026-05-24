export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-end border-b border-line px-6 pb-16 pt-32 md:px-10 md:pb-24">
      <p className="mb-6 text-[11px] font-medium tracking-[0.28em] text-muted uppercase">
        Contemporary Art & Creative Studio
      </p>
      <h1 className="max-w-5xl font-serif text-[clamp(3.5rem,12vw,8.5rem)] leading-[0.92] font-light tracking-tight text-foreground">
        Jaydoten
      </h1>
      <p className="mt-10 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        A studio for exhibition, commission, and research at the edge of
        material, image, and space.
      </p>
      <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-[11px] tracking-[0.18em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
        <span>Est. 2019</span>
        <span>New York · By appointment</span>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
