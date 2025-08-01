import Link from "next/link"
import Image from "next/image"
import { Icons } from "@/src/components/shared/icons"
import footerRoutesData from "@/src/routes/footer-routes.json"

type SubRoute = { path: string; sub?: Record<string, SubRoute> }
type FooterRoutesType = Record<string, SubRoute>

const typedFooterRoutes = footerRoutesData as FooterRoutesType

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const logoSrc = "https://lh3.googleusercontent.com/d/1EKdctOIcuowPzQ8aLZXe14EkPKIWPfnT"

  // Divide sitemap into chunks for layout
  const sitemapEntries = Object.entries(typedFooterRoutes)
  const chunkSize = Math.ceil(sitemapEntries.length / 4)
  const sitemapChunks = []
  for (let i = 0; i < sitemapEntries.length; i += chunkSize) {
    sitemapChunks.push(sitemapEntries.slice(i, i + chunkSize))
  }

  return (
    <footer className="bg-background border-t border-border text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 xl:gap-12">
          <div className="col-span-full lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={logoSrc || "https://source.unsplash.com/random/150x40?Logo+Minimalist"}
                alt="Inside Hair Logo"
                width={150}
                height={40}
              />
            </Link>
            <p className="text-sm">Transformamos dueños de salones en empresarios de éxito.</p>
            <Link
              href="/dashboard"
              className="mt-4 text-xs text-muted-foreground/70 hover:text-primary transition-colors block"
            >
              Acceso Portal Cliente
            </Link>
            <Link
              href="/dashboard/admin"
              className="mt-1 text-xs text-muted-foreground/70 hover:text-primary transition-colors block"
            >
              Acceso Back-Office
            </Link>
          </div>

          {sitemapChunks.map((chunk, chunkIndex) => (
            <div key={`chunk-${chunkIndex}`} className="space-y-6">
              {chunk.map(([key, value]) => (
                <div key={key}>
                  <h5 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">
                    <Link href={value.path} className="hover:text-primary transition-colors">
                      {key}
                    </Link>
                  </h5>
                  {value.sub && (
                    <ul className="space-y-1">
                      {Object.entries(value.sub).map(([subKey, subValue]) => (
                        <li key={subKey}>
                          <Link href={subValue.path} className="text-sm hover:text-primary transition-colors">
                            {subKey}
                          </Link>
                          {/* For deeper levels, you might need a recursive component or limit depth here */}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground/80 mb-4 md:mb-0">
            &copy; {currentYear} INSIDE HAIR. Todos los derechos reservados.
          </p>
          <div className="flex space-x-5">
            {[Icons.Facebook, Icons.Youtube, Icons.Instagram, Icons.Linkedin, Icons.Twitter].map((Icon, index) => (
              <a
                key={index}
                href="#" // Replace with actual social links
                className="text-muted-foreground/80 hover:text-primary transition-colors"
                aria-label={`Social media ${index + 1}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
