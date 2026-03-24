import React from 'react'
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { db } from "../../services/firebase"
import { auth } from '../../services/firebase'
import { collection, getDocs, addDoc, query, where, serverTimestamp, doc, deleteDoc } from "firebase/firestore"

const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const DARK    = "#111827"
const GRAY    = "#6B7280"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

const inputStyle = {
  width:"100%", boxSizing:"border-box",
  border:"1.5px solid #E5E7EB", borderRadius:10,
  padding:"11px 14px", fontSize:14, fontFamily:FONT,
  color:DARK, background:WHITE, outline:"none", transition:"all 0.2s",
}

const VendorDashboard = () => {
  // ── all original state unchanged ──
  const navigate = useNavigate()
  const [products,    setProducts]    = useState([])
  const [productName, setProductName] = useState("")
  const [message,     setMessage]     = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [price,       setPrice]       = useState("")
  const [storeId,     setStoreId]     = useState("")
  const [storeName,   setStoreName]   = useState("")
  const [stores,      setStores]      = useState([])
  const [area,        setArea]        = useState("")
  const [latitude,    setLatitude]    = useState("")
  const [longitude,   setLongitude]   = useState("")
  const [pincode,     setPincode]     = useState("")

  // UI state
  const [activeTab,    setActiveTab]    = useState("store")
  const [storeSuccess, setStoreSuccess] = useState("")
  const [prodSuccess,  setProdSuccess]  = useState("")
  const [priceSuccess, setPriceSuccess] = useState("")
  const [deletingId,   setDeletingId]   = useState(null)
  const [addingPrice,  setAddingPrice]  = useState(false)

  // ── all original logic unchanged ──
  const fetchStores = async () => {
    const user = auth.currentUser
    if (!user) return
    const q = query(collection(db,"stores"),where("ownerUid","==",user.uid))
    const snap = await getDocs(q)
    const list = snap.docs.map(d=>({id:d.id,...d.data()}))
    setStores(list)
    if (list.length>0) setStoreId(list[0].id)
  }
  useEffect(()=>{ fetchStores() },[])

  const addStore = async () => {
    const user = auth.currentUser
    if (!storeName||!area||!pincode) { alert("Please fill all store details"); return }
    const docRef = await addDoc(collection(db,"stores"),{ name:storeName,area,pincode,latitude:Number(latitude),longitude:Number(longitude),ownerUid:user.uid,verified:true })
    setStoreSuccess(`"${storeName}" added!`)
    setTimeout(()=>setStoreSuccess(""),3000)
    setStoreName(""); setArea(""); setPincode(""); setLatitude(""); setLongitude("")
    setStoreId(docRef.id)
    fetchStores()
  }

  const fetchProducts = async () => {
    const q = query(collection(db,"products"),where("storeId","==",storeId))
    const snap = await getDocs(q)
    setProducts(snap.docs.map(d=>({id:d.id,...d.data()})))
  }
  useEffect(()=>{ if (!storeId) return; fetchProducts() },[storeId])

  const addProduct = async () => {
    if (!storeId) { alert("Select a store first"); return }
    if (!productName) { alert("Enter product name"); return }
    const q=query(collection(db,"products"),where("name","==",productName.toUpperCase()),where("storeId","==",storeId))
    const snap=await getDocs(q)
    if (!snap.empty) { alert("Product already exists"); return }
    await addDoc(collection(db,"products"),{ name:productName.toUpperCase(),storeId })
    fetchProducts()
    setProdSuccess(`"${productName.toUpperCase()}" added!`)
    setTimeout(()=>setProdSuccess(""),3000)
    setProductName("")
  }

  const deleteProduct = async (id) => {
    setDeletingId(id)
    await deleteDoc(doc(db,"products",id))
    setProducts(products.filter(p=>p.id!==id))
    setDeletingId(null)
  }

  const addPrice = async () => {
    if (!selectedProduct||!price) { alert("Select product and enter price"); return }
    setAddingPrice(true)
    await addDoc(collection(db,"prices"),{
      storeId, productId:selectedProduct, price:Number(price),
      date:new Date().toISOString().split("T")[0],
      timestamp:serverTimestamp()
    })
    setPriceSuccess(`₹${price} saved!`)
    setTimeout(()=>setPriceSuccess(""),3000)
    setPrice(""); setSelectedProduct("")
    setAddingPrice(false)
  }

  const currentStore = stores.find(s=>s.id===storeId)
  const tabs = [{ id:"store",label:"Store",icon:"🏪"},{ id:"products",label:"Products",icon:"📦"},{ id:"prices",label:"Prices",icon:"💰"}]

  const labelStyle = { display:"block",color:GRAY,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }
  const cardStyle  = { background:WHITE,border:"1.5px solid #E5E7EB",borderRadius:18,padding:"22px 20px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }

  return (
    <div style={{ minHeight:"100vh",background:"#F9FAFB",fontFamily:FONT,color:DARK,paddingBottom:60 }}>

      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`,color:WHITE,padding:"28px 20px 24px" }}>
        <div style={{ maxWidth:560,margin:"0 auto" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ width:48,height:48,background:"rgba(255,255,255,0.2)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>🏪</div>
              <div>
                <div style={{ fontSize:11,fontWeight:700,opacity:0.7,textTransform:"uppercase",letterSpacing:1 }}>Vendor Dashboard</div>
                <div style={{ fontWeight:900,fontSize:18 }}>{currentStore?.name||"Your Store"}</div>
                <div style={{ opacity:0.75,fontSize:13 }}>📍 {currentStore?.area||"—"} · {currentStore?.pincode||"—"}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:20 }}>
            {[{v:stores.length,l:"Stores"},{v:products.length,l:"Products"},{v:"Active",l:"Status"}].map(({v,l})=>(
              <div key={l} style={{ background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"12px 10px",textAlign:"center" }}>
                <div style={{ fontWeight:900,fontSize:20 }}>{v}</div>
                <div style={{ opacity:0.7,fontSize:11,fontWeight:600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:560,margin:"0 auto",padding:"20px 16px 0" }}>

        {/* TABS */}
        <div style={{ display:"flex",background:"#E5E7EB",borderRadius:14,padding:4,marginBottom:18 }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              flex:1,padding:"10px 8px",borderRadius:10,border:"none",cursor:"pointer",
              fontWeight:700,fontSize:13,fontFamily:FONT,
              background:activeTab===t.id?WHITE:"transparent",
              color:activeTab===t.id?BLUE:GRAY,
              boxShadow:activeTab===t.id?"0 1px 4px rgba(0,0,0,0.1)":"none",
              transition:"all 0.2s"
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── STORE TAB ── */}
        {activeTab==="store" && (
          <>
            {stores.length>0 && (
              <div style={cardStyle}>
                <div style={{ fontWeight:800,fontSize:14,marginBottom:12 }}>Your Stores</div>
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {stores.map(s=>(
                    <div key={s.id} onClick={()=>setStoreId(s.id)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:s.id===storeId?BLUE_LT:"#F9FAFB",border:`1.5px solid ${s.id===storeId?BLUE_MD:"#E5E7EB"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s" }}>
                      <div>
                        <div style={{ fontWeight:700,fontSize:13 }}>{s.name}</div>
                        <div style={{ color:GRAY,fontSize:11,marginTop:2 }}>📍 {s.area} · {s.pincode}</div>
                      </div>
                      {s.id===storeId && <span style={{ background:BLUE,color:WHITE,fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:999 }}>ACTIVE</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={cardStyle}>
              <div style={{ fontWeight:800,fontSize:14,marginBottom:4 }}>Add New Store</div>
              <div style={{ color:GRAY,fontSize:12,marginBottom:16 }}>Register your store location on the map</div>
              
              {/* LOCATION BUTTON */}
              <button onClick={() => navigate("/vendor/add-store")} style={{
                width: "100%",
                background: "#10B981",
                color: WHITE,
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: FONT,
                boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
                marginBottom: 14,
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#059669"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#10B981"}
              >
                📍 Add Store with GPS Location
              </button>

              <div style={{ fontSize: 12, color: GRAY, marginBottom: 14, textAlign: "center" }}>
                ─ OR ─
              </div>

              <div style={{ fontWeight:700,fontSize:12,marginBottom:12,color:GRAY,textTransform:"uppercase" }}>Manual Entry</div>
              {storeSuccess && <div style={{ background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",color:"#166534",fontSize:13,fontWeight:600,marginBottom:14 }}>✅ {storeSuccess}</div>}
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div><label style={labelStyle}>Store Name</label><input placeholder="e.g. Sharma Kirana" value={storeName} onChange={e=>setStoreName(e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"} /></div>
                <div><label style={labelStyle}>Area</label><input placeholder="e.g. Madhapur" value={area} onChange={e=>setArea(e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"} /></div>
                <div><label style={labelStyle}>Pincode</label><input placeholder="e.g. 500081" value={pincode} onChange={e=>setPincode(e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"} /></div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  <div><label style={labelStyle}>Latitude</label><input placeholder="17.385" value={latitude} onChange={e=>setLatitude(e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"} /></div>
                  <div><label style={labelStyle}>Longitude</label><input placeholder="78.486" value={longitude} onChange={e=>setLongitude(e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"} /></div>
                </div>
                <div style={{ background:BLUE_LT,border:`1px solid ${BLUE_MD}`,borderRadius:8,padding:"8px 12px",color:BLUE,fontSize:11,fontWeight:600 }}>
                  💡 Get lat/lng: right-click your location on Google Maps → Copy coordinates
                </div>
                <button onClick={addStore} style={{ background:BLUE,color:WHITE,border:"none",borderRadius:12,padding:"13px",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:FONT,boxShadow:"0 4px 14px rgba(37,99,235,0.25)" }}>
                  Add Store 🏪
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab==="products" && (
          <>
            <div style={cardStyle}>
              <div style={{ fontWeight:800,fontSize:14,marginBottom:10 }}>Select Store</div>
              <select value={storeId} onChange={e=>setStoreId(e.target.value)} style={{ ...inputStyle,cursor:"pointer" }}
                onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"}>
                <option value="">Select a store</option>
                {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight:800,fontSize:14,marginBottom:12 }}>Add Product</div>
              {prodSuccess && <div style={{ background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",color:"#166534",fontSize:13,fontWeight:600,marginBottom:12 }}>✅ {prodSuccess}</div>}
              <div style={{ display:"flex",gap:8 }}>
                <input placeholder="Product name (e.g. Tomato)" value={productName} onChange={e=>setProductName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProduct()}
                  style={{ ...inputStyle,flex:1 }} onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"} />
                <button onClick={addProduct} style={{ background:BLUE,color:WHITE,border:"none",borderRadius:10,padding:"0 18px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(37,99,235,0.25)" }}>+ Add</button>
              </div>
            </div>

            <div style={{ ...cardStyle,padding:0,overflow:"hidden" }}>
              <div style={{ padding:"16px 20px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ fontWeight:800,fontSize:14 }}>Your Products</div>
                <span style={{ background:"#F3F4F6",color:GRAY,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:999 }}>{products.length} items</span>
              </div>
              {products.length===0 ? (
                <div style={{ textAlign:"center",padding:"36px 20px",color:GRAY,fontSize:13 }}>
                  <div style={{ fontSize:32,marginBottom:8 }}>📦</div>
                  No products yet — add one above
                </div>
              ) : (
                <div>
                  {products.map((p,i)=>(
                    <div key={p.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:i<products.length-1?"1px solid #F9FAFB":"none",background:WHITE }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:28,height:28,borderRadius:8,background:BLUE_MD,display:"flex",alignItems:"center",justifyContent:"center",color:BLUE,fontWeight:800,fontSize:11,flexShrink:0 }}>{i+1}</div>
                        <span style={{ fontWeight:600,fontSize:14 }}>{p.name}</span>
                      </div>
                      <button onClick={()=>deleteProduct(p.id)} disabled={deletingId===p.id}
                        style={{ background:"#FEF2F2",border:"1px solid #FECACA",color:"#DC2626",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT,opacity:deletingId===p.id?0.5:1 }}>
                        {deletingId===p.id?"...":"Delete"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PRICES TAB ── */}
        {activeTab==="prices" && (
          <>
            <div style={cardStyle}>
              <div style={{ fontWeight:800,fontSize:14,marginBottom:4 }}>Submit Price</div>
              <div style={{ color:GRAY,fontSize:12,marginBottom:16 }}>Each submission adds to history — customers see your 30-day trend</div>
              {priceSuccess && <div style={{ background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:10,padding:"10px 14px",color:"#166534",fontSize:13,fontWeight:600,marginBottom:14 }}>✅ {priceSuccess}</div>}

              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div>
                  <label style={labelStyle}>Select Product</label>
                  <select onChange={e=>setSelectedProduct(e.target.value)} value={selectedProduct} style={{ ...inputStyle,cursor:"pointer" }}
                    onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"}>
                    <option value="">Choose a product</option>
                    {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Price (₹)</label>
                  <input type="number" placeholder="Enter today's price" value={price}
                    onChange={e=>setPrice(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPrice()}
                    style={{ ...inputStyle,fontSize:28,fontWeight:900,color:BLUE,textAlign:"center",letterSpacing:1 }}
                    onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#E5E7EB"} />
                </div>

                {selectedProduct&&price && (
                  <div style={{ background:BLUE_LT,border:`1px solid ${BLUE_MD}`,borderRadius:10,padding:"10px 14px",fontSize:13,color:DARK }}>
                    Preview: <strong>{products.find(p=>p.id===selectedProduct)?.name}</strong> → <strong style={{ color:BLUE }}>₹{price}</strong> at <strong>{currentStore?.name}</strong>
                  </div>
                )}

                <button onClick={addPrice} disabled={addingPrice}
                  style={{ background:BLUE,color:WHITE,border:"none",borderRadius:12,padding:"14px",fontWeight:800,fontSize:15,cursor:addingPrice?"not-allowed":"pointer",fontFamily:FONT,boxShadow:"0 4px 16px rgba(37,99,235,0.25)",opacity:addingPrice?0.7:1 }}>
                  {addingPrice?"Saving...":"Submit Price 💰"}
                </button>
              </div>
            </div>

            <div style={{ background:BLUE_LT,border:`1.5px solid ${BLUE_MD}`,borderRadius:14,padding:"14px 16px" }}>
              <div style={{ color:BLUE,fontWeight:700,fontSize:13,marginBottom:4 }}>⚡ How Price History Works</div>
              <div style={{ color:GRAY,fontSize:12,lineHeight:1.7 }}>
                Every price you submit is stored as a new record — not overwritten. This gives customers a 30-day trend chart and builds trust in your store.
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        input::placeholder{color:#9CA3AF}
        select option{background:${WHITE};color:${DARK}}
      `}</style>
    </div>
  )
}

export default VendorDashboard