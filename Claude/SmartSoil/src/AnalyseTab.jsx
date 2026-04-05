import { useState, useRef } from "react";
import { PLANTS } from "./data/PLANTS";
import useLocalStorage from "./services/useLocalStorage";
import scanLeafImage from "./services/scanLeafImage";
import generateSolution from "./services/generateSolution";
import soilColor from "./services/soilColor";

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 32, circ = 2 * Math.PI * r;
  const fill   = circ - (score / 100) * circ;
  const color  = score >= 70 ? "var(--leaf)" : score >= 40 ? "var(--gold)" : "var(--rust)";
  const status = score >= 70 ? "Healthy" : score >= 40 ? "Attention Needed" : "Critical";
  return (
    <div className="score-row">
      <div className="score-ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--parchment)" strokeWidth="7" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="score-ring-val">
          <span className="score-num" style={{ color }}>{score}</span>
          <span className="score-lbl">/100</span>
        </div>
      </div>
      <div>
        <div className="score-status" style={{ color }}>{status}</div>
        <div className="score-summary">
          Soil health score based on NPK, pH, moisture and detected conditions.
        </div>
      </div>
    </div>
  );
}

// ─── WEATHER CARD ─────────────────────────────────────────────────────────────
function WeatherCard({ wa }) {
  if (!wa) return null;
  const cond = (wa.condition || "Unknown").toLowerCase();
  const headerClass =
    cond === "rain"   ? "rain"   :
    cond === "sunny"  ? "sunny"  :
    cond === "cloudy" ? "cloudy" : "unknown";

  const urgencyLabel =
    wa.urgency === "high"   ? "💧 Water Urgently" :
    wa.urgency === "medium" ? "💧 Water Today"    :
    wa.urgency === "low"    ? "💧 Skip Watering"  : "💧 Check Soil";

  return (
    <div className="weather-card">
      <div className={`weather-card-header ${headerClass}`}>
        <div className="weather-big-icon">{wa.icon || "🌤"}</div>
        <div style={{ flex: 1 }}>
          <div className="weather-headline">{wa.headline}</div>
          <div className="weather-condition">{wa.condition}</div>
        </div>
        <div className="weather-urgency-badge">{urgencyLabel}</div>
      </div>
      <div className="weather-card-body">
        <div className="weather-row water">
          <div className="weather-row-icon">💧</div>
          <div><strong>Watering:</strong> {wa.wateringInstruction}</div>
        </div>
        <div className="weather-row fert">
          <div className="weather-row-icon">🌿</div>
          <div><strong>Fertilising:</strong> {wa.fertilisingTip}</div>
        </div>
        <div className="weather-row tip">
          <div className="weather-row-icon">💡</div>
          <div><strong>Tip:</strong> {wa.generalTip}</div>
        </div>
      </div>
    </div>
  );
}

// ─── SOIL PARAM CONFIG ────────────────────────────────────────────────────────
const SOIL_PARAMS = [
  { key: "ph",         label: "pH Level",           min: 0,   max: 14,  step: 0.1, unit: "",       lo: 5.8, hi: 6.8  },
  { key: "moisture",   label: "Moisture / Humidity", min: 0,   max: 100, step: 1,   unit: "%",      lo: 60,  hi: 80   },
  { key: "nitrogen",   label: "Nitrogen (N)",         min: 0,   max: 200, step: 1,   unit: " mg/kg", lo: 80,  hi: 120  },
  { key: "phosphorus", label: "Phosphorus (P)",       min: 0,   max: 100, step: 1,   unit: " mg/kg", lo: 40,  hi: 60   },
  { key: "potassium",  label: "Potassium (K)",        min: 0,   max: 400, step: 5,   unit: " mg/kg", lo: 150, hi: 250  },
];

