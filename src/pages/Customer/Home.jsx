import React from 'react'
import { Link } from 'react-router-dom'

const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const GRAY    = "#6B7280"
const DARK    = "#111827"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

const features = [
  { icon: "📍", title: "Pincode Search",    desc: "Search stores within your exact area. Only prices that matter to you." },
  { icon: "💰", title: "Live Prices",        desc: "Vendor-updated prices in real time. No stale data, ever." },
  { icon: "🗺️", title: "Interactive Map",   desc: "See every store on a map. Blue = nearest, based on your GPS." },
  { icon: "🔔", title: "Price Alerts",       desc: "Set a target price. Get notified when any store hits it." },
  { icon: "📊", title: "Price History",      desc: "30-day trend chart to know if prices are rising or falling." },
  { icon: "🏪", title: "Vendor Portal",      desc: "Own a kirana? Update your prices from your phone in seconds." },
]

const steps = [
  { n: "01", title: "Enter your pincode",  desc: "We find all registered stores in your exact area." },
  { n: "02", title: "Search any product",  desc: "Type tomato, rice, oil — get prices from every nearby store." },
  { n: "03", title: "Pick the cheapest",   desc: "Walk in, buy smart. Money stays in your neighbourhood." },
]

const stats = [
  { v: "48+",  l: "Local Stores" },
  { v: "320+", l: "Products Listed" },
  { v: "₹35",  l: "Avg Daily Savings" },
  { v: "Live", l: "Price Updates" },
]

