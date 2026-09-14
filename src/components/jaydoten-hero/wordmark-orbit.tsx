function OrbitShell({
  className,
  ballClassName,
}: {
  className: string;
  ballClassName: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-[50%] left-[46.85%] h-[16%] w-[16.7%] -translate-x-1/2 -translate-y-1/2 ${className}`}
    >
      <span
        className={`wordmark-orbit-spin absolute block aspect-square w-[34%] rounded-full ${ballClassName}`}
      />
    </span>
  );
}

export function WordmarkOrbit() {
  return (
    <>
      <OrbitShell
        className="z-0"
        ballClassName="wordmark-orbit-orb wordmark-orbit-under"
      />
      <OrbitShell
        className="z-[2]"
        ballClassName="wordmark-orbit-orb wordmark-orbit-over"
      />
    </>
  );
}
