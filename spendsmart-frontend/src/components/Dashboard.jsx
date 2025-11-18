// Dashboard.jsx
import React, {useEffect, useState} from "react";
import axios from "axios";
import MoodInsights from "./MoodInsights";
import ForecastChart from "./ForecastChart";

export default function Dashboard({
  api,
  transactions = [],
  onEdit,      // optional callback(tx) - parent can handle editing
  onDelete,    // optional callback(id) - parent can handle deletion
  onViewAll    // optional callback() - parent can handle "view all"
}){
  const [forecast, setForecast] = useState([]);
  const [avgDaily, setAvgDaily] = useState(0);
  const [warnings, setWarnings] = useState([]);

  useEffect(()=> {
    const load = async ()=> {
      try {
        const res = await axios.get(`${api}/api/analytics/forecast?days=30&balance=20000`);
        setForecast(res.data.forecast || []);
        setAvgDaily(res.data.avgDaily || 0);
        setWarnings(res.data.warnings || []);
      } catch(e){
        console.error(e);
      }
    };
    load();
  },[transactions, api]);

  const baseBalance = 20000;
  const totalSpent = (transactions || []).reduce((s, t) => s + Number((t && t.amount) || 0), 0);
  const balanceNowNum = baseBalance - totalSpent;

  // --- handlers for transaction buttons ---
  async function handleDelete(tx) {
    if (!tx || !(tx._id || tx.id)) return;
    if (!confirm("Delete this transaction?")) return;

    // If parent provided onDelete, use it
    if (typeof onDelete === "function") {
      try { await onDelete(tx._id || tx.id); return; } catch(e){ console.error(e); }
    }

    // Otherwise call backend directly
    try {
      await axios.delete(`${api}/api/transactions/${tx._id || tx.id}`);
      // basic UI refresh: reload page or ask parent to refresh records
      window.location.reload();
    } catch (err) {
      console.error("delete failed", err);
      alert("Failed to delete transaction");
    }
  }

  async function handleEdit(tx) {
    if (!tx || !(tx._id || tx.id)) return;

    // Allow parent to handle editing
    if (typeof onEdit === "function") {
      try { await onEdit(tx); return; } catch(e){ console.error(e); }
    }

    // Simple prompt-based inline edit (safe fallback)
    try {
      const newAmount = prompt("Amount (₹):", tx.amount ?? "");
      if (newAmount === null) return; // cancelled
      const newNote = prompt("Note:", tx.note ?? "");
      if (newNote === null) return;

      const updatePayload = {
        ...tx,
        amount: Number(newAmount),
        note: newNote
      };

      // Try PUT; if your API uses PATCH/POST adapt accordingly
      await axios.put(`${api}/api/transactions/${tx._id || tx.id}`, updatePayload);
      window.location.reload();
    } catch (err) {
      console.error("edit failed", err);
      alert("Failed to update transaction");
    }
  }

  function handleViewAll() {
    if (typeof onViewAll === "function") {
      return onViewAll();
    }
    // default navigation
    window.location.href = "/transactions";
  }

  return (
    <div className="card dashboard-card" style={{marginTop:12}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3>Dashboard</h3>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:12, color:'#cfe7ff'}}>Estimated balance</div>
          <div style={{fontSize:22, fontWeight:800}}>₹{Math.max(0, balanceNowNum).toFixed(2)}</div>
        </div>
      </div>

      <div className="cards" style={{marginTop:12}}>
        <div className="small-card">
          <div>Avg daily spend</div>
          <div style={{fontSize:18, marginTop:8}}>₹{Number(avgDaily || 0).toFixed(2)}</div>
        </div>
        <div className="small-card" style={{background:'linear-gradient(135deg,#7afcff,#7ab4ff)'}}>
          <div>30-day projection</div>
          <div style={{fontSize:18, marginTop:8}}>
            ₹{forecast.length && typeof forecast[forecast.length-1].projected === 'number' ? forecast[forecast.length-1].projected.toFixed(0) : '—'}
          </div>
        </div>
      </div>

      {warnings && warnings.length > 0 && <div style={{marginTop:12, color:'#ffdede'}}><strong>Warnings:</strong> {warnings.map(w => (typeof w === 'string' ? w : (w && w.message) || JSON.stringify(w))).join('; ')}</div>}

      <div style={{marginTop:12}}>
        <h4>Forecast</h4>
        <div style={{height:220}}>
          <ForecastChart data={forecast || []} />
        </div>
      </div>

      <MoodInsights api={api} transactions={transactions} />

      <div className="tx-list" style={{marginTop:12}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h4 style={{margin:0}}>Recent transactions</h4>
          <div>
            <button className="btn btn-outline" onClick={handleViewAll} title="View all transactions">View All</button>
          </div>
        </div>

        {(transactions || []).map((tx, idx)=> {
          const key = tx && (tx._id || tx.id) ? (tx._id || tx.id) : `tx-${idx}`;
          return (
            <div key={key} className="tx-item animated-row">
              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                <div className="badge">{tx && tx.mood ? tx.mood : '—'}</div>
                <div>
                  <div style={{fontWeight:700}}>{tx.category}</div>
                  <div style={{fontSize:12, color:'#cfe7ff'}}>{tx && tx.date ? new Date(tx.date).toLocaleString() : ''}</div>
                </div>
              </div>

              <div style={{textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
                <div style={{fontWeight:800}}>₹{tx && typeof tx.amount !== 'undefined' ? Number(tx.amount).toFixed(2) : '0.00'}</div>
                <div style={{fontSize:12}}>{tx && tx.note}</div>

                 {/* Buttons row */}
                   <div style={{display:'flex', gap:8, marginTop:8}}>
                   <button
                     type="button"
                     className="tx-btn tx-edit"
                     onMouseDown={() => console.log('mouseDown edit', tx && (tx._id||tx.id))}
                     onClick={() => { console.log('click edit', tx && (tx._id||tx.id)); handleEdit(tx); }}
                     aria-label="Edit transaction"
                   >
                    ✏️ Edit
                   </button>

                   <button
                     type="button"
                     className="tx-btn tx-delete"
                     onMouseDown={() => console.log('mouseDown delete', tx && (tx._id||tx.id))}
                     onClick={() => { console.log('click delete', tx && (tx._id||tx.id)); handleDelete(tx); }}
                     aria-label="Delete transaction"
                    >
                    🗑️ Delete
                    </button>
                   </div>
 
                 </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


