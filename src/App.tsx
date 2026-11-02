import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useSession } from './store/useHotelStore'
import { AppShell } from './components/layout/app-shell'
import { LoginPage } from './pages/login-page'
import { DashboardPage } from './pages/dashboard-page'
import { CalendarPage } from './pages/calendar-page'
import { BookingsPage } from './pages/bookings-page'
import { FrontDeskPage } from './pages/front-desk-page'
import { RoomsPage } from './pages/rooms-page'
import { RoomDetailPage } from './pages/room-detail-page'
import { HousekeepingPage } from './pages/housekeeping-page'
import { GuestsPage } from './pages/guests-page'
import { PaymentsPage } from './pages/payments-page'
import { ReportsPage } from './pages/reports-page'
import { SettingsPage } from './pages/settings-page'
import { InstallPage } from './pages/install-page'
import { NotFoundPage } from './pages/not-found-page'

function RequireAuth() {
  const session = useSession()
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/front-desk" element={<FrontDeskPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
            <Route path="/housekeeping" element={<HousekeepingPage />} />
            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/install" element={<InstallPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '16px',
            border: '1px solid #eae3d6',
            background: '#faf8f3',
            color: '#182420',
            fontSize: '12px',
            boxShadow: '0 18px 40px -24px rgba(24,36,32,0.35)',
          },
        }}
      />
    </BrowserRouter>
  )
}
