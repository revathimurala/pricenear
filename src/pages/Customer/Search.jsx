import React from 'react'
import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../services/firebase"
import { Link } from "react-router-dom"

const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const DARK    = "#111827"
const GRAY    = "#6B7280"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

const Search = () => {
  const [products,     setProducts]     = useState([])
  const [filtered,     setFiltered]     = useState([])
  const [search,       setSearch]       = useState("")
  const [stores,       setStores]       = useState([])
  const [prices,       setPrices]       = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [userPincode,  setUserPincode]  = useState(localStorage.getItem("searchPincode") || "")
  const [pincodeInput, setPincodeInput] = useState("")
  const [locationMode, setLocationMode] = useState(userPincode ? "pincode" : null)

  useEffect(() => {
    fetchProducts(); fetchStores(); fetchPrices()
    if (navigator.geolocation && !userPincode)
      navigator.geolocation.getCurrentPosition(pos =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      )
  }, [])

  const fetchPrices   = async () => { const s = await getDocs(collection(db,"prices"));   setPrices(s.docs.map(d=>({id:d.id,...d.data()}))) }
  const fetchProducts = async () => { const s = await getDocs(collection(db,"products")); setProducts(s.docs.map(d=>({id:d.id,...d.data()}))) }
  const fetchStores   = async () => { const s = await getDocs(collection(db,"stores"));   setStores(s.docs.map(d=>({id:d.id,...d.data()}))) }

  const calcDist = (lat1,lon1,lat2,lon2) => {
    const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
    return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(2)
  }

  const handleSearch = (e) => {
    const v = e.target.value; setSearch(v)
    setFiltered(products.filter(p => p.name.toLowerCase().includes(v.toLowerCase())))
  }

  const handleSetPincode = () => {
    if (!pincodeInput || !/^\d{6}$/.test(pincodeInput)) {
      alert("Please enter a valid 6-digit pincode")
      return
    }
    localStorage.setItem("searchPincode", pincodeInput)
    setUserPincode(pincodeInput)
    setPincodeInput("")
    setLocationMode("pincode")
    setUserLocation(null)
  }

  const handleUseLocation = () => {
    navigator.geolocation.getCurrentPosition(pos =>
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    )
    setUserPincode("")
    localStorage.removeItem("searchPincode")
    setLocationMode("gps")
  }

  const handleClearPincode = () => {
    setUserPincode("")
    setPincodeInput("")
    localStorage.removeItem("searchPincode")
    setLocationMode(null)
    setUserLocation(null)
  }

  const filteredMeta = filtered.filter(p => {
    const store = stores.find(s => s.id === p.storeId)
    if (userPincode && store?.pincode !== userPincode) return false
    return true
  }).map(p => {
    const store      = stores.find(s => s.id === p.storeId)
    const priceObj   = prices.find(pr => pr.productId===p.id && pr.storeId===p.storeId)
    const allPrices  = prices.filter(pr => pr.productId===p.id)
    const cheapest   = allPrices.length ? Math.min(...allPrices.map(pr=>pr.price)) : null
    const isCheapest = priceObj && cheapest!==null && priceObj.price===cheapest
    const distance   = userLocation && store?.latitude && store?.longitude && locationMode==="gps"
      ? parseFloat(calcDist(userLocation.lat,userLocation.lng,store.latitude,store.longitude))
      : null
    return { ...p, store, priceObj, cheapest, isCheapest, distance }
  })

  const nearestStore = (() => {
    const w = filteredMeta.filter(i=>i.distance!==null)
    return w.length ? w.reduce((a,b)=>b.distance<a.distance?b:a) : null
  })()

  const hasResults  = filteredMeta.length > 0
  const validPrices = filteredMeta.filter(i=>i.priceObj?.price!=null).map(i=>i.priceObj.price)
  const minPrice    = validPrices.length ? Math.min(...validPrices) : null
  const maxPrice    = validPrices.length ? Math.max(...validPrices) : null

  const getBadge = (item) => {
    if (item.isCheapest)              return { label:"BEST PRICE", bg:"#DCFCE7", color:"#166534", border:"#BBF7D0" }
    if (item.priceObj?.price===maxPrice) return { label:"EXPENSIVE",  bg:"#FEE2E2", color:"#991B1B", border:"#FECACA" }
    return                                    { label:"AVERAGE",    bg:"#FEF3C7", color:"#92400E", border:"#FDE68A" }
  }

  const getBarWidth = (price) => {
    if (!minPrice||!maxPrice||minPrice===maxPrice) return "50%"
    return `${((price-minPrice)/(maxPrice-minPrice))*80+15}%`
  }

  const quickSearches = ["🍅 Tomato","🌾 Rice","🥛 Milk","🧅 Onion","🛢️ Oil","🥚 Eggs"]

  return (
    <div style={{ minHeight:"100vh", background:"#F9FAFB", fontFamily:FONT, color:DARK, paddingBottom:60 }}>

      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`, padding:"52px 20px 44px", color:WHITE }}>
        <div style={{ maxWidth:680, margin:"0 auto", textAlign:"center" }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", opacity:0.7, marginBottom:12 }}>Hyperlocal Price Search</p>
          <h1 style={{ fontSize:"clamp(26px,5vw,40px)", fontWeight:900, margin:"0 0 16px", letterSpacing:-0.5 }}>
            Find the Cheapest Price Near You
          </h1>

          {/* Search box */}
          <div style={{ background:WHITE, borderRadius:14, padding:6, display:"flex", gap:6, boxShadow:"0 8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ position:"relative", flex:1 }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:18, pointerEvents:"none" }}>🔍</span>
              <input
                type="text" placeholder="Search tomato, rice, milk..."
                value={search} onChange={handleSearch}
                style={{ width:"100%", boxSizing:"border-box", border:"none", outline:"none", borderRadius:10, padding:"12px 14px 12px 46px", fontSize:14, fontFamily:FONT, color:DARK, background:WHITE }}
              />
            </div>
            <button style={{ background:BLUE, color:WHITE, border:"none", borderRadius:10, padding:"0 22px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:FONT, whiteSpace:"nowrap" }}>
              Search
            </button>
          </div>

          {/* Chips */}
          {search.length===0 && (
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16, flexWrap:"wrap" }}>
              {quickSearches.map(s => {
                const val = s.split(" ")[1]
                return (
                  <button key={s} onClick={()=>{ setSearch(val); setFiltered(products.filter(p=>p.name.toLowerCase().includes(val.toLowerCase()))) }}
                    style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:WHITE, borderRadius:999, padding:"6px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:FONT }}>
                    {s}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* PINCODE / LOCATION MODE */}
      <div style={{ background:WHITE, borderTop:"1px solid #E5E7EB", padding:"14px 20px" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          {userPincode ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                <span style={{ fontSize:18 }}>📍</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:GRAY, fontWeight:600 }}>Searching in pincode</div>
                  <div style={{ fontSize:16, fontWeight:700, color:BLUE }}>{userPincode}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={handleClearPincode}
                  style={{ background:"#FEE2E2", color:"#991B1B", border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
                  ✕ Clear
                </button>
                <button onClick={handleUseLocation}
                  style={{ background:BLUE_LT, color:BLUE, border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
                  🌍 Use Location
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ flex:1, display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:18 }}>📮</span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit pincode..."
                    value={pincodeInput}
                    onChange={(e)=>setPincodeInput(e.target.value.replace(/\D/g,"").slice(0,6))}
                    onKeyPress={(e)=>e.key==="Enter" && handleSetPincode()}
                    style={{ flex:1, border:"1.5px solid #E5E7EB", borderRadius:8, padding:"8px 12px", fontSize:13, fontFamily:FONT, outline:"none" }}
                  />
                  <button onClick={handleSetPincode}
                    style={{ background:BLUE, color:WHITE, border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT, whiteSpace:"nowrap" }}>
                    Set
                  </button>
                </div>
              </div>
              <button onClick={handleUseLocation}
                style={{ background:BLUE_LT, border:`1.5px solid ${BLUE_MD}`, color:BLUE, borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT }}>
                🌍 Or use my current location
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 16px 0" }}>

        {/* Stats */}
        {hasResults && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {[
              { v:filteredMeta.length, l:"Results",    icon:"📦", c:BLUE },
              { v:minPrice!=null?`₹${minPrice}`:"—",   l:"Lowest Price", icon:"💰", c:"#16A34A" },
              { v:locationMode==="pincode"?`📮 ${userPincode}`:nearestStore?`${nearestStore.distance.toFixed(2)} km`:"—", 
                l:locationMode==="pincode"?"Area":"Nearest", icon:"📍", c:"#D97706" },
            ].map(({v,l,icon,c})=>(
              <div key={l} style={{ background:WHITE, border:"1.5px solid #E5E7EB", borderRadius:14, padding:"14px 12px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
                <div style={{ color:c, fontWeight:900, fontSize:18 }}>{v}</div>
                <div style={{ color:GRAY, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* View on Map */}
        {hasResults && (
          <Link to="/map" style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            background:BLUE_LT, border:`1.5px solid ${BLUE_MD}`, borderRadius:12,
            padding:"11px 16px", marginBottom:18, color:BLUE,
            textDecoration:"none", fontWeight:700, fontSize:13,
          }}>
            🗺️ See all these stores on the Map →
          </Link>
        )}

        {/* Results list */}
        {search.length > 0 && (
          hasResults ? (
            <>
              <p style={{ color:GRAY, fontSize:12, fontWeight:600, marginBottom:12 }}>
                {filteredMeta.length} result{filteredMeta.length!==1?"s":""} for "{search}"
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filteredMeta.map(item => {
                  const badge     = getBadge(item)
                  const itemPrice = item.priceObj?.price
                  const isNearest = nearestStore?.store?.id===item.store?.id

                  return (
                    <div key={`${item.id}-${item.store?.id??"x"}`} style={{
                      background:WHITE, border:"1.5px solid #E5E7EB", borderRadius:16,
                      padding:"16px 18px", display:"flex", alignItems:"flex-start",
                      justifyContent:"space-between", gap:14,
                      borderLeft:`4px solid ${item.isCheapest?"#16A34A":isNearest?BLUE:"#E5E7EB"}`,
                      boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        {/* Name + badges */}
                        <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:5 }}>
                          {item.isCheapest && <span style={{ fontSize:14 }}>🏆</span>}
                          <span style={{ fontWeight:800, fontSize:15 }}>{item.name}</span>
                          <span style={{ background:badge.bg, border:`1px solid ${badge.border}`, color:badge.color, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>
                            {badge.label}
                          </span>
                          {isNearest && (
                            <span style={{ background:BLUE_MD, border:`1px solid #93C5FD`, color:BLUE, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999 }}>
                              NEAREST
                            </span>
                          )}
                        </div>
                        {/* Store + dist */}
                        <div style={{ color:GRAY, fontSize:12, marginBottom:10 }}>
                          🏪 {item.store?.name??"Unknown store"}
                          {item.distance!=null && <span style={{ marginLeft:10 }}>📍 {item.distance.toFixed(2)} km</span>}
                        </div>
                        {/* Bar */}
                        {itemPrice!=null && (
                          <div style={{ height:4, background:"#F3F4F6", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ height:"100%", borderRadius:4, width:getBarWidth(itemPrice), background:item.isCheapest?"#16A34A":isNearest?BLUE:"#D97706", transition:"width 0.4s ease" }} />
                          </div>
                        )}
                      </div>
                      {/* Price */}
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ color:item.isCheapest?"#16A34A":item.priceObj?.price===maxPrice?"#DC2626":DARK, fontWeight:900, fontSize:26, lineHeight:1 }}>
                          {itemPrice!=null?`₹${itemPrice}`:"—"}
                        </div>
                        <div style={{ color:GRAY, fontSize:10, marginTop:3 }}>per unit</div>
                        {item.cheapest!=null && itemPrice!=null && itemPrice!==item.cheapest && (
                          <div style={{ color:"#16A34A", fontSize:10, marginTop:4 }}>Best: ₹{item.cheapest}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>No results for "{search}"</div>
              <div style={{ color:GRAY, fontSize:13 }}>Try a different product name</div>
            </div>
          )
        )}

        {/* Empty state */}
        {search.length===0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🛒</div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:6 }}>Start typing to search products</div>
            <div style={{ color:GRAY, fontSize:13 }}>e.g. tomato, rice, milk, onion</div>
          </div>
        )}

      </div>
      <style>{`input::placeholder{color:#9CA3AF}`}</style>
    </div>
  )
}

export default Search