"use client"

import { useState, useEffect, useCallback } from "react"
import type { FavoriteTeam } from "@/domain/favorite"
import { getAllFavorites } from "@/services/favorites"
import Header from "@/components/Header"
import FavoritesMatchList from "@/components/FavoritesMatchList"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([])

  const refresh = useCallback(() => {
    setFavorites(getAllFavorites())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="Mes équipes" backHref="/" />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <FavoritesMatchList favorites={favorites} onFavoritesChanged={refresh} />
      </main>
    </div>
  )
}
