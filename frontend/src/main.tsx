import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Inbox from './pages/Inbox.tsx'
import Today from './pages/Today.tsx'
import Lists from './pages/Lists.tsx'
import Completed from './pages/Completed.tsx'
import Profile from './pages/Profile.tsx'
import { TodoModalProvider } from './contexts/TodoModalContext'

const router = createBrowserRouter([
  {
    path: '/app',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/app/inbox" replace /> },
      { path: 'inbox', element: <Inbox /> },
      { path: 'today', element: <Today /> },
      { path: 'lists', element: <Lists /> },
      { path: 'completed', element: <Completed /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  { path: '/', element: <Navigate to="/app" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TodoModalProvider>
      <RouterProvider router={router} />
    </TodoModalProvider>
  </StrictMode>,
)
