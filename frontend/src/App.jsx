import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from "react-router-dom"
import AuthPage from './pages/landing/AuthPage'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, selectAuthLoading, getUser } from './redux/authSlice'

// Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import ManufacturerDashboard from './pages/manufacturer/ManufacturerDashboard'
import DistributorDashboard from './pages/distributor/DistributorDashboard'
import RetailerDashboard from './pages/retailer/RetailerDashboard'
import VerifyProduct from './pages/customer/VerifyProduct'
import LandingPage from './pages/landing/LandingPage'
import ContactPage from './pages/customer/Contact'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFound from './pages/landing/NotFound'

// Layouts
import SupplierLayout from './layouts/SupplierLayout'
import ManufacturerLayout from './layouts/ManufacturerLayout'
import DistributorLayout from './layouts/DistributorLayout'
import RetailerLayout from './layouts/RetailerLayout'
import AdminLayout from './layouts/AdminLayout'

import { getRoleRoute } from './utils/getRoleRoute'
import Loader from './components/loaders/FullPageSpinner'

const App = () => {
  const user = useSelector(selectUser);
  const { profile } = useSelector(selectAuthLoading);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  if (profile) return (
    <div className='h-screen flex items-center justify-center'>
      <Loader />
    </div>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to={getRoleRoute(user.role)} replace />} />
      <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to={getRoleRoute(user.role)} replace />} />
      <Route path="/verify/:productId" element={<VerifyProduct />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<NotFound />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Supplier */}
      <Route path="/supplier" element={<SupplierLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SupplierDashboard />} />
      </Route>

      {/* Manufacturer */}
      <Route path="/manufacturer" element={<ManufacturerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ManufacturerDashboard />} />
      </Route>

      {/* Distributor */}
      <Route path="/distributor" element={<DistributorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DistributorDashboard />} />
      </Route>

      {/* Retailer */}
      <Route path="/retailer" element={<RetailerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RetailerDashboard />} />
      </Route>

    </Routes>
  );
}

export default App;