"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star, ClipboardList } from "lucide-react"
import SearchBar from "./SearchBar"

interface HeaderProps {
  title?: string
  backHref?: string
  competitionEmblem?: string
}

export default function Header({ title, backHref, competitionEmblem }: HeaderProps) {
  return (
    <div className="sticky top-0 z-30">
      {/* Barre de navigation */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-3">
          {backHref ? (
            <Link href={backHref} className="text-slate-400 hover:text-white transition-colors mr-1 shrink-0">
              <ArrowLeft size={20} />
            </Link>
          ) : null}

          {/* Logo ou emblème compétition */}
          {title ? (
            competitionEmblem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={competitionEmblem} alt="" className="w-7 h-7 object-contain shrink-0" />
            ) : null
          ) : (
            <Link href="/" className="shrink-0">
              <Image
                src="/GOATPromo_Logo.png"
                alt="GOATProno"
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-teal-400 leading-none truncate">
              {title ?? "GOATProno"}
            </h1>
            {!title && (
              <p className="text-xs text-slate-400">
                Pronostique. Gagne. Devance les autres.
              </p>
            )}
          </div>

          <nav className="flex items-center gap-4 shrink-0">
            <Link href="/pronos" className="text-slate-400 hover:text-teal-400 transition-colors" title="Mes pronostics">
              <ClipboardList size={20} />
            </Link>
            <Link href="/favorites" className="text-slate-400 hover:text-yellow-400 transition-colors" title="Mes équipes favorites">
              <Star size={20} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Barre de recherche — toujours visible sous la nav */}
      <SearchBar />
    </div>
  )
}
