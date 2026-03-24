import React, { useState } from 'react'
import { useNavigate, Link } from "react-router-dom"
import { auth, db } from "../../services/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { useAuth } from "../../context/AuthContext"

const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const PURPLE  = "#7C3AED"
const PURPLE2 = "#6D28D9"
const DARK    = "#111827"
const GRAY    = "#6B7280"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  border: "1.5px solid #E5E7EB", borderRadius: 10,
  padding: "12px 14px", fontSize: 14, fontFamily: FONT,
  color: DARK, background: WHITE, outline: "none", transition: "all 0.2s",
}

const AdminLogin = () => {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPwd,  setShowPwd]  = useState(false)
  const [err,      setErr]      = useState("")
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    setErr("")
    if (!email || !password) { setErr("Enter email and password"); return }
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)

      // Fetch role from Firestore users collection
      const q    = query(collection(db, "users"), where("uid", "==", cred.user.uid))
      const snap = await getDocs(q)

      if (!snap.empty) {
        const data = snap.docs[0].data()
        if (data.role !== "admin") {
          setErr("This account does not have admin access.")
          await auth.signOut()
          return
        }
        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(data))
        login(data.role, cred.user.uid, cred.user.email)
        navigate("/admin/dashboard")
      } else {
        setErr("No account found. Contact the platform owner.")
        await auth.signOut()
      }
    } catch (e) {
      const msg = {
        "auth/user-not-found":     "No account found with this email.",
        "auth/wrong-password":     "Incorrect password.",
        "auth/invalid-email":      "Invalid email format.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/too-many-requests":  "Too many attempts. Try again later.",
      }[e.code] || "Login failed. Try again."
      setErr(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ flex: 1, background: `linear-gradient(135deg,${PURPLE} 0%,${PURPLE2} 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", color: WHITE }} className="left-panel">
        <Link to="/" style={{ fontWeight: 900, fontSize: 22, color: WHITE, textDecoration: "none", marginBottom: 48, display: "block" }}>
          Price<span style={{ color: "#C4B5FD" }}>Near</span>
        </Link>

        <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 22 }}>
          🛡️
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 14px", letterSpacing: -0.5, lineHeight: 1.2 }}>
          Admin Panel
        </h2>
        <p style={{ opacity: 0.8, fontSize: 15, margin: "0 0 32px", lineHeight: 1.8, maxWidth: 320 }}>
          Control the PriceNear platform. Verify stores, review fake price reports, and manage all products.
        </p>

        {[
          "Verify new vendor store registrations",
          "Review and dismiss fake price reports",
          "Hide suspicious stores instantly",
          "View platform-wide statistics",
        ].map(p => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, fontSize: 14, opacity: 0.9 }}>
            <div style={{ width: 22, height: 22, background: "rgba(255,255,255,0.18)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>✓</div>
            {p}
          </div>
        ))}

        <div style={{ marginTop: 40, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 16px", fontSize: 12, opacity: 0.75 }}>
          🔒 Restricted access — admin credentials only. Unauthorized access attempts are logged.
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ width: "min(100%,460px)", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <div style={{ width: "100%", maxWidth: 340 }}>

          {/* Mobile logo */}
          <div style={{ display: "none", marginBottom: 28 }} className="mob-logo">
            <Link to="/" style={{ fontWeight: 900, fontSize: 20, color: DARK, textDecoration: "none" }}>
              Price<span style={{ color: BLUE }}>Near</span>
            </Link>
          </div>

          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: DARK }}>Admin Login</div>
              <div style={{ color: GRAY, fontSize: 12 }}>Restricted access only</div>
            </div>
          </div>

          {/* Error */}
          {err && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#991B1B", fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
              ⚠️ {err}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Email */}
            <div>
              <label style={{ display: "block", color: GRAY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Email</label>
              <input
                type="email" placeholder="admin@pricenear.com"
                value={email} onChange={e => { setEmail(e.target.value); setErr("") }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = PURPLE }}
                onBlur={e  => { e.target.style.borderColor = "#E5E7EB" }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", color: GRAY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = PURPLE }}
                  onBlur={e  => { e.target.style.borderColor = "#E5E7EB" }}
                />
                <button onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: 16, padding: 0 }}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin} disabled={loading}
              style={{ background: PURPLE, color: WHITE, border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT, boxShadow: "0 4px 16px rgba(124,58,237,0.3)", opacity: loading ? 0.7 : 1, marginTop: 4 }}
            >
              {loading ? "Verifying..." : "Login as Admin 🛡️"}
            </button>

            {/* Divider links */}
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 4 }}>
              <Link to="/vendor/login" style={{ color: GRAY, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>Vendor Login</Link>
              <Link to="/"             style={{ color: GRAY, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>← Home</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder { color: #9CA3AF; }
        @media (max-width: 640px) { .left-panel { display: none !important; } .mob-logo { display: block !important; } }
      `}</style>
    </div>
  )
}

export default AdminLogin