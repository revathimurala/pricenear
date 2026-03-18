import React from 'react'
// Navbar
import Navbar from "../components/Navbar";
import { Outlet } from 'react-router-dom';


const CustomerLayout = () => {
  return (
    <div>
        <Navbar/>
        <Outlet/>
    </div>
  )
}

export default CustomerLayout