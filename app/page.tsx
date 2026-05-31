import Image from "next/image"
import { COMPETITIONS } from "@/domain/competition"
import Header from "@/components/Header"
import CompetitionCard from "@/components/CompetitionCard"

export default function HomePage() {
  const cups = COMPETITIONS.filter((c) => c.type === "CUP")
  const leagues = COMPETITIONS.filter((c) => c.type === "LEAGUE")

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      {/* Hero logo */}
      <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
        <Image
          src="/GOATPromo_Logo.png"
          alt="GOATProno"
          width={350}
          height={350}
          className="object-contain drop-shadow-2xl"
          priority
          unoptimized
        />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Coupes &amp; Compétitions internationales
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cups.map((comp) => (
              <CompetitionCard key={comp.code} competition={comp} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Championnats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {leagues.map((comp) => (
              <CompetitionCard key={comp.code} competition={comp} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
