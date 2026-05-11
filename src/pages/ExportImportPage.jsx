import { useState, useRef } from 'react'
import { Download, Upload, FileText, FileJson } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { useToast } from '../contexts/ToastContext'
import { format } from 'date-fns'
import { TableSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'

function parseCSV(text) {
  const lines = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) { lines.push(current.trim()); current = '' }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current) { lines.push(current.trim()); current = '' }
    } else { current += ch }
  }
  if (current) lines.push(current.trim())
  if (lines.length < 2) return []

  const headerCount = lines[0].split(',').length
  const rows = []
  let i = 1
  while (i < lines.length) {
    const row = []
    for (let j = 0; j < headerCount && i < lines.length; j++) {
      row.push(lines[i])
      i++
    }
    if (row.some((c) => c)) rows.push(row)
  }
  return rows
}

function csvToApps(rows) {
  return rows.map((row) => {
    const get = (i) => row[i] || ''
    return {
      companyName: get(0) || 'Unknown',
      position: get(1) || 'Unknown',
      applicationDate: get(2) || new Date().toISOString().split('T')[0],
      status: ['applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'ghosted', 'withdrawn'].includes(get(3)) ? get(3) : 'applied',
      applicationSource: get(4),
      locationType: get(5),
      salaryInfo: get(6),
      companyRating: Number(get(7)) || null,
      tags: get(8) ? get(8).split(';').map((t) => t.trim()).filter(Boolean) : [],
      jobPostingUrl: get(9),
      notes: get(10),
      resumeVersion: get(11),
      coverLetter: get(12),
      contactPerson: get(13),
      contactEmail: get(14),
      companyWebsite: get(15),
      followUpDate: get(16) || null,
      rejectionReason: get(17),
      offerSalary: Number(get(18)) || null,
      offerEquity: get(19),
      offerBonus: get(20),
      offerBenefits: get(21),
    }
  })
}

function detectLinkedInCSV(rows) {
  if (!rows.length) return false
  const header = Object.values(rows[0]).join(' ').toLowerCase()
  return header.includes('company name') && header.includes('date applied')
}

function linkedinCsvToApps(rows) {
  return rows.map((row) => {
    const keys = Object.keys(row)
    const get = (key) => {
      const match = keys.find((k) => k.toLowerCase().trim() === key.toLowerCase())
      return match ? (row[match] || '') : ''
    }
    return {
      companyName: get('Company Name') || get('Company') || 'Unknown',
      position: get('Position') || get('Title') || 'Unknown',
      applicationDate: get('Date Applied') || get('Application Date') || new Date().toISOString().split('T')[0],
      status: 'applied',
      applicationSource: 'linkedin',
      jobPostingUrl: get('URL') || get('Job Posting Url') || '',
      notes: get('Notes') || get('Notes on Application') || '',
      locationType: get('Location') || '',
      resumeVersion: '',
      coverLetter: '',
      contactPerson: get('Hiring Contact') || '',
      contactEmail: '',
      salaryInfo: '',
      tags: [],
      companyWebsite: '',
      companyRating: null,
      followUpDate: null,
      rejectionReason: '',
      offerSalary: null,
      offerEquity: '',
      offerBonus: '',
      offerBenefits: '',
      interviewRounds: [],
    }
  })
}

export function ExportImportPage() {
  const { apps, loading, error, addApplication } = useApplications()
  const { addToast } = useToast()
  const fileRef = useRef()
  const [importing, setImporting] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [importData, setImportData] = useState(null)

  const csvQuote = (val) => {
    const s = String(val ?? '')
    return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const exportCSV = () => {
    if (!apps.length) {
      addToast('No applications to export', 'error')
      return
    }
    const headers = ['Company', 'Position', 'Date', 'Status', 'Source', 'Location', 'Salary', 'Rating', 'Tags', 'URL', 'Notes', 'Resume', 'Cover Letter', 'Contact', 'Contact Email', 'Website', 'Follow-up', 'Rejection Reason', 'Offer Salary', 'Offer Equity', 'Offer Bonus', 'Offer Benefits']
    const rows = apps.map((a) => [
      a.companyName,
      a.position,
      a.applicationDate?.toDate ? format(a.applicationDate.toDate(), 'yyyy-MM-dd') : '',
      a.status,
      a.applicationSource,
      a.locationType,
      a.salaryInfo,
      a.companyRating || '',
      (a.tags || []).join('; '),
      a.jobPostingUrl,
      a.notes,
      a.resumeVersion,
      a.coverLetter,
      a.contactPerson,
      a.contactEmail,
      a.companyWebsite,
      a.followUpDate?.toDate ? format(a.followUpDate.toDate(), 'yyyy-MM-dd') : '',
      a.rejectionReason,
      a.offerSalary || '',
      a.offerEquity || '',
      a.offerBonus || '',
      a.offerBenefits || '',
    ].map(csvQuote))
    const csv = [headers.map(csvQuote), ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `north-applications-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('CSV exported', 'success')
  }

  const exportJSON = () => {
    if (!apps.length) {
      addToast('No applications to export', 'error')
      return
    }
    const data = apps.map((a) => ({
      ...a,
      applicationDate: a.applicationDate?.toDate ? a.applicationDate.toDate().toISOString() : a.applicationDate,
      followUpDate: a.followUpDate?.toDate ? a.followUpDate.toDate().toISOString() : a.followUpDate,
      statusHistory: (a.statusHistory || []).map((h) => ({
        ...h,
        changedAt: h.changedAt?.toDate ? h.changedAt.toDate().toISOString() : h.changedAt,
      })),
      interviewRounds: (a.interviewRounds || []).map((r) => ({
        ...r,
        date: r.date || '',
      })),
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `north-applications-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('JSON exported', 'success')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target.result
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text)
          if (!Array.isArray(data)) throw new Error('Invalid JSON format')
          setImportData(data)
          setShowImportConfirm(true)
        } else if (file.name.endsWith('.csv')) {
          const rows = parseCSV(text)
          if (rows.length === 0) throw new Error('No data found')
          const apps = detectLinkedInCSV(rows) ? linkedinCsvToApps(rows) : csvToApps(rows)
          setImportData(apps)
          setShowImportConfirm(true)
        } else {
          addToast('Please select a .json or .csv file', 'error')
        }
      } catch (err) {
        addToast(err.message || 'Invalid file', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImport = async () => {
    setShowImportConfirm(false)
    if (!importData || !importData.length) return
    setImporting(true)
    let success = 0
    let failed = 0
    for (const item of importData) {
      try {
        await addApplication(item)
        success++
      } catch {
        failed++
      }
    }
    setImportData(null)
    setImporting(false)
    addToast(`Imported ${success} applications${failed > 0 ? `, ${failed} failed` : ''}`, failed > 0 ? 'error' : 'success')
  }

  if (loading) return <div className="max-w-2xl mx-auto"><TableSkeleton rows={4} /></div>
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export / Import</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Backup, restore, or migrate your application data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={exportCSV} className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all text-left">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Export CSV</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Open in Excel or Google Sheets</p>
          </div>
          <Download className="w-5 h-5 text-gray-400 ml-auto" />
        </button>

        <button onClick={exportJSON} className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all text-left">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <FileJson className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Export JSON</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Full backup with all fields</p>
          </div>
          <Download className="w-5 h-5 text-gray-400 ml-auto" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <Upload className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Import from File</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Supports JSON backup, CSV export, and LinkedIn CSV</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".json,.csv" onChange={handleFileSelect} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="w-full py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
        >
          {importing ? 'Importing...' : 'Select JSON or CSV file to import'}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Applications will be appended to your existing data. Duplicates are not detected automatically.
        </p>
      </div>

      <ConfirmDialog
        open={showImportConfirm}
        title={`Import ${importData?.length || 0} applications?`}
        message="These will be added to your existing applications. This cannot be undone."
        confirmLabel="Import"
        variant="info"
        onConfirm={handleImport}
        onCancel={() => { setShowImportConfirm(false); setImportData(null) }}
      />
    </div>
  )
}
