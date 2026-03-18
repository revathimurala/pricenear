import React from 'react'
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login("admin");
    navigate("/admin/dashboard");
  };

  return <button onClick={handleLogin}>Login as admin</button>;
}

export default AdminLogin