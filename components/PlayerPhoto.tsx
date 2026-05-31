"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { getPlayerPhoto } from "@/services/wikidataMedia"

interface PlayerPhotoProps {
  playerName: string
  size?: number
  className?: string
}

export default function PlayerPhoto({ playerName, size = 48, className = "" }: PlayerPhotoProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlayerPhoto(playerName).then((url) => {
      setSrc(url)
      setLoading(false)
    })
  }, [playerName])

  const style = { width: size, height: size }

  if (loading) {
    return (
      <div
        style={style}
        className={`rounded-full bg-slate-700 animate-pulse shrink-0 ${className}`}
      />
    )
  }

  if (!src) {
    return (
      <div
        style={style}
        className={`rounded-full bg-slate-700 flex items-center justify-center shrink-0 ${className}`}
      >
        <User size={size * 0.45} className="text-slate-500" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={playerName}
      style={style}
      className={`rounded-full object-cover shrink-0 ${className}`}
    />
  )
}
