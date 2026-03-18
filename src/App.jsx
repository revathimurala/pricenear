import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'

//admin
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminLogin from './pages/Admin/AdminLogin'
//customer
import Home from './pages/Customer/Home'
import Product from './pages/Customer/Product'
import Search from './pages/Customer/Search'
//vendor
import VendorDashboard from './pages/Vendor/VendorDashboard'
import VendorLogin from './pages/Vendor/VendorLogin'
//navbar
import Navbar from './components/Navbar';
import CustomerLayout from './layouts/CustomerLayout'
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Map from './pages/Customer/Map';
import Alerts from './pages/Customer/Alerts';
import SelectDashBoards from './pages/SelectDashBoards';

function App() {
  return (
    <>
      <Routes>
        <Route path="/selectDashboards" element={<SelectDashBoards />} />
        
        {/* customer-routes  */}
        <Route path="/" element={<CustomerLayout/>}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="map" element={<Map />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
        
        {/* vendors-routes  */}
        <Route path="/vendor" element={<VendorLayout/>}>
          <Route path="login" element={<VendorLogin />} />
          <Route path="dashboard" element={
              <VendorDashboard />
          }/>
        </Route>
        
        {/* Admin-routes  */}
        <Route path="/admin" element={<AdminLayout/>}>
          <Route path="login" element={<AdminLogin />}/>
          <Route path="dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </>
  )
}

export default App
