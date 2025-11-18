import React from "react";
export default function Toast({title, body}){
  return <div className="toast"><strong>{title}</strong><div style={{fontWeight:400, fontSize:13}}>{body}</div></div>
}
