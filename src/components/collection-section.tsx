import { collectionWorks } from "@/lib/content";

export function CollectionSection() {
  return (
    <section
      id="collection"
      className="border-b border-line bg-surface px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.28em] text-muted uppercase">
            Selected Works
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light tracking-tight text-foreground md:text-5xl">
            From the collection
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted">
            A rotating selection of works spanning painting, sculpture, moving
            image, and installation. Full catalog available on request.
          </p>
        </div>

        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {collectionWorks.map((work) => (
            <li
              key={work.id}
              className="group flex flex-col bg-background transition-colors hover:bg-[#faf8f4]"
            >
              <div
                className={`aspect-[3/4] bg-gradient-to-br ${work.tone}`}
                role="img"
                aria-label={`${work.title} — artwork placeholder`}
              />
              <div className="flex flex-1 flex-col justify-between border-t border-line p-6">
                <div>
                  <p className="text-[10px] tracking-[0.24em] text-muted uppercase">
                    {work.id}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-light text-foreground">
                    {work.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{work.medium}</p>
                </div>
                <p className="mt-6 text-[11px] tracking-[0.16em] text-muted uppercase">
                  {work.year}
                  {"dimensions" in work && ` · ${work.dimensions}`}
                  {"duration" in work && ` · ${work.duration}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
