import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Star, ChevronDown, ChevronRight } from 'lucide-react'
import { STATUSES } from '../../lib/constants'
import { StatusBadge } from '../shared/StatusBadge'
import { EmptyState } from '../shared/EmptyState'
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function KanbanCard({ app }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && navigate(`/applications/${app.id}`)}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all touch-none"
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{app.companyName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{app.position}</p>
      {app.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {app.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              ['bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300','bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300','bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300','bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300','bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300','bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'][i % 6]}`}>{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {app.applicationDate?.toDate ? format(app.applicationDate.toDate(), 'MMM d') : '—'}
        </span>
        {app.companyRating ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: app.companyRating }).map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Column({ status, items, collapsed, onToggleCollapse }) {
  const { setNodeRef } = useDroppable({ id: status.value })
  const isEmpty = items.length === 0

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-72 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[calc(100vh-220px)]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button onClick={onToggleCollapse} className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <StatusBadge status={status.value} />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{items.length}</span>
        </div>
      </div>
      {!collapsed && (
        <div className="p-2 space-y-2 flex-1 overflow-y-auto min-h-[80px]">
          <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            {items.map((app) => (
              <KanbanCard key={app.id} app={app} />
            ))}
          </SortableContext>
          {isEmpty && (
            <div className="flex items-center justify-center h-20 text-xs text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              Drop here
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function KanbanBoard({ apps, onStatusChange }) {
  const [activeId, setActiveId] = useState(null)
  const [collapsed, setCollapsed] = useState({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const columns = useMemo(() => {
    const cols = {}
    for (const s of STATUSES) {
      cols[s.value] = apps.filter((a) => a.status === s.value)
    }
    return cols
  }, [apps])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const appId = active.id
    const targetStatus = over.id

    const validStatuses = STATUSES.map((s) => s.value)
    if (!validStatuses.includes(targetStatus)) return

    const app = apps.find((a) => a.id === appId)
    if (!app || app.status === targetStatus) return

    await onStatusChange(appId, targetStatus)
  }

  const allEmpty = Object.values(columns).every((col) => col.length === 0)

  if (allEmpty) {
    return <EmptyState icon="inbox" title="No applications" message="Add applications to see them on the Kanban board." actionLabel="Add Application" actionTo="/applications/new" />
  }

  const activeApp = activeId ? apps.find((a) => a.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {STATUSES.map((status) => {
          const items = columns[status.value] || []
          return (
            <Column
              key={status.value}
              status={status}
              items={items}
              collapsed={collapsed[status.value] || false}
              onToggleCollapse={() => setCollapsed((prev) => ({ ...prev, [status.value]: !prev[status.value] }))}
            />
          )
        })}
      </div>
      <DragOverlay>
        {activeApp ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-xl border border-indigo-200 dark:border-indigo-700 w-72 rotate-3 scale-105">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activeApp.companyName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{activeApp.position}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
