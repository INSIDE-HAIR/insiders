import type { ReactNode } from "react"

interface DocHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export function DocHeader({ title, description, children }: DocHeaderProps) {
  return (
    <div className="border-b border-zinc-200 bg-white px-8 py-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
        {description && <p className="mt-2 text-lg text-zinc-600">{description}</p>}
        {children}
      </div>
    </div>
  )
}

