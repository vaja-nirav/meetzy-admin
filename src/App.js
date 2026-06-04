import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import CallsPage from './pages/CallsPage'
import ReportsPage from './pages/ReportsPage'
import TransactionsPage from './pages/TransactionsPage'
import QueuePage from './pages/QueuePage'
import VipPage from './pages/VipPage'
import ConfigPage from './pages/ConfigPage'
import BlockedPage from './pages/BlockedPage'
import MosaicPage from './pages/MosaicPage'
import PeoplePage from './pages/PeoplePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute() {
  const token = localStorage.getItem('adminToken')
  if (!token) return <Navigate to="/login" replace />
  return <AdminLayout />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/calls" element={<CallsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/vip" element={<VipPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/blocked" element={<BlockedPage />} />
            <Route path="/mosaic" element={<MosaicPage />} />
            <Route path="/people" element={<PeoplePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid #2d2d4e',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  )
}
