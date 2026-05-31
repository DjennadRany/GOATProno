"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { isFavorite, toggleFavorite } from "@/services/favorites"
import type { FavoriteTeam } from "@/domain/favorite"

interface FavoriteButtonProps {
  team: FavoriteTeam
}

export default function FavoriteButton({ team }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    setFavorited(isFavorite(team.teamId))
  }, [team.teamId])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(team)
    setFavorited((prev) => !prev)
  }

  return (
    <button
      onClick={handleClick}
      title={favorited ? "Ne plus suivre" : "Suivre cette équipe"}
      className={`transition-colors ${
        favorited ? "text-yellow-400 hover:text-yellow-300" : "text-slate-500 hover:text-yellow-400"
      }`}
    >
      <Star size={12} fill={favorited ? "currentColor" : "none"} />
    </button>
  )
}
