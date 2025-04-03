import { Loader2 } from "lucide-react"

export function ImageLoading() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px] bg-zinc-800 rounded-sm">
      <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
    </div>
  )
}