export default function Home() {
  return (
    <div style={{ fontFamily: FONT, background: WHITE, color: DARK, overflowX: "hidden" }}>

      {/* ══════════ HERO ══════════ */}
      <section style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`, color: WHITE, padding: "80px 20px 100px", position: "relative", overflow: "hidden" }}>

        {/* decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 24 }}>
            Hyperlocal Price Transparency
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: -1 }}>
            Know Prices Before<br />
            <span style={{ position: "relative", display: "inline-block" }}>
              You Leave Home
              <span style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2 }} />
            </span>
          </h1>

          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.82)", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Compare real-time grocery prices at local kirana stores near you.
            Stop overpaying. Support your neighbourhood.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/search" style={{
              background: WHITE, color: BLUE, fontWeight: 800, fontSize: 15,
              padding: "14px 32px", borderRadius: 12, textDecoration: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "transform 0.15s",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              🔍 Search Prices
            </Link>
            <Link to="/map" style={{
              background: "rgba(255,255,255,0.12)", color: WHITE,
              border: "2px solid rgba(255,255,255,0.35)",
              fontWeight: 700, fontSize: 15,
              padding: "14px 32px", borderRadius: 12, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              🗺️ View Map
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ STATS BAND ══════════ */}
      <section style={{ background: DARK, padding: "36px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, textAlign: "center" }} className="stats-grid">
          {stats.map(({ v, l }) => (
            <div key={l} style={{ padding: "20px 10px" }}>
              <div style={{ color: WHITE, fontWeight: 900, fontSize: 30, letterSpacing: -1 }}>{v}</div>
              <div style={{ color: "#9CA3AF", fontSize: 13, fontWeight: 600, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section style={{ padding: "80px 20px", background: BLUE_LT }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ color: BLUE, fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>How it works</span>
            <h2 style={{ fontSize: 36, fontWeight: 900, margin: "10px 0 0", letterSpacing: -0.5 }}>Three Steps to Smarter Shopping</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="steps-grid">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} style={{ background: WHITE, borderRadius: 20, padding: "36px 28px", boxShadow: "0 4px 24px rgba(37,99,235,0.08)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: 16, fontSize: 72, fontWeight: 900, color: BLUE_MD, lineHeight: 1, userSelect: "none" }}>{n}</div>
                <div style={{ width: 44, height: 44, background: BLUE, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 900, fontSize: 16, marginBottom: 20 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, margin: "0 0 10px" }}>{title}</h3>
                <p style={{ color: GRAY, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{ padding: "80px 20px", background: WHITE }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ color: BLUE, fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>Features</span>
            <h2 style={{ fontSize: 36, fontWeight: 900, margin: "10px 0 0", letterSpacing: -0.5 }}>Everything You Need</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="feat-grid">
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{
                border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "28px 24px",
                transition: "all 0.2s", cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.12)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none" }}
              >
                <div style={{ width: 48, height: 48, background: BLUE_MD, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, margin: "0 0 8px" }}>{title}</h3>
                <p style={{ color: GRAY, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SPLIT — VENDOR CTA ══════════ */}
      <section style={{ background: BLUE_LT, padding: "80px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="split-grid">
          <div>
            <span style={{ color: BLUE, fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>For Vendors</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, margin: "12px 0 16px", letterSpacing: -0.5, lineHeight: 1.2 }}>
              Put Your Store on the Map
            </h2>
            <p style={{ color: GRAY, fontSize: 15, lineHeight: 1.8, margin: "0 0 28px" }}>
              Register your kirana store and update prices from your phone in under 10 seconds.
              Customers searching in your pincode will find you instantly.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Update prices from any phone", "Customers find you on the map", "Build trust with price history", "Free — no subscription needed"].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: DARK }}>
                  <div style={{ width: 22, height: 22, background: BLUE, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontSize: 11, fontWeight: 900, flexShrink: 0 }}>✓</div>
                  {p}
                </div>
              ))}
            </div>
            <Link to="/vendor/login" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: BLUE, color: WHITE, fontWeight: 800, fontSize: 14,
              padding: "13px 28px", borderRadius: 12, textDecoration: "none",
              marginTop: 28, boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
            }}>
              🏪 Register as Vendor →
            </Link>
          </div>

          {/* Visual card */}
          <div style={{ background: WHITE, borderRadius: 24, padding: 28, boxShadow: "0 8px 40px rgba(37,99,235,0.1)", border: "1.5px solid #DBEAFE" }}>
            <div style={{ background: BLUE, borderRadius: 16, padding: "20px", marginBottom: 16, color: WHITE }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 4 }}>VENDOR DASHBOARD</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>Sharma Kirana</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>📍 Madhapur · 500081</div>
            </div>
            {[
              { name: "Tomato",  price: "₹28", change: "↓ from ₹35" },
              { name: "Rice 1kg",price: "₹62", change: "↑ from ₹58" },
              { name: "Onion",   price: "₹22", change: "↓ from ₹30" },
            ].map(({ name, price, change }) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, color: BLUE, fontSize: 16 }}>{price}</div>
                  <div style={{ fontSize: 11, color: GRAY }}>{change}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, background: BLUE, color: WHITE, borderRadius: 10, padding: "12px", textAlign: "center", fontWeight: 800, fontSize: 14 }}>
              Submit Price Update
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ BOTTOM CTA ══════════ */}
      <section style={{ background: DARK, padding: "80px 20px", textAlign: "center" }}>
        <h2 style={{ color: WHITE, fontSize: 36, fontWeight: 900, margin: "0 0 14px", letterSpacing: -0.5 }}>
          Ready to Save Money?
        </h2>
        <p style={{ color: "#9CA3AF", fontSize: 16, margin: "0 auto 36px", maxWidth: 460, lineHeight: 1.7 }}>
          Compare prices at 48+ local stores right now. Free forever.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/search" style={{
            background: BLUE, color: WHITE, fontWeight: 800, fontSize: 15,
            padding: "14px 36px", borderRadius: 12, textDecoration: "none",
            boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
          }}>
            🔍 Search Prices Now
          </Link>
          <Link to="/map" style={{
            background: "#1F2937", color: WHITE, border: "1.5px solid #374151",
            fontWeight: 700, fontSize: 15,
            padding: "14px 36px", borderRadius: 12, textDecoration: "none",
          }}>
            🗺️ Open Map
          </Link>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: "#0F172A", borderTop: "1px solid #1E293B", padding: "32px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: WHITE }}>
            Price<span style={{ color: "#60A5FA" }}>Near</span>
          </div>
          <div style={{ color: "#475569", fontSize: 12 }}>© 2025 PriceNear · Final Year CSE Project</div>
          <div style={{ display: "flex", gap: 16 }}>
            {["Home", "Search", "Map", "Alerts"].map(l => (
              <Link key={l} to={l === "Home" ? "/" : `/${l.toLowerCase()}`} style={{ color: "#64748B", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .feat-grid  { grid-template-columns: 1fr !important; }
          .split-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}