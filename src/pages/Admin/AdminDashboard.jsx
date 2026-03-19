import React, { useState, useEffect } from 'react'
import { db } from "../../services/firebase"
import {
  collection, getDocs, query, where,
  updateDoc, deleteDoc, doc, serverTimestamp, addDoc,
} from "firebase/firestore"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

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

const cardStyle = {
  background: WHITE, border: "1.5px solid #E5E7EB",
  borderRadius: 18, overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  marginBottom: 16,
}

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const [stats,         setStats]         = useState({ totalStores: 0, pending: 0, reports: 0, products: 0, prices: 0 })
  const [pendingStores, setPendingStores] = useState([])
  const [allStores,     setAllStores]     = useState([])
  const [priceReports,  setPriceReports]  = useState([])
  const [allProducts,   setAllProducts]   = useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState("overview")

  // New product form state (admin can add products)
  const [newProductName, setNewProductName] = useState("")
  const [newProductUnit, setNewProductUnit] = useState("")
  const [addingProd,     setAddingProd]     = useState(false)
  const [prodSuccess,    setProdSuccess]    = useState("")

  // Store search filter
  const [storeSearch, setStoreSearch] = useState("")

  // Guard — redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") navigate("/")
  }, [user, navigate])

  // ── fetch all data ──
  const fetchAll = async () => {
    setLoading(true)
    try {
      const [storeSnap, prodSnap, priceSnap, reportSnap] = await Promise.all([
        getDocs(collection(db, "stores")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "prices")),
        getDocs(query(collection(db, "priceReports"), where("status", "==", "pending"))),
      ])

      const allS    = storeSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const pending = allS.filter(s => !s.verified)
      const prods   = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const reports = reportSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      setAllStores(allS)
      setPendingStores(pending)
      setAllProducts(prods)
      setPriceReports(reports)
      setStats({
        totalStores: allS.length,
        pending:     pending.length,
        reports:     reports.length,
        products:    prods.length,
        prices:      priceSnap.size,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ── actions ──
  const verifyStore = async (storeId) => {
    await updateDoc(doc(db, "stores", storeId), { verified: true, verifiedAt: serverTimestamp() })
    fetchAll()
  }

  const rejectStore = async (storeId) => {
    if (!confirm("Permanently delete this store?")) return
    await deleteDoc(doc(db, "stores", storeId))
    fetchAll()
  }

  const toggleStoreVisibility = async (store) => {
    await updateDoc(doc(db, "stores", store.id), { visible: store.visible === false ? true : false })
    fetchAll()
  }

  const dismissReport = async (reportId) => {
    await updateDoc(doc(db, "priceReports", reportId), { status: "reviewed" })
    fetchAll()
  }

  const hideStoreFromReport = async (reportId, storeId) => {
    await updateDoc(doc(db, "stores", storeId), { visible: false })
    await updateDoc(doc(db, "priceReports", reportId), { status: "hidden" })
    fetchAll()
  }

  const addProduct = async () => {
    if (!newProductName.trim()) { alert("Enter product name"); return }
    setAddingProd(true)
    try {
      await addDoc(collection(db, "products"), {
        name:      newProductName.toUpperCase().trim(),
        unit:      newProductUnit || "unit",
        createdAt: serverTimestamp(),
      })
      setProdSuccess(`"${newProductName.toUpperCase()}" added to master list!`)
      setTimeout(() => setProdSuccess(""), 3000)
      setNewProductName(""); setNewProductUnit("")
      fetchAll()
    } finally {
      setAddingProd(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product from master list?")) return
    await deleteDoc(doc(db, "products", id))
    fetchAll()
  }

  const filteredStores = allStores.filter(s =>
    s.name?.toLowerCase().includes(storeSearch.toLowerCase()) ||
    s.pincode?.includes(storeSearch) ||
    s.area?.toLowerCase().includes(storeSearch.toLowerCase())
  )

  // ── Tabs config ──
  const tabs = [
    { id: "overview",  label: "Overview",  icon: "📊", badge: 0 },
    { id: "stores",    label: "Stores",    icon: "🏪", badge: stats.pending },
    { id: "reports",   label: "Reports",   icon: "🚨", badge: stats.reports },
    { id: "products",  label: "Products",  icon: "📦", badge: 0 },
  ]

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    border: "1.5px solid #E5E7EB", borderRadius: 10,
    padding: "10px 14px", fontSize: 13, fontFamily: FONT,
    color: DARK, background: WHITE, outline: "none", transition: "all 0.2s",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: FONT, color: DARK, paddingBottom: 60 }}>

      {/* ── HEADER ── */}
      <div style={{ background: `linear-gradient(135deg,${PURPLE} 0%,${PURPLE2} 100%)`, padding: "28px 20px 24px", color: WHITE }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 50, height: 50, background: "rgba(255,255,255,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>Admin Panel</div>
              <div style={{ fontWeight: 900, fontSize: 20 }}>PriceNear Control Center</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate("/") }}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: WHITE, borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 20 }} className="stats-grid">
          {[
            { v: stats.totalStores, l: "Total Stores",   icon: "🏪", c: BLUE      },
            { v: stats.pending,     l: "Pending Verify", icon: "⏳", c: "#D97706" },
            { v: stats.reports,     l: "Fake Reports",   icon: "🚨", c: "#DC2626" },
            { v: stats.products,    l: "Products",       icon: "📦", c: PURPLE    },
            { v: stats.prices,      l: "Price Records",  icon: "💰", c: "#16A34A" },
          ].map(({ v, l, icon, c }) => (
            <div key={l} style={{ background: WHITE, border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "16px 12px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ color: c, fontWeight: 900, fontSize: loading ? 14 : 22 }}>{loading ? "..." : v}</div>
              <div style={{ color: GRAY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", background: "#E5E7EB", borderRadius: 14, padding: 4, marginBottom: 20, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
              cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: FONT,
              whiteSpace: "nowrap",
              background: activeTab === t.id ? WHITE : "transparent",
              color: activeTab === t.id ? PURPLE : GRAY,
              boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              {t.icon} {t.label}
              {t.badge > 0 && (
                <span style={{ background: "#DC2626", color: WHITE, fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 999 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════════ OVERVIEW TAB ════════ */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="overview-grid">

            {/* Pending verification */}
            <div style={cardStyle}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>⏳ Pending Verification</div>
                {stats.pending > 0 && <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{stats.pending} new</span>}
              </div>
              {pendingStores.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: GRAY, fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>All stores verified
                </div>
              ) : (
                pendingStores.slice(0, 4).map(store => (
                  <div key={store.id} style={{ padding: "12px 18px", borderBottom: "1px solid #F9FAFB", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{store.name}</div>
                      <div style={{ color: GRAY, fontSize: 11 }}>📍 {store.area} · {store.pincode}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => verifyStore(store.id)} style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", color: "#166534", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>✓ Verify</button>
                      <button onClick={() => rejectStore(store.id)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>✕</button>
                    </div>
                  </div>
                ))
              )}
              {pendingStores.length > 4 && (
                <div style={{ padding: "10px 18px", textAlign: "center" }}>
                  <button onClick={() => setActiveTab("stores")} style={{ background: "none", border: "none", color: BLUE, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                    View all {pendingStores.length} pending stores →
                  </button>
                </div>
              )}
            </div>

            {/* Fake price reports */}
            <div style={cardStyle}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>🚨 Fake Price Reports</div>
                {stats.reports > 0 && <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999 }}>{stats.reports} pending</span>}
              </div>
              {priceReports.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: GRAY, fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>No pending reports
                </div>
              ) : (
                priceReports.slice(0, 4).map(r => (
                  <div key={r.id} style={{ padding: "12px 18px", borderBottom: "1px solid #F9FAFB", borderLeft: "4px solid #FCA5A5" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{r.storeName || "Unknown Store"}</div>
                        <div style={{ color: GRAY, fontSize: 11 }}>
                          Reported: <strong style={{ color: "#DC2626" }}>₹{r.reportedPrice}</strong>
                          {r.reason && <span> · "{r.reason}"</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <button onClick={() => dismissReport(r.id)} style={{ background: "#F3F4F6", border: "none", color: GRAY, borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Dismiss</button>
                        <button onClick={() => hideStoreFromReport(r.id, r.storeId)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Hide Store</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent stores summary */}
            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>📊 Platform Summary</div>
              </div>
              <div style={{ padding: "18px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { label: "Verified Stores",   value: allStores.filter(s => s.verified).length,      color: "#16A34A", bg: "#DCFCE7" },
                  { label: "Unverified Stores",  value: allStores.filter(s => !s.verified).length,     color: "#D97706", bg: "#FEF3C7" },
                  { label: "Hidden Stores",      value: allStores.filter(s => s.visible === false).length, color: "#DC2626", bg: "#FEE2E2" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} style={{ background: bg, borderRadius: 12, padding: "16px", textAlign: "center" }}>
                    <div style={{ color, fontWeight: 900, fontSize: 28 }}>{value}</div>
                    <div style={{ color: GRAY, fontSize: 12, fontWeight: 600, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ STORES TAB ════════ */}
        {activeTab === "stores" && (
          <div style={cardStyle}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>All Stores ({allStores.length})</div>
              <input
                placeholder="Search by name, area, pincode..."
                value={storeSearch} onChange={e => setStoreSearch(e.target.value)}
                style={{ ...inputStyle, width: "auto", flex: 1, maxWidth: 280 }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
              />
            </div>

            {loading ? (
              <div style={{ padding: "32px", textAlign: "center", color: GRAY, fontSize: 13 }}>Loading stores...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      {["Store", "Area", "Pincode", "Status", "Visible", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: GRAY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.map((store, i) => (
                      <tr key={store.id} style={{ borderBottom: "1px solid #F9FAFB", background: i % 2 === 0 ? WHITE : "#FAFAFA" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>{store.name}</td>
                        <td style={{ padding: "12px 16px", color: GRAY }}>{store.area || "—"}</td>
                        <td style={{ padding: "12px 16px", color: GRAY, fontFamily: "monospace" }}>{store.pincode}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: store.verified ? "#DCFCE7" : "#FEF3C7", color: store.verified ? "#166534" : "#92400E", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 999 }}>
                            {store.verified ? "✓ Verified" : "⏳ Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: store.visible === false ? "#FEE2E2" : "#DCFCE7", color: store.visible === false ? "#991B1B" : "#166534", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 999 }}>
                            {store.visible === false ? "Hidden" : "Visible"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {!store.verified && (
                              <button onClick={() => verifyStore(store.id)} style={{ background: "#DCFCE7", border: "none", color: "#166534", borderRadius: 7, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Verify</button>
                            )}
                            <button onClick={() => toggleStoreVisibility(store)} style={{ background: store.visible === false ? "#DCFCE7" : "#FEF3C7", border: "none", color: store.visible === false ? "#166534" : "#92400E", borderRadius: 7, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                              {store.visible === false ? "Unhide" : "Hide"}
                            </button>
                            <button onClick={() => rejectStore(store.id)} style={{ background: "#FEF2F2", border: "none", color: "#DC2626", borderRadius: 7, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStores.length === 0 && (
                  <div style={{ padding: "32px", textAlign: "center", color: GRAY, fontSize: 13 }}>No stores match your search</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════ REPORTS TAB ════════ */}
        {activeTab === "reports" && (
          <div style={cardStyle}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>🚨 Fake Price Reports</div>
                <div style={{ color: GRAY, fontSize: 11, marginTop: 2 }}>3+ reports for same store → consider hiding until reviewed</div>
              </div>
              {stats.reports > 0 && <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>{stats.reports} pending</span>}
            </div>

            {priceReports.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No pending reports</div>
                <div style={{ color: GRAY, fontSize: 13 }}>All reports have been reviewed</div>
              </div>
            ) : (
              priceReports.map(r => (
                <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid #F9FAFB", borderLeft: "4px solid #FCA5A5" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{r.storeName || "Unknown Store"}</div>
                      <div style={{ color: GRAY, fontSize: 13, marginBottom: 4 }}>
                        Reported price: <strong style={{ color: "#DC2626" }}>₹{r.reportedPrice}</strong>
                        {r.productId && <span style={{ color: GRAY }}> · Product ID: {r.productId}</span>}
                      </div>
                      {r.reason && (
                        <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, padding: "6px 10px", color: "#92400E", fontSize: 12, display: "inline-block" }}>
                          Reason: "{r.reason}"
                        </div>
                      )}
                      <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 6 }}>
                        Reported by: {r.reportedBy?.slice(0, 12)}...
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => dismissReport(r.id)} style={{ background: "#F3F4F6", border: "none", color: GRAY, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                        Dismiss
                      </button>
                      <button onClick={() => hideStoreFromReport(r.id, r.storeId)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                        Hide Store
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ════════ PRODUCTS TAB ════════ */}
        {activeTab === "products" && (
          <>
            {/* Add product form */}
            <div style={{ ...cardStyle, padding: "20px" }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Add to Master Product List</div>
              <div style={{ color: GRAY, fontSize: 12, marginBottom: 14 }}>
                Products added here are visible to all vendors when they update prices
              </div>

              {prodSuccess && (
                <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", color: "#166534", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                  ✅ {prodSuccess}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  placeholder="Product name (e.g. TOMATO)"
                  value={newProductName} onChange={e => setNewProductName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addProduct()}
                  style={{ ...inputStyle, flex: 2 }}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                />
                <input
                  placeholder="Unit (kg/litre/unit)"
                  value={newProductUnit} onChange={e => setNewProductUnit(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e  => e.target.style.borderColor = "#E5E7EB"}
                />
                <button onClick={addProduct} disabled={addingProd}
                  style={{ background: BLUE, color: WHITE, border: "none", borderRadius: 10, padding: "0 20px", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: FONT, boxShadow: "0 4px 12px rgba(37,99,235,0.25)", whiteSpace: "nowrap", opacity: addingProd ? 0.7 : 1 }}>
                  {addingProd ? "..." : "+ Add"}
                </button>
              </div>
            </div>

            {/* Products table */}
            <div style={cardStyle}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>All Products ({allProducts.length})</div>
              </div>
              {allProducts.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: GRAY, fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>No products yet
                </div>
              ) : (
                <div>
                  {allProducts.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: i < allProducts.length - 1 ? "1px solid #F9FAFB" : "none", background: i % 2 === 0 ? WHITE : "#FAFAFA" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, background: BLUE_MD, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: BLUE2, fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                          {p.unit && <div style={{ color: GRAY, fontSize: 11 }}>{p.unit}</div>}
                        </div>
                      </div>
                      <button onClick={() => deleteProduct(p.id)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      <style>{`
        input::placeholder { color: #9CA3AF; }
        @media (max-width: 700px) {
          .stats-grid    { grid-template-columns: repeat(2,1fr) !important; }
          .overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard