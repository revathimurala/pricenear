import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../../services/firebase"
import { collection, addDoc } from "firebase/firestore"

const BLUE = "#2563EB"
const BLUE2 = "#1D4ED8"
const GREEN = "#10B981"
const DARK = "#111827"
const GRAY = "#6B7280"
const WHITE = "#FFFFFF"
const RED = "#EF4444"
const FONT = "'Sora','Segoe UI',sans-serif"

export default function AddStoreWithLocation() {
  const navigate = useNavigate()
  const [shopName, setShopName] = useState("")
  const [area, setArea] = useState("")
  const [pincode, setPincode] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [locationRequested, setLocationRequested] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  // Get current location using Geolocation API
  const handleGetLocation = () => {
    setLoading(true)
    setMessage("")
    setLocationRequested(true)

    if (!navigator.geolocation) {
      setMessageType("error")
      setMessage("⚠️ Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLatitude(lat.toFixed(6))
        setLongitude(lng.toFixed(6))
        setMessageType("success")
        setMessage(`📍 Location captured! Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
        setLoading(false)
      },
      (error) => {
        setMessageType("error")
        if (error.code === error.PERMISSION_DENIED) {
          setMessage("⚠️ Location permission denied. Please enable location in your browser settings.")
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setMessage("⚠️ Location information is unavailable.")
        } else {
          setMessage("⚠️ Failed to get location. Please try again or enter manually.")
        }
        setLoading(false)
      }
    )
  }

  // Add store to Firestore
  const handleAddStore = async () => {
    if (!shopName || !area || !pincode || !latitude || !longitude) {
      setMessageType("error")
      setMessage("⚠️ Please fill all fields including location")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const user = auth.currentUser
      if (!user) {
        navigate("/vendor/login")
        return
      }

      // Verify pincode format
      if (!/^\d{6}$/.test(pincode)) {
        setMessageType("error")
        setMessage("⚠️ Pincode must be 6 digits")
        setLoading(false)
        return
      }

      await addDoc(collection(db, "stores"), {
        name: shopName,
        area: area,
        pincode: pincode,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        ownerUid: user.uid,
        ownerEmail: user.email,
        verified: true,
        createdAt: new Date().toISOString(),
      })

      setMessageType("success")
      setMessage("✅ Store registered successfully! Redirecting...")
      
      setTimeout(() => {
        navigate("/vendor/dashboard")
      }, 2000)
    } catch (error) {
      setMessageType("error")
      setMessage(`⚠️ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F9FAFB",
      padding: "40px 20px",
      fontFamily: FONT,
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: DARK, margin: 0, marginBottom: 8 }}>
            🏪 Register Your Store
          </h1>
          <p style={{ fontSize: 15, color: GRAY, margin: 0 }}>
            Add your store location using GPS or manually
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            background: messageType === "success" ? "#ECFDF5" : "#FEE2E2",
            color: messageType === "success" ? GREEN : RED,
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 600,
            borderLeft: `4px solid ${messageType === "success" ? GREEN : RED}`,
          }}>
            {message}
          </div>
        )}

        {/* MAIN CARD */}
        <div style={{
          background: WHITE,
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          border: "1px solid #E5E7EB",
        }}>
          
          {/* SHOP NAME */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              Shop Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Sharma Kirana Store"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1.5px solid #E5E7EB",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                fontFamily: FONT,
                color: DARK,
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = BLUE}
              onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
            />
          </div>

          {/* AREA */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              Area/Locality *
            </label>
            <input
              type="text"
              placeholder="e.g. Banjara Hills"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1.5px solid #E5E7EB",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                fontFamily: FONT,
                color: DARK,
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = BLUE}
              onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
            />
          </div>

          {/* PINCODE */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              Pincode *
            </label>
            <input
              type="text"
              placeholder="e.g. 500034"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.slice(0, 6))}
              maxLength="6"
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1.5px solid #E5E7EB",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                fontFamily: FONT,
                color: DARK,
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = BLUE}
              onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
            />
          </div>

          {/* LOCATION SECTION */}
          <div style={{ marginBottom: 24, padding: "16px", background: "#F0F9FF", borderRadius: 12, border: "1.5px solid #BAE6FD" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: BLUE, margin: "0 0 12px 0" }}>
              📍 Location Details
            </h3>

            {!locationRequested && !manualMode ? (
              <button onClick={handleGetLocation} disabled={loading} style={{
                width: "100%",
                background: GREEN,
                color: WHITE,
                border: "none",
                borderRadius: 10,
                padding: "14px 16px",
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: FONT,
                marginBottom: 12,
                opacity: loading ? 0.7 : 1,
              }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#059669")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = GREEN)}
              >
                {loading ? "⏳ Getting location..." : "📍 Use My Current Location"}
              </button>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: GRAY, display: "block", marginBottom: 4 }}>
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 17.3850"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      fontFamily: FONT,
                      color: DARK,
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: GRAY, display: "block", marginBottom: 4 }}>
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 78.4867"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      fontFamily: FONT,
                      color: DARK,
                      outline: "none",
                    }}
                  />
                </div>
              </>
            )}

            {!manualMode && (
              <button onClick={() => setManualMode(true)} style={{
                width: "100%",
                background: "transparent",
                color: BLUE,
                border: "1.5px solid #BAE6FD",
                borderRadius: 8,
                padding: "10px 12px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: FONT,
              }}>
                ✏️ Manual Entry
              </button>
            )}
          </div>

          {/* ADD STORE BUTTON */}
          <button onClick={handleAddStore} disabled={loading || !latitude || !longitude} style={{
            width: "100%",
            background: BLUE,
            color: WHITE,
            border: "none",
            borderRadius: 10,
            padding: "14px 16px",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading || !latitude || !longitude ? "not-allowed" : "pointer",
            fontFamily: FONT,
            opacity: loading || !latitude || !longitude ? 0.6 : 1,
            marginBottom: 12,
          }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = BLUE2)}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = BLUE)}
          >
            {loading ? "⏳ Registering..." : "✅ Register Store"}
          </button>

          {/* CANCEL BUTTON */}
          <button onClick={() => navigate("/vendor/dashboard")} style={{
            width: "100%",
            background: "#E5E7EB",
            color: DARK,
            border: "none",
            borderRadius: 10,
            padding: "12px 16px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: FONT,
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#D1D5DB"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#E5E7EB"}
          >
            Cancel
          </button>
        </div>

        {/* INFO SECTION */}
        <div style={{
          marginTop: 24,
          padding: "16px",
          background: "#FEF3C7",
          borderRadius: 12,
          border: "1.5px solid #FCD34D",
        }}>
          <p style={{ margin: 0, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
            💡 <strong>Tip:</strong> Enable location access for accurate GPS coordinates. This helps customers find you on the map!
          </p>
        </div>
      </div>
    </div>
  )
}
