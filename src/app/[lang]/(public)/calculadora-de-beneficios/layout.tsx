"use client"

import type React from "react"
import Image from "next/image"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
// Ya no importamos StepSynchronizer

const inter = Inter({ subsets: ["latin"] })

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn("bg-brand-black text-brand-white min-h-screen flex flex-col", inter.className)}>
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-center sm:justify-start">
        <Image
          src="http://www.salons.insidehair.es/wp-content/uploads/2025/05/logo.png"
          alt="Inside Salons Logo"
          width={180}
          height={45}
          priority
        />
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        {/* StepSynchronizer eliminado */}
        {children}
      </main>
      <footer className="text-center py-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} InsideSalons. Todos los derechos reservados.
      </footer>
    </div>
  )
}
