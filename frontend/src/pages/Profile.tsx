import { useEffect, useState } from 'react'
import { t } from '../locales'
import { todoApi, categoriesApi } from '../api/Client'

export default function Profile() {
  const [todos, setTodos] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosRes, categoriesRes] = await Promise.all([
          todoApi.getAll(),
          categoriesApi.getAll(),
        ])
        setTodos(todosRes.data || [])
        setCategories(categoriesRes.data || [])
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
        setTodos([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalTasks = todos.length
  const completedTasks = todos.filter(t => t.is_completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const StatCard = ({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className="text-3xl font-bold text-red-500">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </div>
  )

  return (
    <div className="">
      <div className="page-header">
        <h2 className="page-title">{t.profile.title}</h2>
        <p className="page-subtitle">{t.profile.subtitle}</p>
      </div>
      {!loading && (
        <div className="page-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.profile.statistics}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label={t.profile.totalTasks} value={totalTasks} />
            <StatCard label={t.profile.completedTasks} value={completedTasks} subtext={`${completionRate}%`} />
            <StatCard label={t.profile.pendingTasks} value={pendingTasks} />
            <StatCard label={t.profile.categories} value={categories.length} />
          </div>
        </div>
      )}
    </div>
  )
}
