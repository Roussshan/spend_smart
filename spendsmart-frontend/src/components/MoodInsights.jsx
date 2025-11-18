import React, {useEffect, useState} from "react";
import axios from "axios";

export default function MoodInsights({api, transactions}){
  const [data, setData] = useState(null);

  useEffect(()=> {
    const load = async ()=>{
      try {
        const res = await axios.get(`${api}/api/analytics/mood-patterns`);
        setData(res.data);
      } catch(e){
        console.error(e);
      }
    };
    load();
  }, [transactions]);

  if (!data) return null;
  const pct = Math.round(data.percentMoreWhenStressed || 0);

  return (
    <div style={{marginTop:12}}>
      <h4>Mood Insights</h4>
      <div className="card" style={{display:'flex', gap:12, alignItems:'center'}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700}}>Spending while stressed</div>
          <div style={{marginTop:6}}>You spend <strong>{pct}% {pct>0 ? 'more' : 'less'}</strong> per transaction when stressed vs your average.</div>
          {pct>20 && <div style={{marginTop:8, color:'#ffdede'}}>Tip: set a 1-click saver or pause notifications to avoid impulse buys</div>}
        </div>
        <div style={{width:120, height:80, borderRadius:12, background:'linear-gradient(135deg,#ff7a7a,#ffd166)', display:'flex', justifyContent:'center', alignItems:'center', fontWeight:900, color:'#021'}}>
          ₹{Math.round((data.totals?.Stressed || 0))}
        </div>
      </div>
    </div>
  );
}
