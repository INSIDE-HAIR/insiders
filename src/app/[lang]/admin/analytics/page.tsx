import TailwindGrid from "@/src/components/grid/TailwindGrid";
import React from "react";

function page() {
  return (
    <>
      <TailwindGrid>
        <main className="col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-3 lg:col-end-13  order-2 md:order-1 z-30  col-span-full">
          
        </main>
      </TailwindGrid>
    </>
  );
}

export default page;
