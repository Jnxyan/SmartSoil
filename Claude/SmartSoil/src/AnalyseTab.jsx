import { useState, useRef } from "react";
import { PLANTS } from "./data/PLANTS";
import useLocalStorage  from "./services/useLocalStorage";
import scanLeafImage from "./services/scanLeafImage";
import getRegionData from "./services/getRegionData";
import generateSolution from "./services/generateSolution";
import soilColor from "./services/soilColor";



function AnalyseTab({ history, setHistory, location }) {
  const fileRef = useRef();

  // Plant
  const [selectedPlant, setSelectedPlant] = useLocalStorage("ss_plant", null);
  const [customName, setCustomName] = useState("");

  // Scan
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useLocalStorage("ss_scan", null);

  // Soil
  const [soil, setSoil] = useLocalStorage("ss_soil", { ph: 6.5, moisture: 55, nitrogen: 35, phosphorus: 25, potassium: 30 });

  // Budget
  const [budget, setBudget] = useLocalStorage("ss_budget", 50);

  // Result
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedTreat, setExpandedTreat] = useState(null);

  const handleFile = f => {
    if (!f || !f.type.startsWith("image/")) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
    setScanResult(null);
    setResult(null);
  };

  const runScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const r = await scanLeafImage(image);
      setScanResult(r);
    } catch { setScanResult(null); }
    setScanning(false);
  };

  const plantReady = selectedPlant && (selectedPlant !== "other" || customName.trim());
  const missing = [];
  if (!plantReady) missing.push("Plant type");
  if (!budget || budget < 5) missing.push("Budget (min RM 5)");

  const handleGenerate = async () => {
    if (!plantReady) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const plant = { id: selectedPlant, customName };
      const r = await generateSolution({ plant, location, soil, scanResult, budget });
      setResult(r);
      setHistory(h => [{
        id: Date.now(),
        type: "analyse",
        date: new Date().toLocaleString(),
        plant: r.plantName,
        summary: r.summary,
        result: r,
      }, ...h]);
    } catch (e) {
      setError("Failed to generate solution. Check your backend.");
    }
    setLoading(false);
  };

  const steps = [
    { label: "Plant", done: !!plantReady },
    { label: "Scan", done: !!scanResult },
    { label: "Soil", done: true },
    { label: "Budget", done: budget >= 5 },
    { label: "Solution", done: !!result },
  ];

  return (
    <div>
      <h2 className="section-heading">Diagnose & Solve</h2>
      <p className="section-sub">
        Fill in your plant details, scan a leaf, enter soil readings and your budget —
        then generate a tailored, budget-ranked treatment plan.
      </p>

      {/* Progress Steps */}
      <div className="steps-bar">
        {steps.map((s, i) => (
          <div key={s.label} className="step-item">
            {i > 0 && <div className={`step-connector${steps[i - 1].done ? " done" : ""}`} />}
            <div className={`step-circle${s.done ? " done" : i === steps.findIndex(x => !x.done) ? " active" : ""}`}>
              {s.done ? "✓" : i + 1}
            </div>
            <span className={`step-label${s.done ? " done" : i === steps.findIndex(x => !x.done) ? " active" : ""}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ① Plant Type */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(107,143,71,0.12)" }}>🌿</div>
          <div>
            <div className="card-title">① Select Plant Type</div>
            <div className="card-subtitle">Choose your crop or tree</div>
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
            <div className="custom-plant-row">
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

      {/* ② Leaf Scan */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(181,84,30,0.1)" }}>🔬</div>
          <div>
            <div className="card-title">② Leaf Scanner <span style={{ fontFamily: "DM Sans", fontWeight: 400, fontSize: "0.8rem", color: "#907a68" }}>(optional but recommended)</span></div>
            <div className="card-subtitle">Upload a photo of the affected leaf</div>
          </div>
        </div>
        <div className="card-body">
          {preview ? (
            <>
              <div className="preview-wrap">
                <img src={preview} alt="Leaf" className="preview-img" />
                <button className="preview-clear" onClick={() => { setPreview(null); setImage(null); setScanResult(null); }}>✕</button>
              </div>
              {scanResult ? (
                <div className="scan-status done">
                  ✅ <strong>{scanResult.disease}</strong> — {Math.round(scanResult.confidence * 100)}% confidence · {scanResult.severity} severity
                </div>
              ) : (
                <div className="scan-status pending">
                  📷 Image loaded — click below to run disease scan
                </div>
              )}
              {!scanResult && (
                <button className="btn btn-outline" style={{ marginTop: 10, width: "100%", justifyContent: "center" }} onClick={runScan} disabled={scanning}>
                  {scanning ? <><span className="spinner" style={{ borderTopColor: "var(--moss)" }} /> Scanning…</> : "🔍 Scan for Disease"}
                </button>
              )}
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
              <div className="upload-hint">JPG, PNG, HEIC, WebP supported</div>
              <input type="file" ref={fileRef} className="upload-input" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}
        </div>
      </div>

      {/* ③ Soil */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(92,61,46,0.1)" }}>🧪</div>
          <div>
            <div className="card-title">③ Soil Readings</div>
            <div className="card-subtitle">Adjust sliders to match your soil test</div>
          </div>
        </div>
        <div className="card-body">
          <div className="soil-grid">
            {[
              { key: "ph",         label: "pH Level",      min: 0,   max: 14,  step: 0.1, unit: "" },
              { key: "moisture",   label: "Moisture",       min: 0,   max: 100, step: 1,   unit: "%" },
              { key: "nitrogen",   label: "Nitrogen (N)",   min: 0,   max: 100, step: 1,   unit: " mg/kg" },
              { key: "phosphorus", label: "Phosphorus (P)", min: 0,   max: 100, step: 1,   unit: " mg/kg" },
              { key: "potassium",  label: "Potassium (K)",  min: 0,   max: 100, step: 1,   unit: " mg/kg" },
            ].map(({ key, label, min, max, step, unit }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div className="slider-row">
                  <input
                    type="range" min={min} max={max} step={step}
                    value={soil[key]}
                    onChange={e => setSoil({ ...soil, [key]: Number(e.target.value) })}
                  />
                  <span className="slider-val">{soil[key]}{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ④ Budget */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon" style={{ background: "rgba(201,168,76,0.15)" }}>💰</div>
          <div>
            <div className="card-title">④ Treatment Budget</div>
            <div className="card-subtitle">Solutions will be ranked within this limit</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Maximum Budget</label>
            <div className="slider-row">
              <input type="range" min={5} max={200} step={5} value={budget} onChange={e => setBudget(Number(e.target.value))} />
              <span className="slider-val">RM {budget}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      {error && <div style={{ color: "var(--rust)", fontSize: "0.85rem", marginBottom: "0.6rem" }}>⚠️ {error}</div>}

      <button className="analyse-btn" onClick={handleGenerate} disabled={loading || !plantReady}>
        {loading
          ? <><span className="spinner" /> Generating personalised solution…</>
          : <>🌱 Generate Treatment Plan</>
        }
      </button>
      {missing.length > 0 && !loading && (
        <div className="missing-pills">
          {missing.map(m => <span key={m} className="missing-pill">⚠ {m} needed</span>)}
        </div>
      )}

      {/* ── RESULTS ── */}
      {result && (
        <div className="card" style={{ marginTop: "1.8rem", border: "none" }}>
          <div className="results-header">
            <div className="results-header-icon">🌾</div>
            <div>
              <div className="results-title">
                Solution Report — {result.plantName}
                {result.location && <span style={{ fontWeight: 400, fontSize: "0.85rem", opacity: 0.75 }}> · {result.location.region}</span>}
              </div>
              <div className="results-sub">Budget: RM {budget} · {result.treatments.length} treatment{result.treatments.length !== 1 ? "s" : ""} found</div>
            </div>
          </div>
          <div className="results-body">

            {/* Scan result */}
            {result.scanResult && (
              <div className="result-block danger">
                <div className="result-title">
                  ⚠️ Disease Detected
                  <span className="tag tag-rust">{result.scanResult.severity}</span>
                  <span className="tag tag-gold">{Math.round(result.scanResult.confidence * 100)}% confidence</span>
                </div>
                <div className="result-body">{result.scanResult.disease} · Affected area: {result.scanResult.affected_area}</div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${result.scanResult.confidence * 100}%` }} />
                </div>
              </div>
            )}

            {/* Soil summary */}
            <div className="result-block neutral">
              <div className="result-title">🧪 Soil Status</div>
              <div className="gauge-grid">
                {[
                  { label: "pH",    val: soil.ph,         lo: 5.5, hi: 7.5, unit: "" },
                  { label: "H₂O",  val: soil.moisture,   lo: 30,  hi: 80,  unit: "%" },
                  { label: "N",     val: soil.nitrogen,   lo: 20,  hi: 80,  unit: "" },
                  { label: "P",     val: soil.phosphorus, lo: 15,  hi: 80,  unit: "" },
                  { label: "K",     val: soil.potassium,  lo: 20,  hi: 80,  unit: "" },
                ].map(({ label, val, lo, hi, unit }) => {
                  const s = soilColor(val, lo, hi);
                  return (
                    <div key={label} className="gauge-cell">
                      <div className="gauge-val" style={{ color: s === "good" ? "var(--moss)" : s === "warn" ? "var(--gold)" : "var(--rust)" }}>
                        {val}{unit}
                      </div>
                      <div className="gauge-lbl">{label}</div>
                      <div className={`gauge-dot dot-${s}`} />
                    </div>
                  );
                })}
              </div>
              {result.soilIssues.length > 0 ? (
                <div className="result-body">Issues: {result.soilIssues.join(" · ")}</div>
              ) : (
                <div className="result-body" style={{ color: "var(--moss)" }}>✓ Soil parameters are within healthy range.</div>
              )}
            </div>

            {/* Location context */}
            {result.location && (
              <div className="result-block info">
                <div className="result-title">📍 Regional Context — {result.location.region}</div>
                <div className="result-body">
                  Climate: {result.location.climate} · Avg {result.location.avg_temp}, {result.location.humidity} humidity<br />
                  Soil type: {result.location.soil_type}<br />
                  {result.location.advisories.join(" · ")}
                </div>
              </div>
            )}

            {/* Soil tips */}
            {result.soilTips.length > 0 && (
              <div className="result-block warning">
                <div className="result-title">💡 Soil Corrections Needed</div>
                <ul style={{ paddingLeft: "1.1rem" }}>
                  {result.soilTips.map((t, i) => <li key={i} className="result-body">{t}</li>)}
                </ul>
              </div>
            )}

            {/* Treatments */}
            <div className="section-divider" />
            <div className="result-title" style={{ marginBottom: "0.8rem", fontSize: "1rem" }}>
              💊 Budget-Ranked Treatments
              <span className="tag tag-gold">Within RM {budget}</span>
            </div>

            {result.treatments.length === 0 ? (
              <div className="no-budget">
                <div className="no-budget-icon">💸</div>
                <div className="no-budget-title">No treatments fit within RM {budget}</div>
                <div className="no-budget-sub">Try raising your budget above RM 6.</div>
              </div>
            ) : (
              <div className="treatment-list">
                {result.treatments.map((t, i) => (
                  <div
                    key={t.name}
                    className={`treatment-card${expandedTreat === t.name ? " selected" : ""}`}
                    onClick={() => setExpandedTreat(expandedTreat === t.name ? null : t.name)}
                  >
                    <div className={`rank-badge rank-${i < 3 ? i + 1 : "n"}`}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div className="treat-name">{t.name}</div>
                      <div className="treat-cost">RM {t.cost} · {t.effectiveness}% effectiveness</div>
                      {expandedTreat === t.name && <div className="treat-desc">{t.desc}</div>}
                      <div className="treat-tags">
                        {t.tags.map(tag => (
                          <span key={tag} className={`treat-tag${tag === "Organic" || tag === "Organic-friendly" ? " organic" : tag === "High potency" || tag === "Broad-spectrum" ? " high" : ""}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyseTab;