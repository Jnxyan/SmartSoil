import { useState } from "react";

function HistoryTab({ history, setHistory }) {
  return (
    <div>
      <h2 className="section-heading">Analysis History</h2>
      <p className="section-sub">Your saved diagnoses and treatment plans.</p>

      {history.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty">
              <div className="empty-icon">🌿</div>
              <div className="empty-title">No history yet</div>
              <div className="empty-sub">Run an analysis to see your records here.</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.8rem" }}>
            <button className="btn btn-sm btn-secondary" onClick={() => setHistory([])}>🗑 Clear All</button>
          </div>
          <div className="history-list">
            {history.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-icon">🌾</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "0.88rem" }}>{item.plant}</strong>
                    <span className="tag tag-green">analysis</span>
                  </div>
                  <div className="history-meta">{item.date}</div>
                  <div className="history-sum">{item.summary}</div>
                </div>
                <button className="history-del" onClick={() => setHistory(h => h.filter(x => x.id !== item.id))}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HistoryTab;