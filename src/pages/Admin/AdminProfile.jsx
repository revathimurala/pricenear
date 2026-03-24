import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const PURPLE = "#7C3AED"
const PURPLE2 = "#6D28D9"
const DARK = "#111827"
const GRAY = "#6B7280"
const WHITE = "#FFFFFF"
const FONT = "'Sora','Segoe UI',sans-serif"
const RED = "#EF4444"
const GREEN = "#10B981"

export default function AdminProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (!storedUser || storedUser.role !== "admin") {
      navigate("/admin/login")
      return
    }
    setUser(storedUser)
    setFormData(storedUser)
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")
    try {
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(formData))
      setUser(formData)
      setIsEditing(false)
      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: "#F9FAFB",
      paddingTop: 40,
      paddingBottom: 40,
      fontFamily: FONT,
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: DARK, margin: 0, marginBottom: 8 }}>
            Admin Profile
          </h1>
          <p style={{ fontSize: 15, color: GRAY, margin: 0 }}>
            Manage your admin account
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            background: message.includes("successfully") ? "#ECFDF5" : "#FEE2E2",
            color: message.includes("successfully") ? GREEN : RED,
            padding: "12px 16px",
            borderRadius: 10,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 600,
            borderLeft: `4px solid ${message.includes("successfully") ? GREEN : RED}`,
          }}>
            {message}
          </div>
        )}

        {/* PROFILE CARD */}
        <div style={{
          background: WHITE,
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
          border: "1px solid #E5E7EB",
        }}>
          
          {/* AVATAR */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 80,
              background: PURPLE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              margin: "0 auto",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}>
              🛡️
            </div>
          </div>

          {!isEditing ? (
            <>
              {/* DISPLAY MODE */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Admin Name
                </label>
                <p style={{ fontSize: 18, fontWeight: 600, color: DARK, margin: "8px 0 0 0" }}>
                  {user.name || "Not provided"}
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Email
                </label>
                <p style={{ fontSize: 18, fontWeight: 600, color: DARK, margin: "8px 0 0 0" }}>
                  {user.email}
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Role
                </label>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: WHITE,
                  background: PURPLE,
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 20,
                  marginTop: 8,
                  textTransform: "capitalize",
                }}>
                  {user.role || "Admin"}
                </div>
              </div>

              {user.createdAt && (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Joined
                  </label>
                  <p style={{ fontSize: 14, color: DARK, margin: "8px 0 0 0" }}>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              <button onClick={() => setIsEditing(true)} style={{
                width: "100%",
                background: PURPLE,
                color: WHITE,
                border: "none",
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: FONT,
                marginTop: 16,
              }}
                onMouseEnter={e => e.currentTarget.style.background = PURPLE2}
                onMouseLeave={e => e.currentTarget.style.background = PURPLE}
              >
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            <>
              {/* EDIT MODE */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Admin Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 14,
                    fontFamily: FONT,
                    color: DARK,
                    marginTop: 8,
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = PURPLE}
                  onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  disabled
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 14,
                    fontFamily: FONT,
                    color: GRAY,
                    background: "#F9FAFB",
                    marginTop: 8,
                    outline: "none",
                    cursor: "not-allowed",
                  }}
                />
                <p style={{ fontSize: 12, color: GRAY, margin: "6px 0 0 0" }}>
                  Email cannot be changed
                </p>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleSave} disabled={loading} style={{
                  flex: 1,
                  background: GREEN,
                  color: WHITE,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: FONT,
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = "#059669")}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background = GREEN)}
                >
                  💾 Save
                </button>
                <button onClick={() => {
                  setIsEditing(false)
                  setFormData(user)
                }} style={{
                  flex: 1,
                  background: "#E5E7EB",
                  color: DARK,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: FONT,
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#D1D5DB"}
                  onMouseLeave={e => e.currentTarget.style.background = "#E5E7EB"}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        {/* BACK BUTTON */}
        <button onClick={() => navigate("/admin/dashboard")} style={{
          marginTop: 24,
          width: "100%",
          background: "transparent",
          color: PURPLE,
          border: "none",
          borderRadius: 10,
          padding: "12px 16px",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: FONT,
          transition: "all 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#F3E8FF"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}
