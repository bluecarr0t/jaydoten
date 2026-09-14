function OrbitShell({
  className,
  layerClassName,
}: {
  className: string;
  layerClassName: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-[50%] left-[46.85%] h-[9.4%] w-[16.7%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] ${className}`}
    >
      <span className="wordmark-orbit-spin absolute inset-0 origin-center [transform-style:preserve-3d]">
        <span className={`absolute inset-0 [transform-style:preserve-3d] ${layerClassName}`}>
          <span className="wordmark-orbit-arm absolute top-1/2 left-1/2 h-[3px] w-[46%] -translate-y-1/2" />
          <span className="wordmark-orbit-disc absolute top-1/2 left-[96%] aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </span>
      </span>
    </span>
  );
}

export function WordmarkOrbit() {
  return (
    <>
      <OrbitShell className="z-0" layerClassName="wordmark-orbit-under" />
      <OrbitShell className="z-[2]" layerClassName="wordmark-orbit-over" />
    </>
  );
}
