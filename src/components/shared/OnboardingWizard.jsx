import { useState } from 'react'
import { Briefcase, Search, BarChart3, ArrowRight, Check, Upload } from 'lucide-react'

const steps = [
  {
    title: 'Welcome to North',
    description: 'Your personal job application tracker. Track every application, interview, and offer in one place.',
    icon: Briefcase,
  },
  {
    title: 'Add Applications',
    description: 'Click "New Application" to log each job you apply to. Add details like resume version, notes, and interview rounds.',
    icon: Upload,
  },
  {
    title: 'Stay Organized',
    description: 'Use the Kanban board to visualize your pipeline, or the list view to search, filter, and sort your applications.',
    icon: Search,
  },
  {
    title: 'Track Your Progress',
    description: 'The dashboard shows your stats — application rate, interview rate, offer rate, and pipeline velocity.',
    icon: BarChart3,
  },
]

export function OnboardingWizard({ open, onComplete }) {
  const [step, setStep] = useState(0)

  if (!open) return null

  const StepIcon = steps[step].icon
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('north-onboarded', 'true')
      onComplete()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('north-onboarded', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
        <div className="flex justify-end mb-2">
          <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Skip tour
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center mb-6">
            <StepIcon className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{steps[step].title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{steps[step].description}</p>
          <div className="flex gap-2 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md"
          >
            {isLast ? (
              <>Get Started <Check className="w-4 h-4" /></>
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
