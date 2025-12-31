import { useState } from 'react'
import { TaskList } from '../components/TaskList'
import { t } from '../locales'
import { todoApi } from '../api/Client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Trash2 } from 'lucide-react'

export default function Completed() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDeleteAll = async () => {
    setIsDeleting(true)
    try {
      const res = await todoApi.getAll()
      const completedTodos = (res.data ?? []).filter(t => t.is_completed)
      
      await Promise.all(completedTodos.map(t => todoApi.delete(t.id)))
      
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      // 错误由拦截器提示
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
    }
  }

  return (
    <div className="">
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.completed.title}</h2>
            <p className="text-sm text-gray-500">{t.completed.subtitle}</p>
          </div>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isDeleting}
              className="btn btn-danger flex items-center gap-2"
            >
              <Trash2 size={16} />
              {t.completed.deleteAll}
            </button>
          )}
        </div>
      </div>
      <div className="px-8 pb-4" key={refreshKey}>
        <TaskList
          emptyTitle={t.completed.emptyTitle}
          emptySubtitle={t.completed.emptySubtitle}
          filter={{ isCompleted: true }}
          onStatsChange={(completed) => setCompletedCount(completed)}
        />
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t.completed.deleteConfirmTitle}
        description={t.completed.deleteConfirmDesc.replace('{count}', String(completedCount))}
        confirmText={t.common.confirm}
        cancelText={t.common.cancel}
        onConfirm={handleDeleteAll}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}
