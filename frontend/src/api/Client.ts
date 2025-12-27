import axios, { AxiosError } from 'axios'
import { t } from '../locales'

type ApiErrorPayload = {
  status: string
  message: string
  details?: string
}

type ApiErrorHandler = (payload: ApiErrorPayload) => void

let apiErrorHandler: ApiErrorHandler | null = null

export function setApiErrorHandler(handler: ApiErrorHandler | null) {
  apiErrorHandler = handler
}

export interface Todo {
  id: number
  title: string
  description?: string
  is_completed: boolean
  category?: string | { id: number; name: string }
  task_date?: string
  priority?: number
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
}

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

// 添加错误拦截器
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const message = error.message || t.errors.unknownError
    const status = error.response?.status ? `${error.response.status}` : t.errors.noStatusCode
    const details = error.response?.data
      ? JSON.stringify(error.response.data, null, 2)
      : error.message

    apiErrorHandler?.({
      status,
      message,
      details,
    })
    return Promise.reject(error)
  }
)

export const todoApi = {
  // 获取所有待办事项
  getAll: () => api.get<Todo[]>('/todos'),

  // 创建新任务
  create: (data: { title: string; description?: string; category_id?: number; task_date?: string }) =>
    api.post<Todo>('/todos', data),

  // 更新任务（包括切换完成状态）
  update: (id: number, data: { is_completed?: boolean; title?: string; description?: string; category_id?: number; task_date?: string }) =>
    api.patch<Todo>(`/todos/${id}`, data),

  // 删除任务
  delete: (id: number) =>
    api.delete(`/todos/${id}`),
}

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: { name: string }) => api.post<Category>('/categories', data),
  update: (id: number, data: { name: string }) => api.patch<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
}