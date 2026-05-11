export const STATUSES = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  { value: 'screening', label: 'Screening', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300' },
  { value: 'interview', label: 'Interview', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300' },
  { value: 'offer', label: 'Offer', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
  { value: 'ghosted', label: 'Ghosted', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
]

export const SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'naukri', label: 'Naukri' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'company_website', label: 'Company Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_email', label: 'Cold Email' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'job_fair', label: 'Job Fair' },
  { value: 'other', label: 'Other' },
]

export const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const INTERVIEW_OUTCOMES = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const OFFER_CRITERIA = [
  { key: 'salary', label: 'Salary', description: 'Base compensation' },
  { key: 'equity', label: 'Equity', description: 'Stock options / RSUs' },
  { key: 'location', label: 'Location', description: 'Office location & commute' },
  { key: 'growth', label: 'Growth', description: 'Career growth opportunities' },
  { key: 'culture', label: 'Culture', description: 'Team culture & values' },
  { key: 'benefits', label: 'Benefits', description: 'Health, perks, time off' },
]

export const REJECTION_REASONS = [
  { value: 'not_a_fit', label: 'Not a Fit' },
  { value: 'position_filled', label: 'Position Filled' },
  { value: 'no_response', label: 'No Response / Ghosted' },
  { value: 'visa_sponsorship', label: 'Visa Sponsorship' },
  { value: 'overqualified', label: 'Overqualified' },
  { value: 'underqualified', label: 'Underqualified / Skills Gap' },
  { value: 'salary_expectations', label: 'Salary Expectations' },
  { value: 'hiring_freeze', label: 'Hiring Freeze / Restructuring' },
  { value: 'internal_candidate', label: 'Internal Candidate' },
  { value: 'other', label: 'Other' },
]

export function getStatusConfig(value) {
  return STATUSES.find((s) => s.value === value) || STATUSES[0]
}

export const ITEMS_PER_PAGE = 20
