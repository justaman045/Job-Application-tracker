import { OFFER_CRITERIA } from '../../lib/constants'

export function WeightedScoring({ scores, weights, onScoreChange, onWeightChange }) {
  const total = OFFER_CRITERIA.reduce((sum, c) => {
    return sum + (scores[c.key] || 0) * (weights[c.key] || 5)
  }, 0)
  const maxPossible = OFFER_CRITERIA.reduce((sum, c) => sum + 10 * (weights[c.key] || 5), 0)
  const percentage = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0

  return (
    <div className="space-y-3">
      {OFFER_CRITERIA.map((criterion) => (
        <div key={criterion.key}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{criterion.label}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{criterion.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Weight:</label>
              <select
                value={weights[criterion.key] || 5}
                onChange={(e) => onWeightChange(criterion.key, Number(e.target.value))}
                className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-1 dark:text-gray-200"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="10"
              value={scores[criterion.key] || 5}
              onChange={(e) => onScoreChange(criterion.key, Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6 text-right">{scores[criterion.key] || 5}</span>
          </div>
        </div>
      ))}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Score</span>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-indigo-500">{total}</span>
            <span className="text-xs text-gray-400">({percentage}%)</span>
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  )
}
