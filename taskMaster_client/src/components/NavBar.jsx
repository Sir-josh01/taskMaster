import React, {useState} from 'react'

const NavBar = ({user, handleLogout, handleDeleteAccount}) => {
   const [showSettings, setShowSettings] = useState(false);
  return (
    <>
       <div className="user-bar">
            <p>Logged in as: <strong>{user?.name || "Guest"}</strong></p>

              <div className="user-actions">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                
                {/* Settings Toggle */}
                <button 
                  className="settings-toggle" 
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? "✖" : "⚙️"}
                </button>
              </div>

              {/* Hidden Settings Panel */}
              {showSettings && (
                <div className="settings-panel">
                  <h4>Account Settings</h4>
                  <p className="danger-text">Warning: This action is permanent.</p>
                  <button className="delete-acc-btn" onClick={handleDeleteAccount}>
                    Delete My Account
                  </button>
                </div>
              )}
          </div>
    </>
  )
}

export default NavBar