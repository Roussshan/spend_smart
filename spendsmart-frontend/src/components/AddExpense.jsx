import React, {useState} from "react";
import axios from "axios";

export default function AddExpense({api, onAdded, pushToast}){
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [mood, setMood] = useState("Neutral");
  const [note, setNote] = useState("");

  const submit = async () => {
    if (!amount) return pushToast({title:"Validation", body:"Enter an amount"});
    let loc = null;
    if (navigator.geolocation){
      try {
        loc = await new Promise(res => navigator.geolocation.getCurrentPosition(p => res({lat:p.coords.latitude, lon:p.coords.longitude}), ()=>res(null)));
      } catch(e){ loc = null; }
    }

    try {
      const payload = { amount: Number(amount), category, mood, note, location: loc };
      console.log("Submitting tx", payload);
      const r = await axios.post(`${api}/api/transactions`, payload);
      onAdded(r.data.transaction || r.data);
      setAmount(""); setNote("");
      pushToast({title:"Saved", body:`Added ₹${payload.amount}`});
    } catch(e){
      console.error(e);
      pushToast({title:"Error", body:"Could not save transaction"});
    }
  };

  return (
    <div className="card">
      <h3>Add Expense</h3>
      <div className="add-form" style={{marginTop:10}}>
        <input type="number" placeholder="Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <input placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
        <select value={mood} onChange={e=>setMood(e.target.value)}>
          <option>Neutral</option>
          <option>Stressed</option>
          <option>Happy</option>
          <option>Bored</option>
        </select>
        <input placeholder="Note" value={note} onChange={e=>setNote(e.target.value)} />
        <button className="btn" onClick={submit}>Add</button>
      </div>
    </div>
  );
}