// ─── ANALYSE TAB ─────────────────────────────────────────────────────────────
function AnalyseTab({ history, setHistory, location }) {
  const fileRef = useRef();

  // Plant
  const [selectedPlant, setSelectedPlant] = useLocalStorage("ss_plant", null);
  const [customName, setCustomName]       = useState("");

  // Scan
  const [image, setImage]           = useState(null);
  const [preview, setPreview]       = useState(null);
  const [drag, setDrag]             = useState(false);
  const [scanning, setScanning]     = useState(false);
  const [scanResult, setScanResult] = useLocalStorage("ss_scan", null);

  // Soil
  const [soil, setSoil] = useLocalStorage("ss_soil", {
    ph: 6.5, moisture: 70, nitrogen: 100, phosphorus: 50, potassium: 200,
  });

  // Budget
  const [budget, setBudget] = useLocalStorage("ss_budget", 50);

  // Result
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState(null);
  const [expandedTreat, setExpandedTreat] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);

  // ── File handler ────────────────────────────────────────────────────────────
  const handleFile = f => {
    if (!f || !f.type.startsWith("image/")) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
    setScanResult(null);
    setResult(null);
  };

  // ── Run leaf scan ────────────────────────────────────────────────────────────
  const runScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const r = await scanLeafImage(image);
      setScanResult(r);
    } catch {
      setScanResult(null);
    }
    setScanning(false);
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const plantObj   = PLANTS.find(p => p.id === selectedPlant);
  const plantReady = selectedPlant && (selectedPlant !== "other" || customName.trim());
  const missing    = [];
  if (!plantReady) missing.push("Plant type");
  if (!budget || budget < 5) missing.push("Budget (min RM 5)");

  // ── Generate solution ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!plantReady) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const plant = {
        id:         selectedPlant,
        customName: customName.trim() || plantObj?.label || selectedPlant,
      };
      const r = await generateSolution({ plant, location, soil, scanResult, budget });
      setBackendOnline(true);
      setResult(r);
      setHistory(h => [{
        id:      Date.now(),
        type:    "analyse",
        date:    new Date().toLocaleString(),
        plant:   r.plantName || plant.customName,
        summary: r.summary || `Score: ${r.soilHealthScore}/100 · ${r.overallStatus}`,
        result:  r,
      }, ...h]);
    } catch (e) {
      setBackendOnline(false);
      setError(e.message || "Failed to reach backend. Is Spring Boot running on port 8080?");
    }
    setLoading(false);
  };

  // ── Step bar ─────────────────────────────────────────────────────────────────
  const steps = [
    { label: "Plant",  done: !!plantReady },
    { label: "Scan",   done: !!scanResult },
    { label: "Soil",   done: true },
    { label: "Budget", done: budget >= 5 },
    { label: "Result", done: !!result },
  ];
  const firstPending = steps.findIndex(s => !s.done);

  return (
    <div>
      <h2 className="section-heading">Diagnose &amp; Solve</h2>
      <p className="section-sub">
        Pick your plant, scan a leaf (optional), enter soil readings and budget. Then let our AI-powered backend analyse and recommend personalised treatments.
      </p>

      {/* ── Step Progress ── */}
      <div className="steps-bar">
        {steps.map((s, i) => (
          <div key={s.label} className="step-item">
            {i > 0 && <div className={`step-connector${steps[i - 1].done ? " done" : ""}`} />}
            <div className={`step-circle${s.done ? " done" : i === firstPending ? " active" : ""}`}>
              {s.done ? "✓" : i + 1}
            </div>
            <span className={`step-label${s.done ? " done" : i === firstPending ? " active" : ""}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Offline warning ── */}
      {!backendOnline && (
        <div className="offline-banner">
          🔴 <strong>Backend offline</strong> — Start Spring Boot in IntelliJ on port 8080, then retry.
        </div>
      )}

      {/* ── ① Plant Type ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(107,143,71,0.12)" }}>🌿</div>
          <div>
            <div className="card-title">① Select Plant Type</div>
            <div className="card-subtitle">Determines soil thresholds </div>
          </div>
        </div>
        <div className="card-body">
          <div className="plant-grid">
            {PLANTS.map(p => (
              <div
                key={p.id}
                className={`plant-chip${selectedPlant === p.id ? " selected" : ""}`}
                onClick={() => { setSelectedPlant(p.id); setScanResult(null); setResult(null); }}
              >
                <span className="plant-chip-icon">{p.icon}</span>
                {p.label}
              </div>
            ))}
          </div>
          {selectedPlant === "other" && (
            <div className="custom-plant-row" style={{ marginTop: "0.5rem" }}>
              <input
                className="form-input"
                placeholder="e.g. Sweet potato, Guava…"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── ② Leaf Scanner ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(181,84,30,0.1)" }}>🔬</div>
          <div>
            <div className="card-title">
              ② Leaf Scanner
              <span style={{ fontFamily: "DM Sans", fontWeight: 400, fontSize: "0.78rem", color: "#907a68", marginLeft: 8 }}>
                optional · port 8001
              </span>
            </div>
            <div className="card-subtitle"> Please ensure the plant in your image is visible and well-lit</div>
          </div>
        </div>
        <div className="card-body">
          {preview ? (
            <>
              <div className="preview-wrap">
                <img src={preview} alt="Leaf" className="preview-img" />
                <button
                  className="preview-clear"
                  onClick={() => { setPreview(null); setImage(null); setScanResult(null); }}
                >✕</button>
              </div>

              {scanResult ? (
                <div className="scan-status done">
                  {scanResult.severity === "Healthy" ? "✅" : "⚠️"}&nbsp;
                  <div>
                    <strong>{scanResult.disease}</strong><br />
                    {scanResult.confidence}% confidence · {scanResult.severity} severity
                  </div>
                </div>
              ) : (
                <div className="scan-status pending">
                  📷 Image ready — click below to run AI scan
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {!scanResult && (
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={runScan}
                    disabled={scanning}
                  >
                    {scanning
                      ? <><span className="spinner" style={{ borderColor: "rgba(107,143,71,0.3)", borderTopColor: "var(--moss)" }} /> Scanning…</>
                      : "🔍 Run Leaf Scan"}
                  </button>
                )}
                {scanResult && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setScanResult(null)}>
                    ↩ Re-scan
                  </button>
                )}
              </div>
            </>
          ) : (
            <div
              className={`upload-zone${drag ? " drag-over" : ""}`}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <div className="upload-icon">📷</div>
              <div className="upload-title">Drop leaf image or click to browse</div>
              <div className="upload-hint">JPG, PNG, HEIC, WebP · or skip to analyse soil only</div>
              <input
                type="file" ref={fileRef} className="upload-input" accept="image/*"
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── ③ Soil Readings ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(92,61,46,0.1)" }}>🧪</div>
          <div>
            <div className="card-title">③ Soil Readings</div>
            <div className="card-subtitle">
              Adjust the sliders to match your soil test results. 
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="soil-grid">
            {SOIL_PARAMS.map(({ key, label, min, max, step, unit, lo, hi }) => {
              const sc = soilColor(soil[key], lo, hi);
              return (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <div className="slider-row">
                    <input
                      type="range" min={min} max={max} step={step}
                      value={soil[key]}
                      onChange={e => setSoil({ ...soil, [key]: Number(e.target.value) })}
                    />
                    <span
                      className="slider-val"
                      style={{
                        background: sc === "good" ? "var(--sprout)"
                                  : sc === "warn"  ? "rgba(201,168,76,0.2)"
                                  :                  "rgba(181,84,30,0.12)",
                        color:      sc === "good" ? "var(--moss)"
                                  : sc === "warn"  ? "#7a5a10"
                                  :                  "var(--rust)",
                      }}
                    >
                      {soil[key]}{unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ④ Budget ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(201,168,76,0.15)" }}>💰</div>
          <div>
            <div className="card-title">④ Treatment Budget</div>
            <div className="card-subtitle">Backend filters &amp; ranks only treatments within this limit</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Maximum Budget</label>
            <div className="slider-row">
              <input
                type="range" min={5} max={200} step={5}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
              />
              <span className="slider-val">RM {budget}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          color: "var(--rust)", fontSize: "0.85rem", marginBottom: "0.6rem",
          padding: "10px 14px", background: "rgba(181,84,30,0.06)",
          borderRadius: "var(--radius-sm)", border: "1px solid rgba(181,84,30,0.18)",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Generate CTA ── */}
      <button
        className="analyse-btn"
        onClick={handleGenerate}
        disabled={loading || !plantReady}
      >
        {loading
          ? <><span className="spinner" /> Contacting backend…</>
          : <>🌱 Generate Treatment Plan</>}
      </button>

      {missing.length > 0 && !loading && (
        <div className="missing-pills">
          {missing.map(m => <span key={m} className="missing-pill">⚠ {m}</span>)}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          RESULTS
      ══════════════════════════════════════════════════════════════════════ */}
      {result && (
        <div className="card" style={{ marginTop: "1.8rem", border: "none" }}>

          {/* Header bar */}
          <div className="results-header">
            <span style={{ fontSize: "1.8rem" }}>🌾</span>
            <div>
              <div className="results-title">
                {result.plantName || plantObj?.label}
                {location && (
                  <span style={{ fontWeight: 400, opacity: 0.7, fontSize: "0.85rem" }}>
                    {" "}· {location.region}
                  </span>
                )}
              </div>
              <div className="results-sub">
                {result.overallStatus || "Analysis complete"} · Budget: RM {budget} ·{" "}
                {(result.treatments || []).length} treatment(s)
              </div>
            </div>
          </div>

          <div className="results-body">

            {/* ── Soil Health Score Ring ── */}
            {result.soilHealthScore !== undefined && (
              <ScoreRing score={result.soilHealthScore} />
            )}

            {/* ── 🌧 Weather Card (always shown when backend returns it) ── */}
            {result.weatherAdvice && <WeatherCard wa={result.weatherAdvice} />}

            {/* ── Soil Gauges ── */}
            <div className="result-block neutral">
              <div className="result-title">🧪 Soil Readings Summary</div>
              <div className="gauge-grid">
                {SOIL_PARAMS.map(({ label, key, lo, hi, unit }) => {
                  const s = soilColor(soil[key], lo, hi);
                  return (
                    <div key={label} className="gauge-cell">
                      <div
                        className="gauge-val"
                        style={{
                          color: s === "good" ? "var(--moss)"
                               : s === "warn"  ? "var(--gold)"
                               :                 "var(--rust)",
                        }}
                      >
                        {soil[key]}{unit}
                      </div>
                      <div className="gauge-lbl">{label}</div>
                      <div className={`gauge-dot dot-${s}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Leaf Scan Result ── */}
            {scanResult && (
              <div className={`result-block ${scanResult.severity === "Healthy" ? "success" : "danger"}`}>
                <div className="result-title">
                  {scanResult.severity === "Healthy" ? "✅" : "⚠️"} Leaf Scan —{" "}
                  {scanResult.disease}
                  <span className="tag tag-rust">{scanResult.severity}</span>
                  <span className="tag tag-gold">{scanResult.confidence}% confidence</span>
                </div>
                <div className="result-body">
                  Scan result was sent to the backend and factored into treatment recommendations.
                </div>
                {scanResult.severity !== "Healthy" && (
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${scanResult.confidence}%` }} />
                  </div>
                )}
              </div>
            )}

            {/* ── Warnings from Java ── */}
            {result.warnings?.length > 0 && (
              <div className="result-block danger">
                <div className="result-title">⚠️ Issues Detected ({result.warnings.length})</div>
                <div className="result-body">
                  <ul>{result.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
              </div>
            )}

            {/* ── Actionable Advice from Java (weather-aware) ── */}
            {result.actionableAdvice?.length > 0 && (
              <div className="result-block warning">
                <div className="result-title">💡 Actionable Advice</div>
                <div className="result-body">
                  <ul>{result.actionableAdvice.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
                 {/* ── Predictive Alert ── */}
                  {result.predictiveAlert && (
                <div className="pred-alert">
                    <div>{result.predictiveAlert}</div>
                </div>
            )}
              </div>
            )}

            

            {/* ── Location context ── */}
            {/* {location && (
              <div className="result-block info">
                <div className="result-title">📍 Regional Context — {location.region}</div>
                <div className="result-body">
                  {location.climate} · {location.avg_temp} avg · {location.humidity} humidity
                  · Rainy: {location.rainy_season}<br />
                  Soil type: {location.soil_type}<br />
                  {location.advisories?.[0]}
                </div>
              </div>
            )} */}

            {/* ── Treatments ── */}
            <div className="section-divider" />
            <div className="treat-section-title">
              💊 Budget-Ranked Treatments
              <span className="tag tag-gold">Within RM {budget}</span>
              {scanResult && scanResult.severity !== "Healthy" && (
                <span className="tag tag-rust">Includes disease fixes</span>
              )}
            </div>

            {(!result.treatments || result.treatments.length === 0) ? (
              <div className="no-treat">
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💸</div>
                <div style={{ fontWeight: 600, color: "#9a8a7a" }}>
                  No treatments found within RM {budget}
                </div>
                <div style={{ fontSize: "0.82rem", marginTop: 4 }}>
                  Raise your budget or check backend data.
                </div>
              </div>
            ) : (
              <div className="treatment-list">
                {result.treatments.map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    className={`treatment-card${expandedTreat === i ? " selected" : ""}`}
                    onClick={() => setExpandedTreat(expandedTreat === i ? null : i)}
                  >
                    <div className={`rank-badge rank-${i < 3 ? i + 1 : "n"}`}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div className="treat-name">{t.name}</div>
                      <div className="treat-meta">RM {t.cost} · {t.effectiveness}% effectiveness</div>
                      {expandedTreat === i && (
                        <div className="treat-desc">{t.desc || t.description}</div>
                      )}
                      <div className="treat-tags">
                        {(t.tags || []).map(tag => (
                          <span
                            key={tag}
                            className={`treat-tag${
                              ["Organic", "Organic-friendly"].includes(tag) ? " organic"
                              : tag === "High potency" ? " high"
                              : ""
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>{/* end results-body */}
        </div>/* end result card */
      )}
    </div>
  );
}

export default AnalyseTab;