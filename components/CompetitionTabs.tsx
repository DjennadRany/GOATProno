"use client"

interface Tab {
  key: string
  label: string
}

interface CompetitionTabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
}

export default function CompetitionTabs({ tabs, active, onChange }: CompetitionTabsProps) {
  return (
    <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            active === tab.key
              ? "bg-teal-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
