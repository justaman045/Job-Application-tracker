import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft, Edit3, Trash2, Copy, Archive, RotateCcw, ExternalLink, Mail, Bookmark } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { useToast } from '../contexts/ToastContext'
import { STATUSES, SOURCES, LOCATION_TYPES, REJECTION_REASONS } from '../lib/constants'
import { StatusBadge } from '../components/shared/StatusBadge'
import { InterviewRounds } from '../components/applications/InterviewRounds'
import { StatusHistory } from '../components/applications/StatusHistory'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import { DetailSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { StarDisplay } from '../components/shared/Rating'
import { InfoRow } from '../components/shared/Field'
import { EmailTemplates } from '../components/shared/EmailTemplates'

export function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getApplication, updateApplication, deleteApplication, duplicateApplication, archiveApplication, unarchiveApplication } = useApplications()
  const { addToast } = useToast()

  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true')
  const [showDelete, setShowDelete] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  const [form, setForm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getApplication(id)
      if (!data) { setError('Application not found'); return }
      setApp(data)
      setForm({
        companyName: data.companyName || '',
        position: data.position || '',
        jobPostingUrl: data.jobPostingUrl || '',
        notes: data.notes || '',
        resumeVersion: data.resumeVersion || '',
        coverLetter: data.coverLetter || '',
        contactPerson: data.contactPerson || '',
        contactEmail: data.contactEmail || '',
        salaryInfo: data.salaryInfo || '',
        tags: (data.tags || []).join(', '),
        applicationSource: data.applicationSource || '',
        locationType: data.locationType || '',
        companyWebsite: data.companyWebsite || '',
        companyRating: data.companyRating || 0,
        followUpDate: data.followUpDate?.toDate ? data.followUpDate.toDate().toISOString().split('T')[0] : '',
        interviewRounds: data.interviewRounds || [],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, getApplication])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false)
    setSaving(true)
    try {
      await updateApplication(id, { status: newStatus })
      addToast(`Status changed to ${newStatus}`, 'success')
      load()
    } catch { addToast('Failed to update status', 'error') }
    finally { setSaving(false) }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await updateApplication(id, {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        companyRating: form.companyRating || null,
        followUpDate: form.followUpDate || null,
      })
      addToast('Application updated', 'success')
      setEditing(false)
      load()
    } catch { addToast('Failed to update', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setShowDelete(false)
    try {
      await deleteApplication(id)
      addToast('Application deleted', 'success')
      navigate('/applications')
    } catch { addToast('Failed to delete', 'error') }
  }

  const handleDuplicate = async () => {
    try {
      await duplicateApplication(id)
      addToast('Application duplicated', 'success')
      load()
    } catch { addToast('Failed to duplicate', 'error') }
  }

  const handleArchive = async () => {
    try {
      if (app.archived) {
        await unarchiveApplication(id)
        addToast('Application restored', 'success')
      } else {
        await archiveApplication(id)
        addToast('Application archived', 'success')
      }
      load()
    } catch { addToast('Failed to archive', 'error') }
  }

  const handleToggleProspect = async () => {
    try {
      await updateApplication(id, { prospect: !app.prospect })
      addToast(app.prospect ? 'Removed from prospects' : 'Added to prospects', 'success')
      load()
    } catch { addToast('Failed to update prospect status', 'error') }
  }

  if (loading) return <DetailSkeleton />
  if (error) return <ErrorDisplay message={error} />
  if (!app) return null

  const date = app.applicationDate?.toDate ? app.applicationDate.toDate() : new Date(app.applicationDate)

  const tagColors = ['bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300']

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/applications')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleProspect} className={`p-2 rounded-lg transition-colors ${app.prospect ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`} title={app.prospect ? 'Remove from prospects' : 'Add to prospects'} aria-label={app.prospect ? 'Remove from prospects' : 'Add to prospects'}>
            <Bookmark className={`w-4 h-4 ${app.prospect ? 'fill-amber-400' : ''}`} />
          </button>
          <button onClick={() => setShowEmail(true)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Email Templates" aria-label="Email templates">
            <Mail className="w-4 h-4" />
          </button>
          <button onClick={handleDuplicate} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Duplicate" aria-label="Duplicate application">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handleArchive} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title={app.archived ? 'Restore' : 'Archive'} aria-label={app.archived ? 'Restore application' : 'Archive application'}>
            {app.archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          </button>
          <button onClick={() => { setEditing(!editing); if (!editing) load() }} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Edit" aria-label="Edit application">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => setShowDelete(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete" aria-label="Delete application">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{app.companyName}</h1>
            <StatusBadge status={app.status} className="text-sm px-3 py-1" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">{app.position}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md"
          >
            Change Status
          </button>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-20 animate-fade-in">
                {STATUSES.filter((s) => s.value !== app.status).map((s) => (
                  <button key={s.value} onClick={() => handleStatusChange(s.value)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors first:rounded-t-xl last:rounded-b-xl">
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Edit Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input type="text" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Posting URL</label>
                <input type="url" value={form.jobPostingUrl} onChange={(e) => setForm({ ...form, jobPostingUrl: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Website</label>
                <input type="url" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume Version</label>
                <input type="text" value={form.resumeVersion} onChange={(e) => setForm({ ...form, resumeVersion: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary Info</label>
                <input type="text" value={form.salaryInfo} onChange={(e) => setForm({ ...form, salaryInfo: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                <input type="text" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Follow-up Date</label>
                <input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200 resize-none" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <InterviewRounds rounds={form.interviewRounds} onChange={(rounds) => setForm({ ...form, interviewRounds: rounds })} />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setEditing(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button onClick={handleSaveEdit} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Application Info</h2>
              <InfoRow label="Applied" value={format(date, 'MMMM d, yyyy')} />
              <InfoRow label="Source" value={SOURCES.find((s) => s.value === app.applicationSource)?.label || app.applicationSource || '—'} />
              <InfoRow label="Location" value={LOCATION_TYPES.find((l) => l.value === app.locationType)?.label || app.locationType || '—'} />
              <InfoRow label="Salary" value={app.salaryInfo} />
              <InfoRow label="Rating" value={<StarDisplay rating={app.companyRating} />} />
              {app.jobPostingUrl && (
                <InfoRow label="Job URL" value={
                  <a href={app.jobPostingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-600">
                    View posting <ExternalLink className="w-3 h-3" />
                  </a>
                } />
              )}
              {app.companyWebsite && (
                <InfoRow label="Website" value={
                  <a href={app.companyWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-600">
                    Visit site <ExternalLink className="w-3 h-3" />
                  </a>
                } />
              )}
              {app.followUpDate && (
                <InfoRow label="Follow-up" value={format(app.followUpDate.toDate(), 'MMMM d, yyyy')} />
              )}
              {app.tags?.length > 0 && (
                <InfoRow label="Tags" value={
                  <div className="flex flex-wrap gap-1.5">
                    {app.tags.map((tag, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[i % tagColors.length]}`}>{tag}</span>
                    ))}
                  </div>
                } />
              )}
            </div>

            {app.jobDescription && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Job Description</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{app.jobDescription}</p>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Notes</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{app.notes || <span className="text-gray-300 dark:text-gray-600 italic">No notes added</span>}</p>
            </div>

            {app.companyNotes && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company Research</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{app.companyNotes}</p>
              </div>
            )}

            {app.customFields?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Custom Fields</h2>
                <div className="space-y-2">
                  {app.customFields.map((f, i) => (
                    f.key ? <InfoRow key={i} label={f.key} value={f.value} /> : null
                  ))}
                </div>
              </div>
            )}

            {(app.contactPerson || app.contactEmail) && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact</h2>
                <InfoRow label="Contact" value={app.contactPerson} />
                <InfoRow label="Email" value={
                  app.contactEmail ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-900 dark:text-gray-100">{app.contactEmail}</span>
                      <a href={`mailto:${app.contactEmail}?subject=${encodeURIComponent(`Application for ${app.position} at ${app.companyName}`)}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 text-xs" title="Send email">Send</a>
                      <a href={`mailto:${app.contactEmail}?subject=${encodeURIComponent(`Follow-up: ${app.position} at ${app.companyName}`)}&body=${encodeURIComponent(`Hi ${app.contactPerson || 'there'},\n\nI'm following up on my application for the ${app.position} role at ${app.companyName}.\n\nBest regards`)}`} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600 text-xs" title="Follow-up email">Follow-up</a>
                    </div>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )
                } />
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <InterviewRounds rounds={app.interviewRounds} onChange={() => {}} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Status Timeline</h2>
              <StatusHistory history={app.statusHistory} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Quick Info</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Resume</span>
                  {app.resumeUrl ? (
                    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 truncate max-w-[140px]">Open</a>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cover Letter</span>
                  {app.coverLetterUrl ? (
                    <a href={app.coverLetterUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 truncate max-w-[140px]">Open</a>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Offer Letter</span>
                  {app.offerLetterUrl ? (
                    <a href={app.offerLetterUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 truncate max-w-[140px]">Open</a>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><StatusBadge status={app.status} /></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Archived</span><span className="text-gray-900 dark:text-gray-100">{app.archived ? 'Yes' : 'No'}</span></div>
                {app.rejectionReason && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rejection</span>
                    <span className="text-gray-900 dark:text-gray-100 text-right max-w-[140px] truncate">
                      {REJECTION_REASONS.find(r => r.value === app.rejectionReason)?.label || app.rejectionReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <EmailTemplates open={showEmail} onClose={() => setShowEmail(false)} app={app} />
      <ConfirmDialog open={showDelete} title="Delete Application" message={`Delete application at ${app.companyName}? This cannot be undone.`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
    </div>
  )
}
