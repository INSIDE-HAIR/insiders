import type { ReactNode } from "react"
import { DocsNavigation } from "@/src/components/marketing-salon/docs/docs-navigation"
import { SidebarProvider } from "@/src/components/ui/sidebar"

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden">
          <DocsNavigation />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  )
}

