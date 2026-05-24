import { visitInfo } from "@/lib/content";

export function VisitSection() {
  return (
    <section id="visit" className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 border-b border-line pb-8">
          <p className="text-[11px] font-medium tracking-[0.28em] text-muted uppercase">
            Visit
          </p>
          <h2 className="mt-3 font-serif text-4xl font-light tracking-tight text-foreground md:text-5xl">
            Plan your visit
          </h2>
        </div>

        <div className="grid gap-16 lg:grid-cols-3">
          <div>
            <h3 className="text-[11px] tracking-[0.2em] text-muted uppercase">
              Location
            </h3>
            <address className="mt-4 space-y-1 text-base not-italic leading-relaxed">
              {visitInfo.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          <div>
            <h3 className="text-[11px] tracking-[0.2em] text-muted uppercase">
              Hours
            </h3>
            <ul className="mt-4 space-y-3">
              {visitInfo.hours.map((slot) => (
                <li
                  key={slot.day}
                  className="flex justify-between gap-4 border-b border-line pb-3 text-sm"
                >
                  <span className="text-muted">{slot.day}</span>
                  <span>{slot.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] tracking-[0.2em] text-muted uppercase">
              Inquiries
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="text-muted">General </span>
                <a
                  href={`mailto:${visitInfo.contact.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {visitInfo.contact.email}
                </a>
              </li>
              <li>
                <span className="text-muted">Press </span>
                <a
                  href={`mailto:${visitInfo.contact.press}`}
                  className="underline-offset-4 hover:underline"
                >
                  {visitInfo.contact.press}
                </a>
              </li>
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-muted">
              Admission is free. Private viewings and group tours may be
              arranged by email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
