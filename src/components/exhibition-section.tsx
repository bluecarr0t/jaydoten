import { featuredExhibition } from "@/lib/content";

export function ExhibitionSection() {
  return (
    <section
      id="exhibition"
      className="border-b border-line px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-[0.28em] text-muted uppercase">
              Current Exhibition
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light tracking-tight text-foreground md:text-5xl">
              {featuredExhibition.title}
            </h2>
          </div>
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
            Cat. {featuredExhibition.number}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-[#d8d2c8] via-[#a8a298] to-[#5c5850] lg:col-span-7">
            <div className="absolute inset-0 flex items-end p-8">
              <p className="max-w-xs text-sm leading-relaxed text-white/90">
                Installation view, Main Gallery. Photography courtesy of the
                studio.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between lg:col-span-5">
            <div className="space-y-8">
              <dl className="grid gap-6 text-sm">
                <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line pb-4">
                  <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
                    Dates
                  </dt>
                  <dd>{featuredExhibition.dates}</dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line pb-4">
                  <dt className="text-[11px] tracking-[0.18em] text-muted uppercase">
                    Venue
                  </dt>
                  <dd>{featuredExhibition.location}</dd>
                </div>
              </dl>
              <p className="max-w-md text-base leading-relaxed text-muted">
                {featuredExhibition.description}
              </p>
            </div>
            <a
              href="#visit"
              className="mt-12 inline-flex w-fit items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-foreground uppercase transition-opacity hover:opacity-60"
            >
              Plan your visit
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
