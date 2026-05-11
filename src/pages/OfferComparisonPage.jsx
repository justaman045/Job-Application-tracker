import { useState, useMemo } from 'react'
import { Trophy, Check } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { StatusBadge } from '../components/shared/StatusBadge'
import { WeightedScoring } from '../components/offers/WeightedScoring'
import { CardSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { EmptyState } from '../components/shared/EmptyState'
import { OFFER_CRITERIA } from '../lib/constants'

export function OfferComparisonPage() {
  const { apps, loading, error } = useApplications()

  const offers = useMemo(() => apps.filter((a) => a.status === 'offer' || a.status === 'accepted'), [apps])

  const [selected, setSelected] = useState([])
  const [scores, setScores] = useState({})
  const [weights, setWeights] = useState(
    Object.fromEntries(OFFER_CRITERIA.map((c) => [c.key, 5]))
  )

  const toggleOffer = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
    if (!scores[id]) {
      setScores((prev) => ({ ...prev, [id]: Object.fromEntries(OFFER_CRITERIA.map((c) => [c.key, 5])) }))
    }
  }

  const handleScoreChange = (offerId, criterion, value) => {
    setScores((prev) => ({
      ...prev,
      [offerId]: { ...(prev[offerId] || {}), [criterion]: value },
    }))
  }

  const handleWeightChange = (criterion, value) => {
    setWeights((prev) => ({ ...prev, [criterion]: value }))
  }

  if (loading) return <CardSkeleton count={4} />
  if (error) return <ErrorDisplay message={error} />

  const comparisonApps = selected.length > 0
    ? offers.filter((o) => selected.includes(o.id))
    : offers.slice(0, 2)

  const maxPossible = OFFER_CRITERIA.reduce((sum, c) => sum + 10 * (weights[c.key] || 5), 0)

  const bestOfferIds = comparisonApps.length < 2
    ? []
    : (() => {
      const totals = comparisonApps.map((o) => {
        const offerScores = scores[o.id] || Object.fromEntries(OFFER_CRITERIA.map((c) => [c.key, 5]))
        return OFFER_CRITERIA.reduce((sum, c) => sum + (offerScores[c.key] || 0) * (weights[c.key] || 5), 0)
      })
      const maxScore = Math.max(...totals)
      return comparisonApps.filter((_, i) => totals[i] === maxScore).map((o) => o.id)
    })()

  const getTotalScore = (offerId) => {
    const offerScores = scores[offerId] || Object.fromEntries(OFFER_CRITERIA.map((c) => [c.key, 5]))
    return OFFER_CRITERIA.reduce((sum, c) => sum + (offerScores[c.key] || 0) * (weights[c.key] || 5), 0)
  }

  if (!offers.length) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Offer Comparison</h1>
        <EmptyState icon="file" title="No offers yet" message="Applications with 'Offer' or 'Accepted' status will appear here for comparison." />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offer Comparison</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compare offers side by side with weighted scoring</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select offers to compare (click to toggle)</h3>
        <div className="flex flex-wrap gap-2">
          {offers.map((offer) => (
            <button
              key={offer.id}
              onClick={() => toggleOffer(offer.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selected.includes(offer.id)
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {offer.companyName}
              <StatusBadge status={offer.status} />
            </button>
          ))}
        </div>
      </div>

      {comparisonApps.length >= 1 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparisonApps.map((offer) => (
              <div key={offer.id} className={`bg-white dark:bg-gray-900 rounded-xl border p-6 shadow-sm ${
                bestOfferIds.includes(offer.id) && comparisonApps.length > 1
                  ? 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800'
                  : 'border-gray-200 dark:border-gray-800'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{offer.companyName}</h3>
                      {bestOfferIds.includes(offer.id) && comparisonApps.length > 1 && (
                        <Trophy className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{offer.position}</p>
                  </div>
                  <StatusBadge status={offer.status} />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Salary</span><span className="font-medium text-gray-900 dark:text-gray-100">{offer.salaryInfo || '—'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Location</span><span className="text-gray-900 dark:text-gray-100 capitalize">{offer.locationType || '—'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Rating</span><span className="text-gray-900 dark:text-gray-100">{offer.companyRating ? '⭐'.repeat(offer.companyRating) : '—'}</span></div>
                </div>
                <WeightedScoring
                  scores={scores[offer.id] || Object.fromEntries(OFFER_CRITERIA.map((c) => [c.key, 5]))}
                  weights={weights}
                  onScoreChange={(c, v) => handleScoreChange(offer.id, c, v)}
                  onWeightChange={handleWeightChange}
                />
              </div>
            ))}
          </div>

          {comparisonApps.length >= 2 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Side-by-Side Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Criterion</th>
                      {comparisonApps.map((o) => (
                        <th key={o.id} className="text-center px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">{o.companyName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {OFFER_CRITERIA.map((criterion) => {
                      const vals = comparisonApps.map((o) => (scores[o.id] || {})[criterion.key] || 5)
                      const maxVal = Math.max(...vals)
                      return (
                        <tr key={criterion.key}>
                          <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{criterion.label}</td>
                          {comparisonApps.map((o, i) => (
                            <td key={o.id} className={`px-3 py-2 text-center ${vals[i] === maxVal ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                              <div className="flex items-center justify-center gap-1">
                                {vals[i] === maxVal && vals.length > 1 && <Trophy className="w-3 h-3 text-emerald-500" />}
                                {vals[i]}
                              </div>
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900 dark:text-white">Total Score</td>
                      {comparisonApps.map((o) => {
                        const total = getTotalScore(o.id)
                        const maxScore = Math.max(...comparisonApps.map((a) => getTotalScore(a.id)))
                        return (
                          <td key={o.id} className={`px-3 py-3 text-center font-bold text-lg ${
                            total === maxScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <div className="flex items-center justify-center gap-1">
                              {total === maxScore && <Check className="w-4 h-4 text-emerald-500" />}
                              {total}
                              <span className="text-xs text-gray-400 font-normal">/{maxPossible}</span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {comparisonApps.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
          Select offers above to compare them
        </div>
      )}
    </div>
  )
}
