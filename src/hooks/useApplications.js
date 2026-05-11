/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import {
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, writeBatch, Timestamp, arrayUnion, arrayRemove
} from 'firebase/firestore'

function toApp(doc) {
  const data = doc.data()
  return { id: doc.id, ...data }
}

function toDate(val) {
  if (!val) return null
  if (val.toDate) return val.toDate()
  return new Date(val)
}

export function useApplications() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setApps([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', user.uid),
      orderBy('applicationDate', 'desc')
    )
    const unsub = onSnapshot(q,
      (snapshot) => {
        const list = snapshot.docs.map(toApp)
        setApps(list)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [user])

  const getApplication = useCallback(async (id) => {
    const snap = await getDoc(doc(db, 'applications', id))
    if (!snap.exists()) return null
    return toApp(snap)
  }, [])

  const addApplication = useCallback(async (data) => {
    if (!user) throw new Error('Not authenticated')
    const now = Timestamp.now()
    const payload = {
      userId: user.uid,
      companyName: data.companyName.trim(),
      position: data.position.trim(),
      applicationDate: data.applicationDate ? Timestamp.fromDate(new Date(data.applicationDate)) : now,
      status: data.status || 'applied',
      jobPostingUrl: data.jobPostingUrl?.trim() || '',
      jobDescription: data.jobDescription?.trim() || '',
      notes: data.notes?.trim() || '',
      resumeVersion: data.resumeVersion?.trim() || '',
      coverLetter: data.coverLetter?.trim() || '',
      contactPerson: data.contactPerson?.trim() || '',
      contactEmail: data.contactEmail?.trim() || '',
      salaryInfo: data.salaryInfo?.trim() || '',
      tags: data.tags || [],
      applicationSource: data.applicationSource || '',
      locationType: data.locationType || '',
      companyWebsite: data.companyWebsite?.trim() || '',
      companyRating: data.companyRating || null,
      followUpDate: data.followUpDate ? Timestamp.fromDate(new Date(data.followUpDate)) : null,
      rejectionReason: data.rejectionReason?.trim() || '',
      offerSalary: data.offerSalary || null,
      offerEquity: data.offerEquity?.trim() || '',
      offerBonus: data.offerBonus?.trim() || '',
      offerBenefits: data.offerBenefits?.trim() || '',
      interviewRounds: data.interviewRounds || [],
      customFields: data.customFields || [],
      resumeUrl: data.resumeUrl?.trim() || '',
      coverLetterUrl: data.coverLetterUrl?.trim() || '',
      offerLetterUrl: data.offerLetterUrl?.trim() || '',
      statusHistory: [{ status: data.status || 'applied', changedAt: now }],
      archived: false,
      prospect: data.prospect || false,
      prospectNotes: data.prospectNotes?.trim() || '',
      companyNotes: data.companyNotes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    }
    const ref = await addDoc(collection(db, 'applications'), payload)
    return ref.id
  }, [user])

  const updateApplication = useCallback(async (id, data) => {
    const ref = doc(db, 'applications', id)
    const existing = await getDoc(ref)
    if (!existing.exists()) throw new Error('Application not found')

    const oldStatus = existing.data().status
    const newStatus = data.status || oldStatus

    const updatePayload = { ...data, updatedAt: Timestamp.now() }
    delete updatePayload.statusHistory
    delete updatePayload.interviewRounds
    delete updatePayload.id
    delete updatePayload.userId
    delete updatePayload.createdAt
    delete updatePayload.resumeFile
    delete updatePayload.coverLetterFile
    delete updatePayload.offerLetterFile

    if (data.interviewRounds !== undefined) {
      updatePayload.interviewRounds = data.interviewRounds
    }

    if (newStatus !== oldStatus) {
      const history = existing.data().statusHistory || []
      updatePayload.statusHistory = [...history, { status: newStatus, changedAt: Timestamp.now() }]
      updatePayload.status = newStatus
    }

    if (data.applicationDate && typeof data.applicationDate === 'string') {
      updatePayload.applicationDate = Timestamp.fromDate(new Date(data.applicationDate))
    }
    if (data.followUpDate && typeof data.followUpDate === 'string') {
      updatePayload.followUpDate = Timestamp.fromDate(new Date(data.followUpDate))
    }

    await updateDoc(ref, updatePayload)
  }, [])

  const deleteApplication = useCallback(async (id) => {
    await deleteDoc(doc(db, 'applications', id))
  }, [])

  const duplicateApplication = useCallback(async (id) => {
    const existing = await getApplication(id)
    if (!existing) throw new Error('Application not found')
    const { id: _existingId, userId: _uid, createdAt: _ca, updatedAt: _ua, statusHistory: _sh, ...dupData } = existing
    await addApplication({
      ...dupData,
      companyName: `${dupData.companyName} (copy)`,
      status: 'applied',
      applicationDate: new Date().toISOString().split('T')[0],
      interviewRounds: [],
    })
  }, [getApplication, addApplication])

  const archiveApplication = useCallback(async (id, archived = true) => {
    await updateDoc(doc(db, 'applications', id), { archived, updatedAt: Timestamp.now() })
  }, [])

  const bulkUpdateStatus = useCallback(async (ids, newStatus) => {
    const now = Timestamp.now()
    const batch = writeBatch(db)
    for (const id of ids) {
      const ref = doc(db, 'applications', id)
      batch.update(ref, { status: newStatus, updatedAt: now })
    }
    await batch.commit()
  }, [])

  const bulkArchive = useCallback(async (ids) => {
    const now = Timestamp.now()
    const batch = writeBatch(db)
    for (const id of ids) {
      batch.update(doc(db, 'applications', id), { archived: true, updatedAt: now })
    }
    await batch.commit()
  }, [])

  const bulkDelete = useCallback(async (ids) => {
    const batch = writeBatch(db)
    for (const id of ids) {
      batch.delete(doc(db, 'applications', id))
    }
    await batch.commit()
  }, [])

  const unarchiveApplication = useCallback(async (id) => {
    await archiveApplication(id, false)
  }, [archiveApplication])

  const bulkAddTag = useCallback(async (ids, tag) => {
    if (!tag.trim()) return
    const batch = writeBatch(db)
    for (const id of ids) {
      const ref = doc(db, 'applications', id)
      batch.update(ref, {
        tags: arrayUnion(tag.trim()),
        updatedAt: Timestamp.now(),
      })
    }
    await batch.commit()
  }, [])

  const bulkRemoveTag = useCallback(async (ids, tag) => {
    if (!tag.trim()) return
    const batch = writeBatch(db)
    for (const id of ids) {
      const ref = doc(db, 'applications', id)
      batch.update(ref, {
        tags: arrayRemove(tag.trim()),
        updatedAt: Timestamp.now(),
      })
    }
    await batch.commit()
  }, [])

  const getStats = useCallback(() => {
    const total = apps.length
    const active = apps.filter((a) => ['applied', 'screening', 'interview'].includes(a.status)).length
    const interviews = apps.filter((a) => a.status === 'interview' || a.interviewRounds?.length > 0).length
    const offers = apps.filter((a) => a.status === 'offer' || a.status === 'accepted').length
    const rejected = apps.filter((a) => a.status === 'rejected').length
    const responded = apps.filter((a) => a.status !== 'applied' && a.status !== 'ghosted')
    const responseRate = total > 0 ? Math.round((responded.length / total) * 100) : 0
    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0
    const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0

    let totalResponseDays = 0
    let responseCount = 0
    for (const app of apps) {
      if (!app.statusHistory || app.statusHistory.length < 2) continue
      const appliedEntry = app.statusHistory.find((h) => h.status === 'applied')
      const firstResponse = app.statusHistory.find((h) => h.status !== 'applied')
      if (appliedEntry && firstResponse && firstResponse.changedAt && appliedEntry.changedAt) {
        const diff = (toDate(firstResponse.changedAt) - toDate(appliedEntry.changedAt)) / (1000 * 60 * 60 * 24)
        if (diff > 0) {
          totalResponseDays += diff
          responseCount++
        }
      }
    }
    const avgResponseDays = responseCount > 0 ? Math.round((totalResponseDays / responseCount) * 10) / 10 : null

    const statusCounts = {}
    for (const app of apps) {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1
    }

    const sourceEffectiveness = {}
    for (const app of apps) {
      const src = app.applicationSource || 'unknown'
      if (!sourceEffectiveness[src]) sourceEffectiveness[src] = { total: 0, interviews: 0, offers: 0 }
      sourceEffectiveness[src].total++
      if (app.status === 'interview' || app.status === 'offer' || app.status === 'accepted') {
        sourceEffectiveness[src].interviews++
      }
      if (app.status === 'offer' || app.status === 'accepted') {
        sourceEffectiveness[src].offers++
      }
    }

    const weeklyData = getWeeklyData(apps)
    const pipelineVelocity = computePipelineVelocity(apps)
    const activityFeed = buildActivityFeed(apps)
    const offersForComparison = apps.filter((a) => a.status === 'offer' || a.status === 'accepted')

    const rejectionReasons = {}
    for (const app of apps) {
      if (app.status !== 'rejected' || !app.rejectionReason) continue
      const reason = app.rejectionReason.trim()
      if (!reason) continue
      rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1
    }

    return {
      total,
      active,
      interviews,
      offers,
      rejected,
      responseRate,
      interviewRate,
      offerRate,
      avgResponseDays,
      statusCounts,
      sourceEffectiveness,
      weeklyData,
      pipelineVelocity,
      activityFeed,
      offersForComparison,
      rejectionReasons,
    }
  }, [apps])

  return {
    apps,
    loading,
    error,
    getApplication,
    addApplication,
    updateApplication,
    deleteApplication,
    duplicateApplication,
    archiveApplication,
    unarchiveApplication,
    bulkUpdateStatus,
    bulkArchive,
    bulkDelete,
    bulkAddTag,
    bulkRemoveTag,
    getStats,
  }
}

function getWeeklyData(apps) {
  if (!apps.length) return []
  const weeks = {}
  for (const app of apps) {
    const date = toDate(app.applicationDate)
    if (!date) continue
    const weekStart = new Date(date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const key = weekStart.toISOString().split('T')[0]
    if (!weeks[key]) {
      weeks[key] = { week: key, count: 0, interviews: 0, offers: 0 }
    }
    weeks[key].count++
    if (app.status === 'interview') weeks[key].interviews++
    if (app.status === 'offer' || app.status === 'accepted') weeks[key].offers++
  }
  return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week))
}

function computePipelineVelocity(apps) {
  const stageDurations = { applied: [], screening: [], interview: [] }
  for (const app of apps) {
    const history = app.statusHistory || []
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1]
      const curr = history[i]
      if (prev.changedAt && curr.changedAt && stageDurations[prev.status]) {
        const days = (toDate(curr.changedAt) - toDate(prev.changedAt)) / (1000 * 60 * 60 * 24)
        if (days > 0 && days < 365) stageDurations[prev.status].push(days)
      }
    }
  }
  return Object.entries(stageDurations).map(([stage, days]) => ({
    stage,
    avgDays: days.length > 0 ? Math.round((days.reduce((a, b) => a + b, 0) / days.length) * 10) / 10 : 0,
    count: days.length,
  }))
}

function buildActivityFeed(apps) {
  const events = []
  for (const app of apps) {
    const history = app.statusHistory || []
    for (const entry of history) {
      const date = toDate(entry.changedAt)
      if (date) {
        events.push({
          date,
          type: 'status_change',
          status: entry.status,
          companyName: app.companyName,
          position: app.position,
          appId: app.id,
        })
      }
    }
  }
  events.sort((a, b) => b.date - a.date)
  return events.slice(0, 50)
}
