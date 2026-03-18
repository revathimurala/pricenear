import React from 'react'
import { useNavigate } from "react-router-dom";
import { auth } from '../../services/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import {useState} from "react";
import { fetchSignInMethodsForEmail } from "firebase/auth";
const VendorLogin = () => {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  const navigate=useNavigate();
  const handleLogin = async () => {
    setErr("");
    if(!email||!password){
      setErr("Enter email and password");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/vendor/dashboard");
    } catch(err){
      if(err.code === "auth/user-not-found"){
        setErr("Email not registered. Please register first.");
      }
      else if(err.code === "auth/wrong-password"){
        setErr("Incorrect password");
      }
      else if(err.code === "auth/invalid-email"){
        setErr("Invalid email format");
      }
      else{
        setErr("Login failed. Try again.");
      }

    }
  };
const handleForgotPassword = async () => {
  if(!email){
    setErr("Enter your email first");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alert("If the email exists, a reset link has been sent.");
  } catch(error){
    if(error.code === "auth/invalid-email"){
      setErr("Invalid email format");
    }
    else{
      setErr("Something went wrong");
    }
  }
};
  return (
    <>
      <div className="login-box">
        <input type="email" placeholder='Email' 
          onChange={(e)=>{setEmail(e.target.value)}}
        />
        <input type="password" placeholder='password' 
          onChange={(e)=>{setPassword(e.target.value)}}
        />
        <button onClick={handleLogin}>Login</button>
        <p 
          style={{color:"blue",cursor:"pointer"}}
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </p>
        {err&&(<p>{err}</p>)}
      </div>
    </>
  );
}

export default VendorLogin