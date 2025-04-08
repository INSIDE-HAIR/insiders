"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Copy, Check } from "lucide-react"
import contentData from "@/db/marketing-salon/content-data.json"

interface JsonViewerPageProps {
  params: {
    id: string
  }
}

export default function JsonViewerPage({ params }: JsonViewerPageProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(contentData, null, 2)
    navigator.clipboard.writeText(jsonString).then(
      () => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      },
      (err) => {
        console.error("Error al copiar JSON:", err)
      },
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Visualizador JSON Completo</h1>
        <Button onClick={handleCopyJson} className="bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-2">
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar JSON
            </>
          )}
        </Button>
      </div>

      <div
        className="flex-1 overflow-auto bg-zinc-900 p-4 rounded border border-zinc-700 font-mono text-sm"
        style={{
          maxHeight: "calc(100vh - 120px)",
          scrollbarWidth: "thin",
          scrollbarColor: "#CEFF66 #3f3f46",
        }}
      >
        <pre className="whitespace-pre-wrap">{JSON.stringify(contentData, null, 2)}</pre>
      </div>
    </div>
  )
}

