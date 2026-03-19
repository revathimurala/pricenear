import React from 'react'
import { useNavigate } from 'react-router-dom'

const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const DARK    = "#111827"
const GRAY    = "#6B7280"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

const roles = [
  {
    id:       "customer",
    icon:     "🛒",
    title:    "Customer",
    subtitle: "Find cheapest prices near you",
    desc:     "Search grocery prices at local stores, compare on a map, set price drop alerts, and view 30-day price history.",
    features: ["Search by pincode", "Compare store prices", "Price drop alerts", "Interactive map"],
    btnLabel: "Browse Prices →",
    btnBg:    BLUE,
    accent:   BLUE,
    cardBg:   WHITE,
  },
  {
    id:       "vendor",
    icon:     "🏪",
    title:    "Vendor",
    subtitle: "Manage your store prices",
    desc:     "Register your kirana store, add products, and update prices from your phone in under 10 seconds.",
    features: ["Add your store", "List products", "Update prices live", "Build trust score"],
    btnLabel: "Vendor Login →",
    btnBg:    "#0F172A",
    accent:   "#0F172A",
    cardBg:   WHITE,
  },
  {
    id:       "admin",
    icon:     "🛡️",
    title:    "Admin",
    subtitle: "Platform management",
    desc:     "Verify new vendor stores, review fake price reports, manage products, and oversee the entire platform.",
    features: ["Verify stores", "Review reports", "Manage products", "Platform stats"],
    btnLabel: "Admin Login →",
    btnBg:    "#7C3AED",
    accent:   "#7C3AED",
    cardBg:   WHITE,
  },
]

const SelectDashBoards = () => {
  const navigate = useNavigate()

  // ── original navigation logic — unchanged ──
  function handleCustomer() { navigate("/search")        }
  function handleVendor()   { navigate("/vendor/login")  }
  function handleAdmin()    { navigate("/admin/login")   }

  const handlers = { customer: handleCustomer, vendor: handleVendor, admin: handleAdmin }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: FONT, color: DARK }}>

      {/* ── HEADER ── */}
      <div style={{ background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`, padding: "52px 20px 44px", textAlign: "center", color: WHITE }}>

        {/* Logo */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏪</div>
          <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>
            Price<span style={{ color: "#BAE6FD" }}>Near</span>
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: -0.5 }}>
          Who are you?
        </h1>
        <p style={{ opacity: 0.8, fontSize: 15, margin: 0, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
          Choose your role to get to the right place. Each portal is built specifically for how you use PriceNear.
        </p>
      </div>

      {/* ── ROLE CARDS ── */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="role-grid">

          {roles.map(role => (
            <div key={role.id}
              onClick={() => handlers[role.id]()}
              style={{
                background: WHITE,
                border: "1.5px solid #E5E7EB",
                borderRadius: 20,
                padding: "28px 24px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform   = "translateY(-4px)"
                e.currentTarget.style.boxShadow   = `0 12px 40px rgba(0,0,0,0.1)`
                e.currentTarget.style.borderColor = role.accent
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform   = "none"
                e.currentTarget.style.boxShadow   = "0 1px 4px rgba(0,0,0,0.04)"
                e.currentTarget.style.borderColor = "#E5E7EB"
              }}
            >
              {/* Icon */}
              <div style={{ width: 60, height: 60, background: role.id === "customer" ? BLUE_LT : role.id === "vendor" ? "#F1F5F9" : "#F5F3FF", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 18 }}>
                {role.icon}
              </div>

              {/* Title */}
              <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4, color: DARK }}>{role.title}</div>
              <div style={{ color: role.accent, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{role.subtitle}</div>

              {/* Description */}
              <p style={{ color: GRAY, fontSize: 13, lineHeight: 1.7, margin: "0 0 20px", flex: 1 }}>
                {role.desc}
              </p>

              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                {role.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: DARK }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: role.id === "customer" ? BLUE_MD : role.id === "vendor" ? "#E2E8F0" : "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: role.accent, fontWeight: 900 }}>✓</span>
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <button
                onClick={e => { e.stopPropagation(); handlers[role.id]() }}
                style={{
                  background: role.btnBg, color: WHITE,
                  border: "none", borderRadius: 12,
                  padding: "12px 20px", fontWeight: 800,
                  fontSize: 14, cursor: "pointer",
                  fontFamily: FONT, width: "100%",
                  boxShadow: `0 4px 14px ${role.btnBg}44`,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {role.btnLabel}
              </button>
            </div>
          ))}
        </div>

        {/* ── BACK LINK ── */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: GRAY, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 6 }}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* ── FOOTER NOTE ── */}
      <div style={{ background: WHITE, borderTop: "1px solid #F3F4F6", padding: "16px 20px", textAlign: "center" }}>
        <p style={{ color: "#9CA3AF", fontSize: 12, margin: 0 }}>
          PriceNear · Final Year CSE Project · All data is real-time from Firebase
        </p>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .role-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 701px) and (max-width: 900px) {
          .role-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default SelectDashBoards