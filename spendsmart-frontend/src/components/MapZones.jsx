// src/components/MapZones.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMapEvents,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapZones.css";

/* Default Leaflet icon (CDN) */
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/* Map click handler (calls onCreate) */
function ClickHandler({ onCreate }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onCreate({ lat: Number(lat), lon: Number(lng), radius: 200, label: "Auto zone" });
    },
  });
  return null;
}

export default function MapZones() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [creating, setCreating] = useState(false);
  const [manual, setManual] = useState({ lat: "", lon: "", radius: 200, label: "" });
  const mapRef = useRef(null);

  const idOf = (z) => z._id ?? z.id ?? String(z._id ?? z.id ?? Math.random());

  /* load zones */
  const loadZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/danger-zones`);
      setZones(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load zones from server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => { loadZones(); }, [loadZones]);

  /* fit map to zones */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || zones.length === 0) return;
    try {
      const latlngs = zones.map((z) => [Number(z.lat), Number(z.lon)]);
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds.pad(0.25), { animate: true, duration: 0.5 });
    } catch (e) {
      /* ignore */
    }
  }, [zones]);

  /* Create zone (manual or from map) */
  async function createZone(zone) {
    setCreating(true);
    const payload = {
      lat: Number(zone.lat),
      lon: Number(zone.lon),
      radius: Number(zone.radius ?? 200),
      label: String(zone.label ?? "zone"),
    };
    // optimistic UI
    const tempId = `temp-${Date.now()}`;
    const temp = { ...payload, _id: tempId, createdAt: new Date().toISOString() };
    setZones((s) => [temp, ...s]);

    try {
      const res = await axios.post(`${API}/api/danger-zones`, payload);
      setZones((s) => s.map((z) => (idOf(z) === tempId ? res.data : z)));
      setManual({ lat: "", lon: "", radius: 200, label: "" });
    } catch (err) {
      console.error("createZone failed", err);
      setZones((s) => s.filter((z) => idOf(z) !== tempId));
      alert("Failed to save zone to server");
    } finally {
      setCreating(false);
    }
  }

  /* Delete zone */
  async function deleteZone(id) {
    if (!confirm("Remove this danger zone?")) return;
    const prev = zones;
    setZones((s) => s.filter((z) => idOf(z) !== id));
    try {
      await axios.delete(`${API}/api/danger-zones/${id}`);
    } catch (err) {
      console.error(err);
      alert("Delete failed on server");
      setZones(prev);
    }
  }

  /* UI: submit manual form */
  function onManualSubmit(e) {
    e.preventDefault();
    const { lat, lon, radius, label } = manual;
    if (lat === "" || lon === "") return alert("Lat & Lon required");
    createZone({ lat: Number(lat), lon: Number(lon), radius: Number(radius), label: label || "manual zone" });
  }

  const defaultCenter = zones.length ? [zones[0].lat, zones[0].lon] : [17.44, 78.35];

  return (
    <div className="mz-layout">
      <aside className="mz-panel">
        <div className="mz-header">
          <h2>Danger Zones</h2>
          <div className="mz-sub">Manage geo-fenced danger zones</div>
        </div>

        <div className="mz-controls">
          <button className="btn-gloss" onClick={loadZones} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="btn-gloss alt" onClick={() => { setZones([]); loadZones(); }}>
            Clear view
          </button>
        </div>

        <div className="mz-section">
          <h3>Create zone (click map OR manual)</h3>
          <form className="mz-form" onSubmit={onManualSubmit}>
            <div className="mz-row">
              <input placeholder="lat" value={manual.lat} onChange={(e) => setManual((p) => ({...p, lat: e.target.value}))} />
              <input placeholder="lon" value={manual.lon} onChange={(e) => setManual((p) => ({...p, lon: e.target.value}))} />
            </div>
            <div className="mz-row">
              <input placeholder="radius (m)" value={manual.radius} onChange={(e) => setManual((p) => ({...p, radius: e.target.value}))} />
              <input placeholder="label" value={manual.label} onChange={(e) => setManual((p) => ({...p, label: e.target.value}))} />
            </div>
            <div className="mz-row">
              <button className="btn-gloss" type="submit" disabled={creating}>Add Zone</button>
            </div>
            <div className="mz-hint">Tip: click anywhere on the map to create an auto zone.</div>
          </form>
        </div>

        <div className="mz-section">
          <h3>Zones ({zones.length})</h3>
          <div className="mz-list">
            {zones.length === 0 && <div className="mz-empty">No zones yet</div>}
            {zones.map((z) => {
              const key = idOf(z);
              return (
                <div className="mz-card" key={key}>
                  <div className="mz-card-left">
                    <div className="mz-label">{z.label}</div>
                    <div className="mz-meta">Lat: {Number(z.lat).toFixed(4)} • Lon: {Number(z.lon).toFixed(4)}</div>
                    <div className="mz-meta">Radius: {Number(z.radius || 0)} m</div>
                  </div>
                  <div className="mz-card-right">
                    <button className="btn-delete" onClick={() => deleteZone(key)} title="Delete zone">✕</button>
                    <button className="btn-center" onClick={() => {
                      if (mapRef.current) mapRef.current.setView([Number(z.lat), Number(z.lon)], 15);
                    }}>Center</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mz-footer">
          <small>Backend: {API}</small>
          {error && <div className="mz-error">{error}</div>}
        </div>
      </aside>

      <main className="mz-map">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(m) => (mapRef.current = m)}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onCreate={createZone} />
          {zones.map((zraw) => {
            const z = { ...zraw, lat: Number(zraw.lat), lon: Number(zraw.lon), radius: Number(zraw.radius ?? 200) };
            const key = idOf(z);
            return (
              <React.Fragment key={key}>
                <Circle
                  center={[z.lat, z.lon]}
                  radius={z.radius}
                  pathOptions={{ color: "rgba(255,90,90,0.7)", fillOpacity: 0.12 }}
                />
                <Marker
                  position={[z.lat, z.lon]}
                  eventHandlers={{
                    click() { setSelectedZone(key); /* shows selected in panel if you want to use */ },
                  }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </main>
    </div>
  );
}
