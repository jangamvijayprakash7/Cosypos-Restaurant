import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '../styles/index.css'
import { UserProvider } from './UserContext.jsx'
import { PerformanceDashboard } from '../utils/PerformanceMonitor.jsx'
import { LoadingSpinner } from '../components/LazyComponents.jsx'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import Forgot from './Forgot.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleProtectedRoute from './RoleProtectedRoute.jsx'
import TestRoleAccess from './TestRoleAccess.jsx'

// Lazy load heavy components
import { 
  LazyMenu, 
  LazyStaff, 
  LazyStaffAttendance, 
  LazyStaffDetail, 
  LazyInventory, 
  LazyReports, 
  LazyOrders, 
  LazyReservation, 
  LazyReservationDetails, 
  LazyProfile, 
  LazyNotifications 
} from '../components/LazyComponents.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PerformanceDashboard />
    <UserProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<Forgot />} />
        
        {/* Dashboard - All roles can access */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Menu - All roles can access */}
        <Route path="/menu" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner message="Loading Menu..." />}>
              <LazyMenu />
            </Suspense>
          </ProtectedRoute>
        } />
        
        {/* Staff Management - Only ADMIN and STAFF */}
        <Route path="/staff" element={
          <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <Suspense fallback={<LoadingSpinner message="Loading Staff..." />}>
              <LazyStaff />
            </Suspense>
          </RoleProtectedRoute>
        } />
        <Route path="/staff/attendance" element={
          <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <Suspense fallback={<LoadingSpinner message="Loading Attendance..." />}>
              <LazyStaffAttendance />
            </Suspense>
          </RoleProtectedRoute>
        } />
        <Route path="/staff/:id" element={
          <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <Suspense fallback={<LoadingSpinner message="Loading Staff Details..." />}>
              <LazyStaffDetail />
            </Suspense>
          </RoleProtectedRoute>
        } />
        
        {/* Inventory - Only ADMIN and STAFF */}
        <Route path="/inventory" element={
          <RoleProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <Suspense fallback={<LoadingSpinner message="Loading Inventory..." />}>
              <LazyInventory />
            </Suspense>
          </RoleProtectedRoute>
        } />
        
        {/* Reports - Only ADMIN */}
        <Route path="/reports" element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <Suspense fallback={<LoadingSpinner message="Loading Reports..." />}>
              <LazyReports />
            </Suspense>
          </RoleProtectedRoute>
        } />
        
        {/* Orders - All roles can access */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner message="Loading Orders..." />}>
              <LazyOrders />
            </Suspense>
          </ProtectedRoute>
        } />
        
        {/* Reservations - All roles can access */}
        <Route path="/reservation" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner message="Loading Reservations..." />}>
              <LazyReservation />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/reservation-details" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner message="Loading Reservation Details..." />}>
              <LazyReservationDetails />
            </Suspense>
          </ProtectedRoute>
        } />
        
        {/* Profile - All roles can access */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner message="Loading Profile..." />}>
              <LazyProfile />
            </Suspense>
          </ProtectedRoute>
        } />
        
        {/* Notifications - All roles can access */}
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner message="Loading Notifications..." />}>
              <LazyNotifications />
            </Suspense>
          </ProtectedRoute>
        } />
        
        {/* Test Role Access - For debugging */}
        <Route path="/test-role" element={<ProtectedRoute><TestRoleAccess /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
)
