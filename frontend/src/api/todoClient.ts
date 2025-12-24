import axios, { AxiosError } from 'axios'
import { showErrorNotification } from '../components/ErrorNotificationCenter'

export interface Todo {
  id: number
  title: string
  description?: string
  is_completed: boolean
  category?: string
  priority?: number
  created_at?: string
  updated_at?: string
}

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

// 添加错误拦截器
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const message = error.message || '未知错误'
    const status = error.response?.status ? `${error.response.status}` : '无状态码'
    const details = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : error.message

    showErrorNotification(
      `后端错误: ${status} ${message}`,
      details
    )
    return Promise.reject(error)
  }
)

export const todoApi = {
  // 获取所有待办事项
  getAll: () => api.get<Todo[]>('/todos'),

  // 创建新任务
  create: (data: { title: string; description?: string }) =>
    api.post<Todo>('/todos', data),

  // 更新任务（包括切换完成状态）
  update: (id: number, data: { is_completed?: boolean; title?: string; description?: string }) =>
    api.patch<Todo>(`/todos/${id}`, data),

  // 删除任务
  delete: (id: number) =>
    api.delete(`/todos/${id}`),
}