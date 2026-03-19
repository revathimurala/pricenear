import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { auth, db } from "../../services/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const DARK    = "#111827"
const GRAY    = "#6B7280"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

const inputBase = {
  width: "100%", boxSizing: "border-box",
  border: "1.5px solid #E5E7EB", borderRadius: 10,
  padding: "12px 14px", fontSize: 14, fontFamily: FONT,
  color: DARK, background: WHITE, outline: "none", transition: "all 0.2s",
}

export default function CustomerLogin() {
  const navigate = useNavigate()

  const [mode,       setMode]       = useState("login")  // "login" | "register"
  const [name,       setName]       = useState("")
  const [email,      setEmail]      = useState("")
  const [password,   setPassword]   = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showPwd,    setShowPwd]    = useState(false)
  const [remember,   setRemember]   = useState(false)
  const [err,        setErr]        = useState("")
  const [info,       setInfo]       = useState("")
  const [loading,    setLoading]    = useState(false)

  const clear = () => { setErr(""); setInfo("") }

  const friendly = (code) => ({
    "auth/user-not-found":       "No account found with this email.",
    "auth/wrong-password":       "Incorrect password.",
    "auth/invalid-email":        "Invalid email format.",
    "auth/email-already-in-use": "Email already registered. Please login.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/invalid-credential":   "Invalid email or password.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests":    "Too many attempts. Try again later.",
  }[code] || "Something went wrong.")

  const applyPersistence = () =>
    setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)

  // ── LOGIN ──
  const handleLogin = async () => {
    clear()
    if (!email || !password) { setErr("Enter email and password"); return }
    setLoading(true)
    try {
      await applyPersistence()
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/alerts")
    } catch (e) { setErr(friendly(e.code)) }
    finally     { setLoading(false) }
  }

  // ── REGISTER ──
  const handleRegister = async () => {
    clear()
    if (!name || !email || !password || !confirmPwd) { setErr("Fill all fields"); return }
    if (password !== confirmPwd) { setErr("Passwords do not match"); return }
    if (password.length < 6)    { setErr("Password must be at least 6 characters"); return }
    setLoading(true)
    try {
      await applyPersistence()
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // Save to Firestore users collection with role: customer
      await setDoc(doc(db, "users", cred.user.uid), {
        uid:       cred.user.uid,
        email:     cred.user.email,
        name:      name,
        role:      "customer",
        createdAt: new Date().toISOString(),
      })
      navigate("/alerts")
    } catch (e) { setErr(friendly(e.code)) }
    finally     { setLoading(false) }
  }

  // ── FORGOT PASSWORD ──
  const handleForgot = async () => {
    clear()
    if (!email) { setErr("Enter your email first, then click Forgot Password"); return }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setInfo(`Reset link sent to ${email}. Check your inbox.`)
    } catch (e) { setErr(friendly(e.code)) }
    finally     { setLoading(false) }
  }

  // ── GOOGLE ──
  const handleGoogle = async () => {
    clear(); setLoading(true)
    try {
      await applyPersistence()
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      const ref    = doc(db, "users", result.user.uid)
      const snap   = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          uid:       result.user.uid,
          email:     result.user.email,
          name:      result.user.displayName || "",
          role:      "customer",
          createdAt: new Date().toISOString(),
        })
      }
      navigate("/alerts")
    } catch (e) { setErr(friendly(e.code)) }
    finally     { setLoading(false) }
  }

  const isLogin = mode === "login"

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 48px", color: WHITE,
      }} className="left-panel">
        <Link to="/" style={{ fontWeight: 900, fontSize: 22, color: WHITE, textDecoration: "none", marginBottom: 48, display: "block" }}>
          Price<span style={{ color: "#BAE6FD" }}>Near</span>
        </Link>

        <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 22 }}>
          🛒
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 14px", letterSpacing: -0.5, lineHeight: 1.2 }}>
          Customer Portal
        </h2>
        <p style={{ opacity: 0.8, fontSize: 15, margin: "0 0 32px", lineHeight: 1.8, maxWidth: 300 }}>
          Login to set price drop alerts and get notified the moment any store near you drops below your target price.
        </p>

        {[
          "Search prices by pincode",
          "Set price drop alerts",
          "Get real-time notifications",
          "View 30-day price history",
        ].map(p => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, fontSize: 14, opacity: 0.9 }}>
            <div style={{ width: 22, height: 22, background: "rgba(255,255,255,0.18)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>✓</div>
            {p}
          </div>
        ))}
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

          {/* Mode toggle */}
          <div style={{ display: "flex", background: "#E5E7EB", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); clear() }} style={{
                flex: 1, padding: "9px", borderRadius: 9, border: "none",
                cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: FONT,
                background: mode === m ? WHITE : "transparent",
                color:      mode === m ? BLUE  : GRAY,
                boxShadow:  mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s", textTransform: "capitalize",
              }}>
                {m === "login" ? "🔑 Login" : "✨ Register"}
              </button>
            ))}
          </div>

          {/* Banners */}
          {err  && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#991B1B", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>⚠️ {err}</div>}
          {info && <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", color: "#166534", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>✅ {info}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Name — register only */}
            {!isLogin && (
              <div>
                <label style={{ display: "block", color: GRAY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Your Name</label>
                <input placeholder="e.g. Ravi Kumar" value={name} onChange={e => setName(e.target.value)}
                  style={inputBase}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: "block", color: GRAY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); clear() }}
                onKeyDown={e => e.key === "Enter" && isLogin && handleLogin()}
                style={inputBase}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", color: GRAY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder={isLogin ? "••••••••" : "Minimum 6 characters"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && isLogin && handleLogin()}
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                />
                <button onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: 16, padding: 0 }}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm password — register only */}
            {!isLogin && (
              <div>
                <label style={{ display: "block", color: GRAY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Confirm Password</label>
                <input type="password" placeholder="Re-enter password" value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  style={inputBase}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                />
                {confirmPwd && (
                  <div style={{ marginTop: 5, fontSize: 11, fontWeight: 600, color: password === confirmPwd ? "#16A34A" : "#DC2626" }}>
                    {password === confirmPwd ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </div>
                )}
              </div>
            )}

            {/* Remember me + forgot password — login only */}
            {isLogin && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div onClick={() => setRemember(!remember)} style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${remember ? BLUE : "#D1D5DB"}`, background: remember ? BLUE : WHITE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}>
                    {remember && <span style={{ color: WHITE, fontSize: 10, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ color: GRAY, fontSize: 13 }}>Remember me</span>
                </label>
                <button onClick={handleForgot} style={{ background: "none", border: "none", color: BLUE, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: FONT }}>
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Main CTA */}
            <button onClick={isLogin ? handleLogin : handleRegister} disabled={loading}
              style={{ background: BLUE, color: WHITE, border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT, boxShadow: "0 4px 16px rgba(37,99,235,0.3)", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? "Please wait..." : isLogin ? "Login →" : "Create Account →"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ color: GRAY, fontSize: 12, fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            </div>

            {/* Google */}
            <button onClick={handleGoogle} disabled={loading}
              style={{ background: WHITE, color: DARK, border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", opacity: loading ? 0.7 : 1 }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.7 39.9 16.4 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41.3 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </button>

          </div>

          {/* Switch mode */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: GRAY }}>
            {isLogin
              ? <>Don't have an account?{" "}<button onClick={() => { setMode("register"); clear() }} style={{ background: "none", border: "none", color: BLUE, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: FONT }}>Register here</button></>
              : <>Already registered?{" "}<button onClick={() => { setMode("login"); clear() }} style={{ background: "none", border: "none", color: BLUE, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: FONT }}>Login here</button></>
            }
          </div>

          {/* Links to other portals */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
            <Link to="/vendor/login" style={{ color: GRAY, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>Vendor Portal</Link>
            <Link to="/"             style={{ color: GRAY, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>← Home</Link>
          </div>

        </div>
      </div>

      <style>{`
        input::placeholder { color: #9CA3AF; }
        @media (max-width: 640px) {
          .left-panel { display: none !important; }
          .mob-logo   { display: block !important; }
        }
      `}</style>
    </div>
  )
}