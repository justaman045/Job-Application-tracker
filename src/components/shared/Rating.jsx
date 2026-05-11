import { Star } from 'lucide-react'

export function StarSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star === value ? 0 : star)}
          className={`w-6 h-6 rounded-full transition-colors ${
            star <= value ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

export function StarDisplay({ rating }) {
  if (!rating) return <span className="text-gray-300 dark:text-gray-600">—</span>
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
  )
}
