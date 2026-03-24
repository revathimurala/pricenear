import { useState } from "react"

const BLUE = "#2563EB"
const BLUE2 = "#1D4ED8"
const GREEN = "#10B981"
const DARK = "#111827"
const GRAY = "#6B7280"
const WHITE = "#FFFFFF"
const FONT = "'Sora','Segoe UI',sans-serif"

export default function PincodeSearch() {
  const [pincode, setPincode] = useState("")
  const [savedPincode, setSavedPincode] = useState(
    localStorage.getItem("searchPincode") || ""
  )
  const [message, setMessage] = useState("")

  const handleSetLocation = () => {
    if (!pincode) {
      setMessage("⚠️ Please enter a pincode")
      return
    }

    if (!/^\d{6}$/.test(pincode)) {
      setMessage("⚠️ Pincode must be exactly 6 digits")
      return
    }

    // Save to localStorage
    localStorage.setItem("searchPincode", pincode)
    setSavedPincode(pincode)
    setPincode("")
    setMessage("")
  }

  const handleClearLocation = () => {
    localStorage.removeItem("searchPincode")
    setSavedPincode("")
    setPincode("")
    setMessage("")
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setMessage("⚠️ Geolocation not supported in your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        // For demo: show message (In real app, convert lat/lng to pincode via API)
        setMessage(`📍 Your location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      },
      (error) => {
        setMessage("⚠️ Unable to access location. Please enter pincode manually.")
      }
    )
  }

  return (
    <div style={{
      padding: "20px",
      background: "white",
      borderRadius: 14,
      border: "1.5px solid #E5E7EB",
      marginBottom: 24,
    }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: DARK, margin: 0, marginBottom: 4 }}>
          📍 Find Stores Near You
        </h2>
        <p style={{ fontSize: 13, color: GRAY, margin: 0 }}>
          Enter your pincode to see prices from stores in your area
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div style={{
          background: message.includes("successfully") || message.includes("location") ? "#ECFDF5" : "#FEE2E2",
          color: message.includes("successfully") || message.includes("location") ? GREEN : "#DC2626",
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
          borderLeft: `4px solid ${message.includes("successfully") || message.includes("location") ? GREEN : "#DC2626"}`,
        }}>
          {message}
        </div>
      )}

      {/* PINCODE INPUT */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          fontSize: 12,
          fontWeight: 700,
          color: GRAY,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          display: "block",
          marginBottom: 8,
        }}>
          Enter Your Pincode
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="e.g. 500034"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.slice(0, 6))}
            maxLength="6"
            style={{
              flex: 1,
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
            onKeyPress={(e) => e.key === "Enter" && handleSetLocation()}
          />
          <button onClick={handleSetLocation} style={{
            background: BLUE,
            color: WHITE,
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: FONT,
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = BLUE2}
            onMouseLeave={(e) => e.currentTarget.style.background = BLUE}
          >
            Search
          </button>
        </div>
      </div>

      {/* CURRENT LOCATION BUTTON */}
      <button onClick={handleUseLocation} style={{
        width: "100%",
        background: "transparent",
        color: BLUE,
        border: "1.5px solid #DBEAFE",
        borderRadius: 10,
        padding: "12px 14px",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        fontFamily: FONT,
        marginBottom: 12,
        transition: "all 0.15s",
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#EFF6FF"
          e.currentTarget.style.borderColor = BLUE
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.borderColor = "#DBEAFE"
        }}
      >
        📍 Use My Current Location
      </button>

      {/* SAVED LOCATION DISPLAY */}
      {savedPincode && (
        <div style={{
          background: "#F0F9FF",
          border: "1.5px solid #BAE6FD",
          borderRadius: 10,
          padding: "14px",
          marginTop: 16,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: BLUE,
            }}>
              ✅ Searching in pincode: <strong>{savedPincode}</strong>
            </span>
            <button onClick={handleClearLocation} style={{
              background: "transparent",
              color: "#EF4444",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT,
            }}>
              ✕ Clear
            </button>
          </div>
          <p style={{
            fontSize: 12,
            color: GRAY,
            margin: 0,
          }}>
            Now showing stores and prices from your selected area
          </p>
        </div>
      )}

      {/* INFO */}
      <div style={{
        marginTop: 12,
        padding: "12px",
        background: "#FEF3C7",
        borderRadius: 8,
        border: "1px solid #FCD34D",
      }}>
        <p style={{
          margin: 0,
          fontSize: 12,
          color: "#92400E",
          fontWeight: 500,
        }}>
          💡 <strong>Tip:</strong> Stores in your pincode will appear on the map and in search results!
        </p>
      </div>
    </div>
  )
}
