export default function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-slate-800 rounded-xl p-4 animate-pulse border border-slate-700"
        >
          <div className="flex justify-between mb-3">
            <div className="h-3 bg-slate-700 rounded w-1/4" />
            <div className="h-3 bg-slate-700 rounded w-1/5" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 bg-slate-700 rounded-full" />
              <div className="h-3 bg-slate-700 rounded w-3/4" />
            </div>
            <div className="h-8 bg-slate-700 rounded w-16" />
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 bg-slate-700 rounded-full" />
              <div className="h-3 bg-slate-700 rounded w-3/4" />
            </div>
          </div>
          <div className="mt-4 h-10 bg-slate-700 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
