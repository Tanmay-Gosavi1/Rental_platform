import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext.jsx'

// Auth Pages
import Login from './pages/auth/Login.jsx'
import ForgetPassword from './pages/auth/ForgetPassword.jsx'

// Landing
import Landing from './pages/landing/Landing.jsx'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminVehicles from './pages/admin/Vehicles.jsx'
import AdminBookings from './pages/admin/Bookings.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminPayments from './pages/admin/Payments.jsx'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard.jsx'
import CustomerVehicles from './pages/customer/Vehicles.jsx'
import VehicleDetails from './pages/customer/VehicleDetails.jsx'
import CustomerBookings from './pages/customer/Bookings.jsx'
import Payment from './pages/customer/Payment.jsx'
import Profile from './pages/customer/Profile.jsx'

// Protected Route Components
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoutes.jsx'

const App = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Landing />} />
        
        {/* Guest Only Routes */}
        {/* <Route element={<GuestRoute />}> */}
          <Route path='/login' element={<Login />} />
          <Route path='/forget-password' element={<ForgetPassword />} />
        {/* </Route> */}

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/vehicles' element={<AdminVehicles />} />
          <Route path='/admin/bookings' element={<AdminBookings />} />
          <Route path='/admin/users' element={<AdminUsers />} />
          <Route path='/admin/payments' element={<AdminPayments />} />
        </Route>

        {/* Customer Routes (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<CustomerDashboard />} />
          <Route path='/vehicles' element={<CustomerVehicles />} />
          <Route path='/vehicles/:id' element={<VehicleDetails />} />
          <Route path='/bookings' element={<CustomerBookings />} />
          <Route path='/bookings/:bookingId/payment' element={<Payment />} />
          <Route path='/profile' element={<Profile />} />
        </Route>

        {/* Redirect unmatched routes */}
        <Route path='*' element={
          <Navigate to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} replace />
        } />
      </Routes>
    </>
  )
}

export default App