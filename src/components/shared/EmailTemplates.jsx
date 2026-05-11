import { useState } from 'react'
import { Mail, Copy, Check, X } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'thank_you',
    label: 'Thank You (After Interview)',
    subject: 'Thank you for the {roundName} interview at {company}',
    body: `Hi {contactPerson || "Team"},

Thank you so much for taking the time to speak with me today about the {position} role at {company}. I really enjoyed learning more about the team and the exciting work you're doing.

Our conversation reinforced my enthusiasm for this opportunity. I'm confident that my experience in {skillArea} would allow me to contribute meaningfully to the team.

Please let me know if there's anything else you need from me. I look forward to hearing about the next steps.

Best regards,
{yourName}`,
  },
  {
    id: 'follow_up',
    label: 'Follow-up (1 Week)',
    subject: 'Following up on {position} application at {company}',
    body: `Hi {contactPerson || "Hiring Team"},

I hope this message finds you well. I'm writing to follow up on my application for the {position} role at {company}. I submitted my application on {applicationDate} and wanted to reiterate my strong interest in the opportunity.

I'm very excited about the possibility of joining {company} and contributing to your team. Please let me know if there's any additional information I can provide.

Thank you for your time and consideration.

Best regards,
{yourName}`,
  },
  {
    id: 'accept_offer',
    label: 'Accept Offer',
    subject: 'Offer acceptance — {position} at {company}',
    body: `Dear {contactPerson || "Hiring Team"},

Thank you so much for extending this offer for the {position} role at {company}. I'm thrilled to accept and look forward to joining the team.

I've reviewed and signed the offer letter. Please let me know if there are any additional steps or paperwork needed before my start date.

I'm excited to get started and contribute to {company}'s success. Thank you again for this wonderful opportunity.

Best regards,
{yourName}`,
  },
  {
    id: 'decline_offer',
    label: 'Decline Offer',
    subject: 'Regarding the {position} offer at {company}',
    body: `Dear {contactPerson || "Hiring Team"},

Thank you so much for offering me the {position} role at {company}. I truly appreciate the time and effort you and the team invested in the interview process.

After careful consideration, I have decided to accept another opportunity that aligns more closely with my current career goals. This was a difficult decision, as I have great respect for {company} and the team.

I wish you and {company} continued success, and I hope our paths cross again in the future.

Best regards,
{yourName}`,
  },
]

export function EmailTemplates({ open, onClose, app }) {
  const [activeTab, setActiveTab] = useState(TEMPLATES[0].id)
  const [copied, setCopied] = useState(false)

  if (!open || !app) return null

  const template = TEMPLATES.find((t) => t.id === activeTab) || TEMPLATES[0]

  const getNextInterviewRound = () => {
    if (!app.interviewRounds?.length) return ''
    const upcoming = app.interviewRounds.find((r) => r.date && new Date(r.date) >= new Date())
    return upcoming?.roundName || app.interviewRounds[app.interviewRounds.length - 1]?.roundName || ''
  }

  const roundName = getNextInterviewRound()

  const fillTemplate = (text) => {
    return text
      .replace(/\{contactPerson\}/g, app.contactPerson || 'Hiring Team')
      .replace(/\{company\}/g, app.companyName || 'the company')
      .replace(/\{position\}/g, app.position || 'the position')
      .replace(/\{roundName\}/g, roundName || 'recent')
      .replace(/\{applicationDate\}/g, app.applicationDate?.toDate ? app.applicationDate.toDate().toLocaleDateString() : 'recently')
      .replace(/\{skillArea\}/g, 'my field')
      .replace(/\{yourName\}/g, '')
  }

  const subject = fillTemplate(template.subject)
  const body = fillTemplate(template.body)

  const handleCopy = async () => {
    const full = `Subject: ${subject}\n\n${body}`
    try {
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard not available */ }
  }

  const handleMailto = () => {
    const mailto = `mailto:${app.contactEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Email Templates</h3>
          </div>
          <button data-close-dialog onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subject</label>
            <div className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              {subject}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Body</label>
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-3 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap font-mono text-xs leading-relaxed min-h-[200px]">
              {body}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleMailto}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Mail className="w-4 h-4" /> Open in Email
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md"
          >
            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy to Clipboard</>}
          </button>
        </div>
      </div>
    </div>
  )
}
