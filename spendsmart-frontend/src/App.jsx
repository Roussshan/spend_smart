import React, {useEffect, useState} from "react";
import axios from "axios";
import AddExpense from "./components/AddExpense";
import Dashboard from "./components/Dashboard";
import MapZones from "./components/MapZones";
import Toast from "./components/Toast";

const API =  "http://localhost:4000";

export default function App(){
  const [transactions, setTransactions] = useState([]);
  const [zones, setZones] = useState([]);
  const [toasts, setToasts] = useState([]);

  const fetchAll = async () => {
    try {
      const [txRes, zRes] = await Promise.all([
        axios.get(`${API}/api/transactions`),
        axios.get(`${API}/api/danger-zones`)
      ]);
      setTransactions(txRes.data.transactions || []);
      setZones(zRes.data.zones || []);
    } catch(e){
      console.error("Fetch error", e);
      pushToast({title:"Fetch error", body:"Could not load data from backend"});
    }
  };

  useEffect(()=>{ fetchAll(); }, []);

  const onAdded = (tx) => {
    setTransactions(prev => [tx, ...prev]);
    if (tx.mood === "Stressed"){
      pushToast({title:"Feeling stressed?", body:"Try 5-min meditation instead of shopping"});
    }
  };

  const pushToast = (t) => {
    const id = Date.now();
    setToasts(prev => [...prev, {...t, id}]);
    setTimeout(()=> setToasts(prev => prev.filter(x => x.id !== id)), 6000);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>SpendSmart — Prototype</h1>
        <p className="sub">Spend smarter with mood, location & forecast insights</p>
      </header>

      <main className="main-grid">
        <div className="left-col">
          <AddExpense api={API} onAdded={onAdded} pushToast={pushToast} />
          <Dashboard api={API} transactions={transactions} />
        </div>

        {/* <div className="right-col">
          <MapZones api={API} zones={zones} pushToast={pushToast} />
        </div> */}
      </main>

      <div className="toast-wrapper">
        {toasts.map(t => <Toast key={t.id} title={t.title} body={t.body} />)}
      </div>
    </div>
  );
}
