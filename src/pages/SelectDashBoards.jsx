import React from 'react'
import { useNavigate } from 'react-router-dom'


const SelectDashBoards = () => {
  const navigate=useNavigate();
  function handleCustomer(){
    navigate("/search");
  }
  function handleVendor(){
    navigate("/vendor/login");
  }
  function handleAdmin(){
    navigate("/admin/login");
  }
  return (
    <div>
      <button onClick={handleCustomer}>Customer login</button>
      <br/>
      <button onClick={handleVendor}>vendor login</button>
      {/* <VendorLogin/> */}
      <br/>
      <button onClick={handleAdmin}>Admin login</button>
      {/* <AdminLogin/> */}
      
      {/* <CustomerLogin/> */}
    </div>
  )
}

export default SelectDashBoards