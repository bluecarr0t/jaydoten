import { EmailCapture } from "./email-capture";
import { HeroShapes } from "./hero-shapes";

export function JaydotenHero() {
  return (
    <div
      data-poster-home
      className="fixed inset-0 overflow-x-hidden overflow-y-auto bg-[#F4EBD8] text-[#D32F27]"
    >
      <div className="flex min-h-dvh w-full flex-col">
        <div className="relative z-20 shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:px-10 lg:pt-8">
          <h1 className="font-display text-[clamp(3rem,16vw,11rem)] leading-[0.78] tracking-[-0.03em] lg:text-[clamp(4.5rem,18vw,11rem)]">
            JAYDOTEN
          </h1>
          <p className="mt-1 font-display text-[clamp(1.65rem,8vw,5.5rem)] leading-[0.86] tracking-[-0.02em] lg:mt-4 lg:text-[clamp(2.25rem,9vw,5.5rem)]">
            STUDIO WORKS
          </p>
          <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[#D32F27]/85 lg:mt-10 lg:text-lg">
            A Los Angeles experimental studio for kinetic sculptures and other
            creations made slowly, on purpose.
          </p>
          <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-[#D32F27]/85 lg:mt-3 lg:text-lg">
            More coming soon.
          </p>
          <EmailCapture />
        </div>
        <div className="relative min-h-[24rem] flex-1 lg:absolute lg:inset-0">
          <HeroShapes />
        </div>
      </div>
    </div>
  );
}
