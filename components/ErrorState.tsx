interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-slate-300 mb-6 text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
      >
        Réessayer
      </button>
    </div>
  )
}
