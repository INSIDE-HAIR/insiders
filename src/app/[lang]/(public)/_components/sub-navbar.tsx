"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/lib/utils"
import subNavbarRoutes from "@/src/routes/sub-navbar-routes.json"

export default function SubNavbar() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const pathname = usePathname()
  const observer = useRef<IntersectionObserver | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null)
      return
    }

    // Initialize refs for sections
    subNavbarRoutes.forEach((route) => {
      sectionRefs.current[route.id] = document.getElementById(route.id)
    })

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-50% 0px -50% 0px" }, // Activate when section is in middle of viewport
    )

    const currentObserver = observer.current

    Object.values(sectionRefs.current).forEach((sectionEl) => {
      if (sectionEl) {
        currentObserver.observe(sectionEl)
      }
    })

    return () => {
      Object.values(sectionRefs.current).forEach((sectionEl) => {
        if (sectionEl) {
          currentObserver.unobserve(sectionEl)
        }
      })
    }
  }, [pathname])

  if (pathname !== "/") {
    return null
  }

  return (
    <nav className="hidden md:flex sticky top-[88.719px] z-40 bg-primary text-primary-foreground shadow-md">
      {/* Adjust top value based on actual height of PublicHeader */}
      <div className="container mx-auto px-4 sm:px-6 flex justify-center items-center h-12 space-x-6 lg:space-x-10">
        {subNavbarRoutes.map((route) => (
          <Link
            key={route.label}
            href={route.href}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(route.id)?.scrollIntoView({ behavior: "smooth" })
              setActiveSection(route.id)
            }}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary-foreground/80",
              activeSection === route.id
                ? "font-bold border-b-2 border-primary-foreground pb-1"
                : "text-primary-foreground/90",
            )}
          >
            {route.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
