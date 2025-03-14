"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";

export function DriveHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const client = searchParams?.get("client") ?? "insiders";
  const year = searchParams?.get("year") ?? new Date().getFullYear().toString();
  const month = searchParams?.get("month") ?? "january";

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const clients = ["insiders", "primelady"];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1].map((y) =>
    y.toString()
  );

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("client", e.target.value);
    router.push(`?${params.toString()}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("year", e.target.value);
    router.push(`?${params.toString()}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("month", e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <header className='py-6'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Contenido físico</h1>

      <div className='flex flex-col items-center'>
        <div className='flex flex-wrap gap-4 mb-6 justify-center'>
          <div className='flex flex-col'>
            <label
              htmlFor='client-select'
              className='text-sm font-medium text-gray-700 mb-1'
            >
              Cliente
            </label>
            <select
              id='client-select'
              value={client}
              onChange={handleClientChange}
              className='rounded-md border-gray-300 shadow-sm px-4 py-2 bg-white'
              data-testid='client-selector'
            >
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className='flex flex-col'>
            <label
              htmlFor='year-select'
              className='text-sm font-medium text-gray-700 mb-1'
            >
              Año
            </label>
            <select
              id='year-select'
              value={year}
              onChange={handleYearChange}
              className='rounded-md border-gray-300 shadow-sm px-4 py-2 bg-white'
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className='flex flex-col'>
            <label
              htmlFor='month-select'
              className='text-sm font-medium text-gray-700 mb-1'
            >
              Mes
            </label>
            <select
              id='month-select'
              value={month}
              onChange={handleMonthChange}
              className='rounded-md border-gray-300 shadow-sm px-4 py-2 bg-white'
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='flex gap-4 mb-6 justify-center'>
          <Button className='bg-[#B9F264] text-black hover:bg-[#a7e052]'>
            Acción principal
          </Button>
          <Button className='bg-black text-white hover:bg-zinc-800'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
              <path
                fillRule='evenodd'
                d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
                clipRule='evenodd'
              />
            </svg>
            Donde ponerlo
          </Button>
        </div>
      </div>
    </header>
  );
}
