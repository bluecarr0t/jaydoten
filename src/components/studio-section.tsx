import { studioStatement } from "@/lib/content";

export function StudioSection() {
  return (
    <section id="studio" className="border-b border-line px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-4">
          <p className="text-[11px] font-medium tracking-[0.28em] text-muted uppercase">
            The Studio
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light tracking-tight text-foreground md:text-5xl">
            Practice & mission
          </h2>
        </div>

        <div className="space-y-8 lg:col-span-8">
          {studioStatement.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-lg leading-relaxed text-muted md:text-xl md:leading-relaxed"
            >
              {paragraph}
            </p>
          ))}

          <dl className="mt-12 grid gap-8 border-t border-line pt-12 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">
                Disciplines
              </dt>
              <dd className="mt-3 text-sm leading-relaxed">
                Painting · Sculpture · Moving image · Spatial design
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">
                Services
              </dt>
              <dd className="mt-3 text-sm leading-relaxed">
                Commissions · Curatorial collaboration · Artist residencies
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">
                Press
              </dt>
              <dd className="mt-3 text-sm leading-relaxed">
                High-resolution images and texts available upon inquiry.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
