"use client";

interface CardHeaderProps {
  fileInfo: any;
  fileType?: string;
  cardCode?: string;
  defaultTitle?: string;
}

export function CardHeader({
  fileInfo,
  cardCode = "ES-XX",
  defaultTitle = "Cartel A4 21x29,7cm",
}: CardHeaderProps) {
  return (
    <div className='p-2 text-xs flex justify-between items-center'>
      <span className='font-bold'>{fileInfo ? cardCode : "ES-XX"}</span>
      <span className='truncate'>{fileInfo?.fileType || defaultTitle}</span>
    </div>
  );
}
