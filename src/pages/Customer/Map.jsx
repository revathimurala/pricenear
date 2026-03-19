import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../services/firebase"
import markerIcon   from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

const BLUE    = "#2563EB"
const BLUE2   = "#1D4ED8"
const BLUE_LT = "#EFF6FF"
const BLUE_MD = "#DBEAFE"
const DARK    = "#111827"
const GRAY    = "#6B7280"
const WHITE   = "#FFFFFF"
const FONT    = "'Sora','Segoe UI',sans-serif"

function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => { if (position) map.setView(position, 14) }, [position])
  return null
}

// Guide: green=cheapest, yellow=mid, red=expensive
function getPinColor(price, minPrice, maxPrice) {
  if (!price || minPrice===maxPrice) return BLUE
  const range = maxPrice - minPrice
  if (price <= minPrice + range*0.33) return "#16A34A"
  if (price <= minPrice + range*0.66) return "#D97706"
  return "#DC2626"
}

function Map() {
  const [stores,        setStores]        = useState([])
  const [products,      setProducts]      = useState([])
  const [prices,        setPrices]        = useState([])
  const [userLocation,  setUserLocation]  = useState(null)
  const [locationError, setLocationError] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [loading,       setLoading]       = useState(true)

  // ── geolocation unchanged ──
  useEffect(() => {
    if (!navigator.geolocation) { setLocationError(true); return }
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      err => { console.error("Location error:", err.message); setLocationError(true) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // ── fetch all three collections ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sSnap, pSnap, prSnap] = await Promise.all([
          getDocs(collection(db,"stores")),
          getDocs(collection(db,"products")),
          getDocs(collection(db,"prices")),
        ])
        setStores(sSnap.docs.map(d=>({id:d.id,...d.data()})))
        setProducts(pSnap.docs.map(d=>({id:d.id,...d.data()})))
        setPrices(prSnap.docs.map(d=>({id:d.id,...d.data()})))
      } catch(err) { console.error("Error fetching data:", err) }
      finally     { setLoading(false) }
    }
    fetchAll()
  }, [])

  // ── haversine unchanged ──
  function getDistance(lat1,lon1,lat2,lon2) {
    const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
  }

  // ── enrich stores with price + distance ──
  const enrichedStores = stores.filter(s=>s.latitude&&s.longitude).map(store => {
    const storePrices   = prices.filter(p=>p.storeId===store.id)
    const cheapestEntry = storePrices.length ? storePrices.reduce((a,b)=>a.price<b.price?a:b) : null
    const cheapestProd  = cheapestEntry ? products.find(p=>p.id===cheapestEntry.productId) : null
    const productNames  = storePrices.map(sp=>{ const pr=products.find(p=>p.id===sp.productId); return pr?pr.name:null }).filter(Boolean)
    const distance      = userLocation ? getDistance(userLocation[0],userLocation[1],store.latitude,store.longitude) : null
    return { ...store, cheapestPrice:cheapestEntry?.price??null, cheapestProduct:cheapestProd?.name??null, productNames, distance, allPrices:storePrices }
  })

  const withPrice    = enrichedStores.filter(s=>s.cheapestPrice!=null)
  const minPrice     = withPrice.length ? Math.min(...withPrice.map(s=>s.cheapestPrice)) : null
  const maxPrice     = withPrice.length ? Math.max(...withPrice.map(s=>s.cheapestPrice)) : null
  const cheapestStore = withPrice.find(s=>s.cheapestPrice===minPrice)??null
  const nearestStore  = enrichedStores.filter(s=>s.distance!=null).reduce((a,b)=>!a?b:b.distance<a.distance?b:a,null)
  const sortedByDist  = [...enrichedStores].filter(s=>s.distance!=null).sort((a,b)=>a.distance-b.distance)

  return (
    <div style={{ minHeight:"100vh", background:"#F9FAFB", fontFamily:FONT, color:DARK, paddingBottom:40 }}>

      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`, padding:"36px 20px 30px", color:WHITE, textAlign:"center" }}>
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", opacity:0.7, marginBottom:10 }}>Live Store Map</p>
        <h1 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:900, margin:"0 0 6px", letterSpacing:-0.5 }}>
          Nearby Stores Around You
        </h1>
        <p style={{ opacity:0.75, fontSize:14, margin:0 }}>
          {loading ? "Loading stores..." : `${enrichedStores.length} stores found · Green = cheapest prices`}
        </p>
        {locationError && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:14, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"8px 16px", color:"#991B1B", fontSize:12, fontWeight:600 }}>
            ⚠️ Location access denied — allow it in browser settings
          </div>
        )}
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"20px 16px 0" }}>

        {/* STATS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }} className="stats-grid">
          {[
            { v:enrichedStores.length,   l:"Stores",         icon:"🏪", c:BLUE     },
            { v:minPrice!=null?`₹${minPrice}`:"—", l:"Cheapest Price", icon:"💰", c:"#16A34A" },
            { v:nearestStore?`${nearestStore.distance.toFixed(2)} km`:"—", l:"Nearest", icon:"📍", c:"#D97706" },
            { v:products.length, l:"Products", icon:"📦", c:"#7C3AED" },
          ].map(({v,l,icon,c})=>(
            <div key={l} style={{ background:WHITE, border:"1.5px solid #E5E7EB", borderRadius:14, padding:"14px 10px", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
              <div style={{ color:c, fontWeight:900, fontSize:18 }}>{v}</div>
              <div style={{ color:GRAY, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* MAP + PANEL */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:14, alignItems:"start" }} className="map-grid">

          {/* MAP */}
          <div style={{ background:WHITE, border:"1.5px solid #E5E7EB", borderRadius:18, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>

            {/* Legend */}
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #F3F4F6", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <span style={{ fontWeight:800, fontSize:13 }}>🗺️ Live Map</span>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                {[{ c:"#16A34A",l:"Cheapest"},{ c:"#D97706",l:"Average"},{ c:"#DC2626",l:"Expensive"},{ c:BLUE,l:"You"}].map(({c,l})=>(
                  <span key={l} style={{ display:"flex", alignItems:"center", gap:5, color:GRAY, fontSize:11, fontWeight:600 }}>
                    <span style={{ width:10,height:10,borderRadius:"50%",background:c,display:"inline-block",border:"1.5px solid #E5E7EB" }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <MapContainer center={userLocation||[17.385,78.486]} zoom={13} style={{ height:460,width:"100%" }}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {userLocation && <RecenterMap position={userLocation} />}

              {enrichedStores.map(store => {
                if (!store.latitude||!store.longitude) return null
                const pinColor   = getPinColor(store.cheapestPrice,minPrice,maxPrice)
                const isNearest  = nearestStore?.id===store.id
                const isCheapest = store.cheapestPrice===minPrice&&minPrice!=null
                const isSelected = selectedStore?.id===store.id
                return (
                  <CircleMarker key={store.id}
                    center={[store.latitude,store.longitude]}
                    radius={isSelected?24:isNearest?20:16}
                    pathOptions={{ fillColor:pinColor, fillOpacity:1, color:WHITE, weight:isSelected?4:2 }}
                    eventHandlers={{ click:()=>setSelectedStore(store) }}
                  >
                    <Popup>
                      <div style={{ fontFamily:FONT, minWidth:170 }}>
                        <div style={{ fontWeight:800,fontSize:14,marginBottom:4 }}>{store.name}</div>
                        <div style={{ fontSize:11,color:GRAY,marginBottom:6 }}>📍 {store.area||store.pincode}</div>
                        {store.cheapestPrice!=null
                          ? <div style={{ fontSize:24,fontWeight:900,color:pinColor,marginBottom:4 }}>₹{store.cheapestPrice} <span style={{ fontSize:11,color:GRAY,fontWeight:500 }}>{store.cheapestProduct&&`(${store.cheapestProduct})`}</span></div>
                          : <div style={{ color:GRAY,fontSize:12,marginBottom:4 }}>No prices yet</div>
                        }
                        {store.distance!=null && <div style={{ fontSize:11,color:GRAY,marginBottom:6 }}>📏 {store.distance.toFixed(2)} km away</div>}
                        {store.productNames.length>0 && <div style={{ fontSize:10,color:GRAY }}>Stocks: {store.productNames.slice(0,3).join(", ")}{store.productNames.length>3&&` +${store.productNames.length-3} more`}</div>}
                        <div style={{ marginTop:6,display:"flex",gap:5,flexWrap:"wrap" }}>
                          {isCheapest && <span style={{ background:"#DCFCE7",color:"#166534",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4 }}>💰 Cheapest</span>}
                          {isNearest  && <span style={{ background:BLUE_MD,color:BLUE2,fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4 }}>🟢 Nearest</span>}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}

              {userLocation && (
                <CircleMarker center={userLocation} radius={13} pathOptions={{ fillColor:BLUE,fillOpacity:1,color:WHITE,weight:3 }}>
                  <Popup><strong>📍 You are here</strong></Popup>
                </CircleMarker>
              )}
            </MapContainer>
          </div>

          {/* SIDE PANEL */}
          <div style={{ display:"flex",flexDirection:"column",gap:10 }} className="side-panel">

            {/* Selected */}
            {selectedStore ? (
              <div style={{ background:WHITE,border:`2px solid ${BLUE}`,borderRadius:16,padding:16,boxShadow:"0 4px 16px rgba(37,99,235,0.12)" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                  <span style={{ color:BLUE,fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:1 }}>Selected Store</span>
                  <button onClick={()=>setSelectedStore(null)} style={{ background:"none",border:"none",color:GRAY,cursor:"pointer",fontSize:18,padding:0 }}>✕</button>
                </div>
                <div style={{ fontWeight:800,fontSize:16,marginBottom:2 }}>{selectedStore.name}</div>
                <div style={{ color:GRAY,fontSize:12,marginBottom:8 }}>📍 {selectedStore.area||selectedStore.pincode}{selectedStore.distance!=null&&<span style={{ marginLeft:8 }}>{selectedStore.distance.toFixed(2)} km</span>}</div>
                {selectedStore.cheapestPrice!=null && (
                  <div style={{ color:getPinColor(selectedStore.cheapestPrice,minPrice,maxPrice),fontWeight:900,fontSize:30,marginBottom:4 }}>
                    ₹{selectedStore.cheapestPrice}
                    {selectedStore.cheapestProduct && <span style={{ fontSize:13,color:GRAY,fontWeight:500,marginLeft:6 }}>({selectedStore.cheapestProduct})</span>}
                  </div>
                )}
                {selectedStore.allPrices.length>0 && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ color:GRAY,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>All Prices</div>
                    <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                      {selectedStore.allPrices.map(sp=>{
                        const prod=products.find(p=>p.id===sp.productId)
                        return (
                          <div key={sp.id} style={{ display:"flex",justifyContent:"space-between",background:"#F9FAFB",borderRadius:8,padding:"7px 10px",border:"1px solid #F3F4F6" }}>
                            <span style={{ color:GRAY,fontSize:12 }}>{prod?.name??sp.productId}</span>
                            <span style={{ fontWeight:800,fontSize:12,color:DARK }}>₹{sp.price}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {selectedStore.cheapestPrice===minPrice&&minPrice!=null && (
                  <div style={{ marginTop:12,background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:8,padding:"8px 10px",color:"#166534",fontSize:12,fontWeight:700 }}>
                    🏆 Cheapest store in your area!
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background:BLUE_LT,border:`1.5px solid ${BLUE_MD}`,borderRadius:14,padding:"16px",textAlign:"center" }}>
                <div style={{ fontSize:24,marginBottom:6 }}>👆</div>
                <div style={{ color:BLUE,fontSize:12,fontWeight:600 }}>Click any pin on the map to see store details</div>
              </div>
            )}

            {/* All stores list */}
            <div style={{ background:WHITE,border:"1.5px solid #E5E7EB",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ padding:"12px 14px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <span style={{ fontWeight:800,fontSize:13 }}>📋 All Stores</span>
                <span style={{ color:GRAY,fontSize:11 }}>{userLocation?"by distance":"enable location"}</span>
              </div>
              <div style={{ maxHeight:340,overflowY:"auto" }}>
                {loading ? (
                  <div style={{ padding:24,textAlign:"center",color:GRAY,fontSize:12 }}>Loading...</div>
                ) : sortedByDist.length===0 ? (
                  <div style={{ padding:24,textAlign:"center",color:GRAY,fontSize:12 }}>
                    {userLocation?"No stores with coordinates":"Allow location to see distances"}
                  </div>
                ) : sortedByDist.map((store,i)=>{
                  const pinColor   = getPinColor(store.cheapestPrice,minPrice,maxPrice)
                  const isNearest  = nearestStore?.id===store.id
                  const isCheapest = store.cheapestPrice===minPrice&&minPrice!=null
                  const isSelected = selectedStore?.id===store.id
                  return (
                    <div key={store.id} onClick={()=>setSelectedStore(store)}
                      style={{ padding:"11px 14px",borderBottom:"1px solid #F9FAFB",cursor:"pointer",borderLeft:`4px solid ${pinColor}`,background:isSelected?BLUE_LT:WHITE,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,transition:"background 0.15s" }}
                      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background="#F9FAFB" }}
                      onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background=WHITE }}
                    >
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
                          <span style={{ color:GRAY,fontSize:10,fontWeight:700 }}>#{i+1}</span>
                          <span style={{ fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{store.name}</span>
                        </div>
                        <div style={{ color:GRAY,fontSize:10 }}>
                          📏 {store.distance.toFixed(2)} km
                          {isNearest&&<span style={{ color:BLUE,marginLeft:6,fontWeight:700 }}>● Nearest</span>}
                        </div>
                      </div>
                      <div style={{ textAlign:"right",flexShrink:0 }}>
                        <div style={{ color:pinColor,fontWeight:900,fontSize:15 }}>{store.cheapestPrice!=null?`₹${store.cheapestPrice}`:"—"}</div>
                        {isCheapest&&<div style={{ color:"#16A34A",fontSize:9,fontWeight:800 }}>CHEAPEST</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:700px){.map-grid{grid-template-columns:1fr!important}.stats-grid{grid-template-columns:repeat(2,1fr)!important}.side-panel{order:-1}}
        .leaflet-container{font-family:${FONT}}
      `}</style>
    </div>
  )
}

export default Map