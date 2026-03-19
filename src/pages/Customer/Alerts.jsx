import React, { useState, useEffect } from "react"
import { db } from "../../services/firebase"
import {
  collection, query, where, getDocs,
  addDoc, serverTimestamp, onSnapshot,
  updateDoc, deleteDoc, doc,
} from "firebase/firestore"
import { auth } from "../../services/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Link } from "react-router-dom"

// ── design tokens (same as every other page) ──
const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const DARK    = "#111827"
const GRAY    = "#6B7280"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  border: "1.5px solid #E5E7EB", borderRadius: 10,
  padding: "11px 14px", fontSize: 14, fontFamily: FONT,
  color: DARK, background: WHITE, outline: "none", transition: "all 0.2s",
}
const labelStyle = {
  display: "block", color: GRAY, fontSize: 11,
  fontWeight: 700, textTransform: "uppercase",
  letterSpacing: 1, marginBottom: 6,
}
const cardStyle = {
  background: WHITE, border: "1.5px solid #E5E7EB",
  borderRadius: 18, overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  marginBottom: 16,
}

const Alerts = () => {
  const [user,         setUser]         = useState(null)
  const [authLoading,  setAuthLoading]  = useState(true)
  const [products,     setProducts]     = useState([])
  const [selectedProd, setSelectedProd] = useState("")
  const [selectedName, setSelectedName] = useState("")
  const [targetPrice,  setTargetPrice]  = useState("")
  const [pincode,      setPincode]      = useState(localStorage.getItem("pincode") || "")
  const [myAlerts,     setMyAlerts]     = useState([])
  const [notifications,setNotifications]= useState([])
  const [saving,       setSaving]       = useState(false)
  const [success,      setSuccess]      = useState("")
  const [activeTab,    setActiveTab]    = useState("alerts") // "alerts" | "notifications"

  // ── watch Firebase Auth state ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  // ── fetch products ──
  useEffect(() => {
    getDocs(collection(db, "products")).then(snap =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  // ── real-time notifications ──
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    )
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setNotifications(items)
    })
    return () => unsub()
  }, [user])

  // ── fetch my alerts ──
  const fetchMyAlerts = () => {
    if (!user) return
    getDocs(
      query(collection(db, "priceAlerts"), where("userId", "==", user.uid))
    ).then(snap =>
      setMyAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }
  useEffect(() => { fetchMyAlerts() }, [user])

  // ── set new alert ──
  const handleSetAlert = async () => {
    if (!user)           { alert("Please login first");            return }
    if (!selectedProd)   { alert("Select a product");              return }
    if (!targetPrice)    { alert("Enter your target price");       return }
    if (!pincode)        { alert("Enter your pincode");            return }

    setSaving(true)
    try {
      await addDoc(collection(db, "priceAlerts"), {
        userId:      user.uid,
        productId:   selectedProd,
        productName: selectedName,
        targetPrice: Number(targetPrice),
        pincode,
        active:      true,
        createdAt:   serverTimestamp(),
      })
      setSuccess(`Alert set! You'll be notified when ${selectedName} drops below ₹${targetPrice} in ${pincode}.`)
      setTimeout(() => setSuccess(""), 5000)
      setSelectedProd(""); setSelectedName(""); setTargetPrice("")
      fetchMyAlerts()
    } finally {
      setSaving(false)
    }
  }

  // ── delete an alert ──
  const deleteAlert = async (id) => {
    await deleteDoc(doc(db, "priceAlerts", id))
    setMyAlerts(prev => prev.filter(a => a.id !== id))
  }

  // ── mark notification as read ──
  const markRead = async (notifId) => {
    await updateDoc(doc(db, "notifications", notifId), { read: true })
  }

  // ── mark all as read ──
  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true })))
  }

  // ── delete a notification ──
  const deleteNotif = async (id) => {
    await deleteDoc(doc(db, "notifications", id))
  }

  const unreadCount  = notifications.filter(n => !n.read).length
  const activeAlerts = myAlerts.filter(a => a.active)

  const tabs = [
    { id: "alerts",        label: "My Alerts",     count: activeAlerts.length },
    { id: "notifications", label: "Notifications", count: unreadCount },
  ]

  // ── loading auth state ──
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${BLUE_MD}`, borderTopColor: BLUE, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: GRAY, fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: FONT, color: DARK, paddingBottom: 60 }}>

      {/* ── HERO ── */}
      <div style={{ background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`, padding: "40px 20px 32px", color: WHITE }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, marginBottom: 10 }}>
            Price Drop System
          </p>
          <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, margin: "0 0 10px", letterSpacing: -0.5 }}>
            🔔 Price Alerts
          </h1>
          <p style={{ opacity: 0.8, fontSize: 14, margin: 0, lineHeight: 1.7 }}>
            Set a target price for any product. The moment any store in your area drops below it, you get notified instantly — no need to keep checking.
          </p>

          {/* stat chips */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { v: activeAlerts.length,  l: "Active Alerts"  },
              { v: unreadCount,          l: "Unread"         },
              { v: notifications.length, l: "Total Notifs"   },
            ].map(({ v, l }) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{v}</div>
                <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* ── NOT LOGGED IN ── */}
        {!user && (
          <div style={{ background: WHITE, border: `2px solid ${BLUE_MD}`, borderRadius: 18, padding: "32px 24px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🔒</div>
            <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>Login Required</h2>
            <p style={{ color: GRAY, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              You need to be logged in to set price alerts and receive notifications.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/customer/login" style={{ background: BLUE, color: WHITE, fontWeight: 700, fontSize: 14, padding: "11px 24px", borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
                Login as customer
              </Link>
              <Link to="/search" style={{ background: BLUE_LT, color: BLUE, fontWeight: 700, fontSize: 14, padding: "11px 24px", borderRadius: 10, textDecoration: "none", border: `1.5px solid ${BLUE_MD}` }}>
                Browse Prices Instead
              </Link>
            </div>
          </div>
        )}

        {/* ── SET ALERT FORM ── */}
        {user && (
          <div style={cardStyle}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Set New Alert</div>
              <div style={{ color: GRAY, fontSize: 12, marginTop: 2 }}>
                We'll notify you the moment any store in your pincode drops below your target
              </div>
            </div>
            <div style={{ padding: "20px" }}>

              {success && (
                <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 14px", color: "#166534", fontSize: 13, fontWeight: 600, marginBottom: 16, lineHeight: 1.6 }}>
                  ✅ {success}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {/* Product */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Product</label>
                  <select
                    value={selectedProd}
                    onChange={e => {
                      setSelectedProd(e.target.value)
                      setSelectedName(e.target.options[e.target.selectedIndex].text)
                    }}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                  >
                    <option value="">Select a product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Target price */}
                <div>
                  <label style={labelStyle}>Target Price (₹)</label>
                  <input
                    type="number" placeholder="e.g. 25"
                    value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label style={labelStyle}>Pincode</label>
                  <input
                    type="text" placeholder="e.g. 500081"
                    value={pincode}
                    onChange={e => { setPincode(e.target.value); localStorage.setItem("pincode", e.target.value) }}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                  />
                </div>
              </div>

              {/* Preview */}
              {selectedProd && targetPrice && pincode && (
                <div style={{ background: BLUE_LT, border: `1px solid ${BLUE_MD}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: DARK, marginBottom: 14 }}>
                  🔔 Alert: notify me when <strong>{selectedName}</strong> drops below <strong style={{ color: BLUE }}>₹{targetPrice}</strong> in pincode <strong>{pincode}</strong>
                </div>
              )}

              <button onClick={handleSetAlert} disabled={saving}
                style={{ width: "100%", background: BLUE, color: WHITE, border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: FONT, boxShadow: "0 4px 14px rgba(37,99,235,0.25)", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Setting Alert..." : "Set Price Alert 🔔"}
              </button>
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        {user && (
          <>
            <div style={{ display: "flex", background: "#E5E7EB", borderRadius: 14, padding: 4, marginBottom: 16 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 13, fontFamily: FONT,
                  background: activeTab === t.id ? WHITE : "transparent",
                  color: activeTab === t.id ? BLUE : GRAY,
                  boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  {t.label}
                  {t.count > 0 && (
                    <span style={{ background: activeTab === t.id ? BLUE : "#9CA3AF", color: WHITE, fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 999, minWidth: 18, textAlign: "center" }}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── MY ALERTS TAB ── */}
            {activeTab === "alerts" && (
              <div style={cardStyle}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Active Alerts</div>
                  <span style={{ background: "#F3F4F6", color: GRAY, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                    {activeAlerts.length} active
                  </span>
                </div>

                {activeAlerts.length === 0 ? (
                  <div style={{ padding: "48px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>🔕</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No alerts set yet</div>
                    <div style={{ color: GRAY, fontSize: 13 }}>Use the form above to set your first price alert</div>
                  </div>
                ) : (
                  <div>
                    {activeAlerts.map((alert, i) => (
                      <div key={alert.id} style={{
                        padding: "14px 20px",
                        borderBottom: i < activeAlerts.length - 1 ? "1px solid #F9FAFB" : "none",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{alert.productName}</span>
                            <span style={{ background: BLUE_MD, color: BLUE2, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                              ACTIVE
                            </span>
                          </div>
                          <div style={{ color: GRAY, fontSize: 12 }}>
                            Notify when price drops below{" "}
                            <strong style={{ color: BLUE }}>₹{alert.targetPrice}</strong>
                            {" · "}📍 {alert.pincode}
                          </div>
                          {alert.createdAt?.toDate && (
                            <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 3 }}>
                              Set on {alert.createdAt.toDate().toLocaleDateString("en-IN")}
                            </div>
                          )}
                        </div>
                        <button onClick={() => deleteAlert(alert.id)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, flexShrink: 0 }}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === "notifications" && (
              <div style={cardStyle}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Notifications</div>
                    {unreadCount > 0 && (
                      <span style={{ background: BLUE, color: WHITE, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: "none", border: `1.5px solid ${BLUE_MD}`, color: BLUE, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div style={{ padding: "48px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No notifications yet</div>
                    <div style={{ color: GRAY, fontSize: 13 }}>You'll see alerts here when prices drop below your targets</div>
                  </div>
                ) : (
                  <div>
                    {notifications.map((n, i) => {
                      const typeConfig = {
                        price_drop: { icon: "📉", color: "#166534", bg: "#DCFCE7", border: "#BBF7D0" },
                        price_rise: { icon: "📈", color: "#991B1B", bg: "#FEE2E2", border: "#FECACA" },
                        new_store:  { icon: "🏪", color: BLUE2,     bg: BLUE_LT,  border: BLUE_MD  },
                      }
                      const cfg = typeConfig[n.type] || { icon: "🔔", color: BLUE2, bg: BLUE_LT, border: BLUE_MD }

                      return (
                        <div key={n.id}
                          onClick={() => !n.read && markRead(n.id)}
                          style={{
                            padding: "14px 20px",
                            borderBottom: i < notifications.length - 1 ? "1px solid #F9FAFB" : "none",
                            borderLeft: `4px solid ${n.read ? "#E5E7EB" : BLUE}`,
                            background: n.read ? WHITE : BLUE_LT,
                            cursor: n.read ? "default" : "pointer",
                            display: "flex", gap: 12, alignItems: "flex-start",
                            transition: "background 0.15s",
                          }}
                        >
                          {/* Icon */}
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                            {cfg.icon}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{n.title}</div>
                                <div style={{ color: GRAY, fontSize: 13, lineHeight: 1.6 }}>{n.message}</div>
                                <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 5 }}>
                                  {n.createdAt?.toDate?.()?.toLocaleString("en-IN") || "Just now"}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                {!n.read && (
                                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                                  style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1 }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── HOW IT WORKS (shown when not logged in) ── */}
        {!user && (
          <div style={{ background: WHITE, border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>How Price Alerts Work</div>
            {[
              { n: "1", title: "Set a target price", desc: "Pick any product and enter the maximum price you want to pay. Add your pincode." },
              { n: "2", title: "We watch prices for you", desc: "Every time a vendor updates a price, we check if it crossed your threshold." },
              { n: "3", title: "You get notified instantly", desc: "A notification appears with the store name, new price, and how far below your target it is." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, background: BLUE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                  {n}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: GRAY, fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`
        input::placeholder, select::placeholder { color: #9CA3AF; }
        select option { background: ${WHITE}; color: ${DARK}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default Alerts