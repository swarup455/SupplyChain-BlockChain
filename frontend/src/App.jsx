import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from "react-router-dom"
import AuthPage from './pages/AuthPage'
import RoleRoute from './components/RoleRoute'
import { useSelector, useDispatch } from 'react-redux'
import { getUser } from './redux/authSlice'
import SupplierDashboard from './pages/SupplierDashboard'
import ManufacturerDashboard from './pages/ManufacturerDashboard'
import DistributorDashboard from './pages/DistributorDashboard'
import RetailerDashboard from './pages/RetailerDashboard'
import VerifyProduct from './pages/VerifyProduct'

const getRoleRoute = (role) => {
  switch (role) {
    case "supplier": return "/supplier-dashboard";
    case "manufacturer": return "/manufacturer-dashboard";
    case "distributor": return "/distributor-dashboard";
    case "retailer": return "/retailer-dashboard";
    default: return "/";
  }
};

const App = () => {
  const { user, loading } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={!user ? <AuthPage /> : <Navigate to={getRoleRoute(user.role)} />} />

      <Route path="/supplier-dashboard" element={<RoleRoute role="supplier"><SupplierDashboard /></RoleRoute>} />

      <Route path="/manufacturer-dashboard" element={<RoleRoute role="manufacturer"><ManufacturerDashboard /></RoleRoute>} />

      <Route path="/distributor-dashboard" element={<RoleRoute role="distributor"><DistributorDashboard /></RoleRoute>} />

      <Route path="/retailer-dashboard" element={<RoleRoute role="retailer"><RetailerDashboard /></RoleRoute>} />

      <Route path="/verify" element={<VerifyProduct />} />

    </Routes>

  )
}

export default App;