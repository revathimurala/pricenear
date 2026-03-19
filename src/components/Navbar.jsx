import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const BLUE  = "#2563EB"
const BLUE2 = "#1D4ED8"
const DARK  = "#111827"
const GRAY  = "#6B7280"
const WHITE = "#FFFFFF"
const FONT  = "'Sora','Segoe UI',sans-serif"

const Navbar = () => {
  const navigate   = useNavigate()
  const location   = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogin = () => navigate("/selectDashboards")

  const links = [
    { to: "/",       label: "Home"   },
    { to: "/search", label: "Search" },
    { to: "/map",    label: "Map"    },
    { to: "/alerts", label: "Alerts" },
  ]

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: WHITE,
        borderBottom: "1px solid #E5E7EB",
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.07)" : "none",
        transition: "box-shadow 0.2s",
        fontFamily: FONT,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* LOGO */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: BLUE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>🏪</div>
            <span style={{ fontWeight: 900, fontSize: 19, color: DARK, letterSpacing: -0.5 }}>
              Price<span style={{ color: BLUE }}>Near</span>
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="desk-links">
            {links.map(({ to, label }) => {
              const active = isActive(to)
              return (
                <Link key={to} to={to} style={{
                  textDecoration: "none", padding: "7px 16px", borderRadius: 8,
                  fontSize: 14, fontWeight: active ? 700 : 500,
                  color: active ? BLUE : GRAY,
                  background: active ? "#EFF6FF" : "transparent",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = BLUE; e.currentTarget.style.background = "#EFF6FF" } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = GRAY; e.currentTarget.style.background = "transparent" } }}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={handleLogin} style={{
              background: BLUE, color: WHITE, border: "none", borderRadius: 10,
              padding: "9px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              fontFamily: FONT, boxShadow: "0 4px 12px rgba(37,99,235,0.25)", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = BLUE2; e.currentTarget.style.transform = "translateY(-1px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = BLUE;  e.currentTarget.style.transform = "none" }}
            >
              Login
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="ham-btn" style={{
              display: "none", background: WHITE, border: "1.5px solid #E5E7EB",
              borderRadius: 8, width: 38, height: 38, cursor: "pointer",
              alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, padding: 0,
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block", width: 16, height: 2, background: DARK, borderRadius: 2, transition: "all 0.2s",
                  transform: menuOpen ? (i === 0 ? "rotate(45deg) translate(4px,4px)" : i === 2 ? "rotate(-45deg) translate(4px,-4px)" : "scaleX(0)") : "none",
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div style={{ maxHeight: menuOpen ? 280 : 0, overflow: "hidden", transition: "max-height 0.25s ease", borderTop: menuOpen ? "1px solid #F3F4F6" : "none" }}>
          <div style={{ padding: "10px 16px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {links.map(({ to, label }) => {
              const active = isActive(to)
              return (
                <Link key={to} to={to} style={{
                  textDecoration: "none", padding: "11px 14px", borderRadius: 10,
                  fontSize: 15, fontWeight: active ? 700 : 500,
                  color: active ? BLUE : DARK,
                  background: active ? "#EFF6FF" : "#F9FAFB",
                  borderLeft: active ? `3px solid ${BLUE}` : "3px solid transparent",
                }}>{label}</Link>
              )
            })}
            <button onClick={handleLogin} style={{ marginTop: 4, background: BLUE, color: WHITE, border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: FONT }}>
              Login
            </button>
          </div>
        </div>
      </nav>
      <style>{`@media(max-width:640px){.desk-links{display:none!important}.ham-btn{display:flex!important}}`}</style>
    </>
  )
}

export default Navbar