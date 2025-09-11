import type { ReactNode } from "react"

interface DocContentProps {
  children: ReactNode
}

export function DocContent({ children }: DocContentProps) {
  return (
    <div className="px-8 py-6">
      <div className="mx-auto  prose prose-zinc prose-headings:font-semibold prose-headings:tracking-tight prose-lead:text-zinc-600 prose-a:text-[#CEFF66] prose-a:font-semibold hover:prose-a:text-[#bfef33]">
        {children}
      </div>
    </div>
  )
}

