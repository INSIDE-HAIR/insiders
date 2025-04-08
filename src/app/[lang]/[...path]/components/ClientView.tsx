"use client";

import React, { useState } from "react";
import { HierarchyItem } from "@drive/types/hierarchy";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Check, Copy } from "lucide-react";

interface ClientViewProps {
  title?: string | null;
  subtitle?: string | null;
  hierarchy: HierarchyItem[];
  lastUpdated: Date;
}

export default function ClientView({
  title,
  subtitle,
  hierarchy,
  lastUpdated,
}: ClientViewProps) {
  const [copied, setCopied] = useState(false);

  // Función para copiar el JSON
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(hierarchy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset después de 2 segundos
  };

  return (
    <div className='space-y-6'>
      {(title || subtitle) && (
        <div className='text-center'>
          {title && (
            <h1 className='text-3xl font-bold mb-2 text-zinc-100'>{title}</h1>
          )}
          {subtitle && <p className='text-xl text-zinc-400'>{subtitle}</p>}
        </div>
      )}

      <Card className='overflow-hidden bg-zinc-900 border-zinc-800'>
        <CardContent className='p-0 relative'>
          {/* Botón de copiar fijo en la esquina superior derecha */}
          <Button
            variant='ghost'
            size='sm'
            className='absolute top-2 right-2 z-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className='h-4 w-4 mr-1' /> Copiado
              </>
            ) : (
              <>
                <Copy className='h-4 w-4 mr-1' /> Copiar JSON
              </>
            )}
          </Button>

          {/* JSON View */}
          <div className='bg-zinc-950 text-zinc-100 p-4 overflow-y-auto max-h-[70vh] font-mono text-sm'>
            <pre>{JSON.stringify(hierarchy, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>

      <div className='text-center text-sm text-zinc-400'>
        Última actualización: {lastUpdated.toLocaleString()}
      </div>
    </div>
  );
}
