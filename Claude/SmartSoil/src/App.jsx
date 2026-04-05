import { useState, useCallback, useEffect } from "react";
import AnalyseTab from "./AnalyseTab";
import HistoryTab from "./HistoryTab";
import "./index.css";

// Vite will automatically find useLocalStorage.js and getRegionData.js
import useLocalStorage from "./services/useLocalStorage";
import getRegionData from "./services/getRegionData";


function App() {
  const TABS = [
    { id: "analyse", label: "Diagnose & Solve", icon: "🌿" },
    { id: "history", label: "History",          icon: "📋" },
  ];
    const [activeTab, setActiveTab] = useState("analyse");
    const [history, setHistory] = useLocalStorage("ss_history", []);
    const [location, setLocation] = useLocalStorage("ss_geo", null);
    const [geoLoading, setGeoLoading] = useState(false);
  
   const fetchLocation = useCallback(() => {
  if (!navigator.geolocation) {
    alert("Your browser does not support location.");
    return;
  }
  
  setGeoLoading(true);
  
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      // Success!
      try {
        const d = await getRegionData(pos.coords.latitude, pos.coords.longitude);
        setLocation(d);
        alert("Location updated to: " + d.region);
      } catch (e) {
        alert("Error getting region data: " + e.message);
      }
      setGeoLoading(false);
    },
    (error) => {
      // Error handling with alerts
      setGeoLoading(false);
      if (error.code === 1) {
        alert("PERMISSION_DENIED: Please click the 🔒 icon in your address bar and set Location to 'Allow'.");
      } else if (error.code === 2) {
        alert("POSITION_UNAVAILABLE: Your network or device can't find your GPS coordinates.");
      } else if (error.code === 3) {
        alert("TIMEOUT: It took too long to find you. Try again.");
      }
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}, [setLocation]);
  
    return (
      <>
        <div className="app-wrapper">
  
          {/* Header */}
          <header className="header">
            <div className="header-brand">
              🌱 Smart<em>Soil</em>
            </div>
            <button className="geo-badge" onClick={fetchLocation} disabled={geoLoading}>
              <span className="geo-dot" />
              {geoLoading ? "Locating…" : location ? location.region : "Enable Location"}
            </button>
          </header>
  
          {/* Nav */}
          <nav className="nav-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`nav-tab${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
  
          {/* Main */}
          <main className="main">
  
            {/* Location banner */}
            {location && (
              <div className="location-banner">
                <div className="loc-icon">🗺️</div>
                <div style={{ flex: 1 }}>
                  <div className="loc-title">{location.region} · {location.climate}</div>
                  <div className="loc-sub">{location.avg_temp} avg · {location.humidity} humidity · Rainy season: {location.rainy_season}</div>
                  <div className="loc-tags">
                    <span className="loc-tag">🌱 {location.soil_type}</span>
                    {location.common_diseases.map(d => <span key={d} className="loc-tag">⚠️ {d}</span>)}
                  </div>
                  {location.advisories && (
                    <div className="loc-advisory">ℹ️ {location.advisories[0]}</div>
                  )}
                </div>
              </div>
            )}
  
            {activeTab === "analyse" && <AnalyseTab history={history} setHistory={setHistory} location={location} />}
            {activeTab === "history" && <HistoryTab history={history} setHistory={setHistory} />}
          </main>
        </div>
      </>
    );
  }


export default App
