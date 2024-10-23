type TailwindGridProps = {
  children: React.ReactNode;
  show?: boolean;
  fullSize?: boolean;
  className?: string;
  gap?: number;
  mdGap?: number;
  lgGap?: number;
  bgColor?: "red" | "blue" | "yellow" | "orange" | "purple" | "green";
};

function TailwindGrid({
  children,
  show,
  className,
  fullSize,
  gap = 4,
  mdGap = 6,
  lgGap = 6,
  bgColor = "blue",
}: TailwindGridProps) {
  const bgColorClass = `bg-${bgColor}-200/20`;
  const gapClass = `gap-${gap}`;
  const mdGapClass = `md:gap-${mdGap}`;
  const lgGapClass = `lg:gap-${lgGap}`;

  return (
    <>
      <section
        className={`px-4 min-w-[320px] md:px-6 lg:px-8 w-full bg-red-500/10 z-50`}
      >
        <section className={`${gapClass} ${mdGapClass} ${lgGapClass} grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid relative w-full z-50 justify-center`}>
          {show && (
            <div className={`${gapClass} ${mdGapClass} ${lgGapClass} grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid absolute w-full z-50 justify-center`}>
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-screen text-center text-zinc-900 col-span-1 ${bgColorClass} ${
                    index >= 4 && index < 8 ? "hidden md:block" : ""
                  } ${index >= 8 ? "hidden lg:block" : ""}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
      <section
        className={`${
          !fullSize && "px-4 md:px-6 lg:px-8"
        } min-w-[320px] w-full ${gapClass} ${mdGapClass} ${lgGapClass} grid-cols-4 md:grid-cols-8 lg:grid-cols-12 grid relative items-center justify-center`}
      >
        {children}
      </section>
    </>
  );
}

export default TailwindGrid;
