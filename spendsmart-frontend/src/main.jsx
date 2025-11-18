// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "leaflet/dist/leaflet.css"; // ensure leaflet CSS is loaded globally
import "./styles.css"; // if you have any global css

createRoot(document.getElementById("root")).render(<App />);
