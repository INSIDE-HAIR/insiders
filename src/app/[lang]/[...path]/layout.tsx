import React from "react";
import { auth } from "@/src/config/auth/auth";

export const metadata = {
  title: "Visor de Drive",
  description: "Visor dinámico de contenido de Google Drive",
};

export default async function DrivePathLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { path: string[]; lang: string };
}) {
  const session = await auth();
  const isDevelopment = process.env.NODE_ENV === "development";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className='drive-content-wrapper'>
      {isDevelopment && isAdmin && (
        <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 fixed bottom-0 right-0 max-w-sm z-50 shadow-lg rounded-l-lg'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-yellow-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>
                Ruta dinámica: /{params.lang}/{params.path.join("/")}
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
