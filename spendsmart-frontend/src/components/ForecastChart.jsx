import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ForecastChart({data}) {
  const chartData = (data || []).map(d => ({ name: `D${d.day}`, value: Math.round(d.projected) }));
  if (chartData.length === 0) return <div style={{color:'#cfe7ff'}}>No forecast data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis dataKey="name" tick={{fontSize:11}} />
        <YAxis tick={{fontSize:11}} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#7ab4ff" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
