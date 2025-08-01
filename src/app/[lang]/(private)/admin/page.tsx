import TailwindGrid from "@/src/components/shared/grid/TailwindGrid";
import React from "react";

function page() {
  return (
    <>
      <TailwindGrid>
        <main className='col-start-1 max-w-full w-full col-end-full md:col-start-1  lg:col-start-3 lg:col-end-13  order-2 md:order-1 z-30  col-span-full'>
          <div className='p-6'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Dashboard Administrativo
              </h1>
              <p className='text-gray-600'>
                Panel de control y métricas del sistema
              </p>
            </div>

            {/* Add dashboard widgets here in the future */}
            <div className='space-y-6'>
              <div className='text-center py-8 text-gray-500'>
                <p>Los widgets de dashboard se están desarrollando.</p>
                <p>
                  El widget de Carga Horaria por Consultor está disponible en:
                </p>
                <a
                  href='/admin/calendar'
                  className='text-blue-600 hover:underline font-medium'
                >
                  Dashboard de Calendar
                </a>
              </div>
            </div>
          </div>
        </main>
      </TailwindGrid>
    </>
  );
}

export default page;
