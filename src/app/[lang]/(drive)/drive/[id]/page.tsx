"use client";

import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function FolderDetailsPage() {
  const params = useParams();
  const folderId = params?.id as string;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center gap-4 mb-8'>
        <Link
          href='/drive'
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          aria-label='Back to drive'
        >
          <ArrowLeftIcon className='h-6 w-6' />
        </Link>
        <h1 className='text-3xl font-bold'>Folder Details</h1>
      </div>

      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center'>
        <h2 className='text-2xl font-semibold text-yellow-800 mb-2'>
          Under Construction
        </h2>
        <p className='text-yellow-700'>
          This page is currently being developed.
        </p>
      </div>
    </div>
  );
}
