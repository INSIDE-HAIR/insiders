"use client";
import { Button } from "@/src/components/ui/button";
import { DialogTrigger } from "@/src/components/ui/dialog";

interface CardPreviewProps {
  children: React.ReactNode;
  onOpenModal?: () => void;
}

export function CardPreview({ children, onOpenModal }: CardPreviewProps) {
  return (
    <div className='relative bg-zinc-600 p-2'>
      {children}

      {onOpenModal && (
        <DialogTrigger asChild>
          <Button
            className='absolute right-2 top-2 rounded-full w-8 h-8 bg-white text-black hover:bg-[#B9F264] p-1 shadow-md'
            aria-label='Ver archivo'
            onClick={onOpenModal}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4'
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
          </Button>
        </DialogTrigger>
      )}
    </div>
  );
}
