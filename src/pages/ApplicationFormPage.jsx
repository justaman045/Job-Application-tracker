import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Loader, Plus, X, GripVertical } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useApplications } from '../hooks/useApplications'
import { useToast } from '../contexts/ToastContext'
import { STATUSES, SOURCES, LOCATION_TYPES, REJECTION_REASONS } from '../lib/constants'
import { InterviewRounds } from '../components/applications/InterviewRounds'
import { FormSkeleton } from '../components/shared/Loading'
import { ErrorDisplay } from '../components/shared/ErrorDisplay'
import { Field } from '../components/shared/Field'
import { StarSelector } from '../components/shared/Rating'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'

function SortableFieldItem({ field, index, fields, onChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(field.id ?? index) })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button type="button" {...attributes} {...listeners} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing transition-colors" aria-label="Drag to reorder">
        <GripVertical className="w-4 h-4" />
      </button>
      <input type="text" value={field.key} onChange={(e) => { const c = [...fields]; c[index] = { ...c[index], key: e.target.value }; onChange('customFields', c) }}
        className="w-2/5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Key (e.g. Tech Stack)" />
      <input type="text" value={field.value} onChange={(e) => { const c = [...fields]; c[index] = { ...c[index], value: e.target.value }; onChange('customFields', c) }}
        className="flex-1 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Value (e.g. React, Go)" />
      <button type="button" onClick={() => onChange('customFields', fields.filter((_, j) => j !== index))}
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ApplicationFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { apps, getApplication, addApplication, updateApplication } = useApplications()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)

  const [form, setForm] = useState({
    companyName: '',
    position: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'applied',
    jobPostingUrl: '',
    jobDescription: '',
    notes: '',
    resumeVersion: '',
    coverLetter: '',
    contactPerson: '',
    contactEmail: '',
    salaryInfo: '',
    tags: '',
    applicationSource: '',
    locationType: '',
    companyWebsite: '',
    companyRating: 0,
    followUpDate: '',
    rejectionReason: '',
    interviewRounds: [],
    customFields: [],
    prospect: false,
    prospectNotes: '',
    resumeUrl: '',
    coverLetterUrl: '',
    offerLetterUrl: '',
    companyNotes: '',
  })

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      try {
        const app = await getApplication(id)
        if (!app) { setError('Application not found'); return }
        setForm({
          companyName: app.companyName || '',
          position: app.position || '',
          applicationDate: app.applicationDate?.toDate ? app.applicationDate.toDate().toISOString().split('T')[0] : '',
          status: app.status || 'applied',
          jobPostingUrl: app.jobPostingUrl || '',
          jobDescription: app.jobDescription || '',
          notes: app.notes || '',
          resumeVersion: app.resumeVersion || '',
          coverLetter: app.coverLetter || '',
          contactPerson: app.contactPerson || '',
          contactEmail: app.contactEmail || '',
          salaryInfo: app.salaryInfo || '',
          tags: (app.tags || []).join(', '),
          applicationSource: app.applicationSource || '',
          locationType: app.locationType || '',
          companyWebsite: app.companyWebsite || '',
          companyRating: app.companyRating || 0,
          followUpDate: app.followUpDate?.toDate ? app.followUpDate.toDate().toISOString().split('T')[0] : '',
          rejectionReason: app.rejectionReason || '',
          interviewRounds: app.interviewRounds || [],
          customFields: app.customFields || [],
          prospect: app.prospect || false,
          prospectNotes: app.prospectNotes || '',
          resumeUrl: app.resumeUrl || '',
          coverLetterUrl: app.coverLetterUrl || '',
          offerLetterUrl: app.offerLetterUrl || '',
          companyNotes: app.companyNotes || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit, getApplication])

  const validate = () => {
    const errs = {}
    if (!form.companyName.trim()) errs.companyName = 'Company name is required'
    if (!form.position.trim()) errs.position = 'Position is required'
    if (!form.applicationDate) errs.applicationDate = 'Date is required'
    if (!form.status) errs.status = 'Status is required'
    if (form.companyRating && (form.companyRating < 1 || form.companyRating > 5)) errs.companyRating = 'Rating must be 1-5'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = form.customFields.findIndex((f, i) => String(f.id ?? i) === active.id)
    const newIndex = form.customFields.findIndex((f, i) => String(f.id ?? i) === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    handleChange('customFields', arrayMove(form.customFields, oldIndex, newIndex))
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const handleSubmit = async (e, skipDuplicateCheck) => {
    e.preventDefault()
    if (!validate()) return

    if (!isEdit && !skipDuplicateCheck) {
      const match = apps.find(
        (a) =>
          a.companyName?.toLowerCase() === form.companyName?.toLowerCase() &&
          a.position?.toLowerCase() === form.position?.toLowerCase()
      )
      if (match) {
        setShowDuplicateWarning(true)
        return
      }
    }

    setSaving(true)
    try {
      const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      const payload = {
        ...form,
        tags,
        companyRating: form.companyRating || null,
        followUpDate: form.followUpDate || null,
      }
      if (isEdit) {
        await updateApplication(id, payload)
        addToast('Application updated', 'success')
        navigate(`/applications/${id}`)
      } else {
        const newId = await addApplication(payload)
        addToast('Application added', 'success')
        navigate(`/applications/${newId}`)
      }
    } catch (err) {
      addToast(err.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <FormSkeleton />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(isEdit ? `/applications/${id}` : '/applications')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{isEdit ? 'Edit Application' : 'New Application'}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Basics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name" required error={errors.companyName}>
              <input type="text" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Google" />
            </Field>
            <Field label="Position" required error={errors.position}>
              <input type="text" value={form.position} onChange={(e) => handleChange('position', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Software Engineer" />
            </Field>
            <Field label="Application Date" required error={errors.applicationDate}>
              <input type="date" value={form.applicationDate} onChange={(e) => handleChange('applicationDate', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </Field>
            <Field label="Status" required error={errors.status}>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Job Posting URL">
              <input type="url" value={form.jobPostingUrl} onChange={(e) => handleChange('jobPostingUrl', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://..." />
            </Field>
            <Field label="Company Website">
              <input type="url" value={form.companyWebsite} onChange={(e) => handleChange('companyWebsite', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://..." />
            </Field>
            <Field label="Job Description">
              <textarea value={form.jobDescription} onChange={(e) => handleChange('jobDescription', e.target.value)} rows={6}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono"
                placeholder="Paste the full job description here..." />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.prospect} onChange={(e) => handleChange('prospect', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-500 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Save as prospect / wishlist</span>
            </label>
          </div>
          {form.prospect && (
            <div className="mt-3">
              <Field label="Prospect Notes">
                <textarea value={form.prospectNotes} onChange={(e) => handleChange('prospectNotes', e.target.value)} rows={2}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Why are you interested in this company?" />
              </Field>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Resume Version">
              <input type="text" value={form.resumeVersion} onChange={(e) => handleChange('resumeVersion', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. resume_v3.pdf" />
            </Field>
            <Field label="Application Source">
              <select value={form.applicationSource} onChange={(e) => handleChange('applicationSource', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Select source...</option>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Location Type">
              <select value={form.locationType} onChange={(e) => handleChange('locationType', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Select type...</option>
                {LOCATION_TYPES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </Field>
            <Field label="Company Rating">
              <StarSelector value={form.companyRating} onChange={(v) => handleChange('companyRating', v)} />
            </Field>
            <Field label="Tags (comma separated)">
              <input type="text" value={form.tags} onChange={(e) => handleChange('tags', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. referral, backend, fintech" />
            </Field>
            <Field label="Salary Info">
              <input type="text" value={form.salaryInfo} onChange={(e) => handleChange('salaryInfo', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. $150k-$180k + equity" />
            </Field>
            <Field label="Cover Letter">
              <textarea value={form.coverLetter} onChange={(e) => handleChange('coverLetter', e.target.value)} rows={3}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Cover letter summary or link..." />
            </Field>
            <Field label="Follow-up Date">
              <input type="date" value={form.followUpDate} onChange={(e) => handleChange('followUpDate', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </Field>
            <Field label="Rejection Reason">
              <div className="flex gap-2">
                <select value={REJECTION_REASONS.some(r => r.value === form.rejectionReason) ? form.rejectionReason : form.rejectionReason ? 'other' : ''} onChange={(e) => handleChange('rejectionReason', e.target.value)}
                  className="flex-1 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Select reason...</option>
                  {REJECTION_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="Contact Person">
              <input type="text" value={form.contactPerson} onChange={(e) => handleChange('contactPerson', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Jane Recruiter" />
            </Field>
            <Field label="Contact Email">
              <input type="email" value={form.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="jane@company.com" />
            </Field>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Custom Fields</h2>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={form.customFields.map((f, i) => String(f.id ?? i))} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {form.customFields.map((field, i) => (
                  <SortableFieldItem key={String(field.id ?? i)} field={field} index={i} fields={form.customFields} onChange={handleChange} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button type="button" onClick={() => handleChange('customFields', [...form.customFields, { key: '', value: '' }])}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Files</h2>
          <div className="space-y-3">
            <Field label="Resume URL">
              <input type="url" value={form.resumeUrl} onChange={(e) => handleChange('resumeUrl', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://drive.google.com/..." />
            </Field>
            <Field label="Cover Letter URL">
              <input type="url" value={form.coverLetterUrl} onChange={(e) => handleChange('coverLetterUrl', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://drive.google.com/..." />
            </Field>
            <Field label="Offer Letter URL">
              <input type="url" value={form.offerLetterUrl} onChange={(e) => handleChange('offerLetterUrl', e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://drive.google.com/..." />
            </Field>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company Research</h2>
          <Field label="Company Notes (products, culture, competitors, connections)">
            <textarea value={form.companyNotes} onChange={(e) => handleChange('companyNotes', e.target.value)} rows={5}
              className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono"
              placeholder="Research notes about the company&#10;• Products &amp; services&#10;• Culture &amp; values&#10;• Key competitors&#10;• Your connections" />
          </Field>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Interview Tracking</h2>
          <InterviewRounds rounds={form.interviewRounds} onChange={(rounds) => handleChange('interviewRounds', rounds)} />
        </section>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md disabled:opacity-50">
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {isEdit ? 'Update' : 'Save'}</>}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showDuplicateWarning}
        title="Duplicate Application?"
        message={`You already have an application at "${form.companyName}" for "${form.position}". Do you want to add it anyway?`}
        confirmLabel="Add Anyway"
        onConfirm={() => { setShowDuplicateWarning(false); handleSubmit(true) }}
        onCancel={() => setShowDuplicateWarning(false)}
      />
    </div>
  )
}
