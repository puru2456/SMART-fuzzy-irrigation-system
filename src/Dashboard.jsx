import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

const API = "https://smart-fuzzy-irrigation-system-1.onrender.com";

useEffect(() => {
  fetch("https://smart-fuzzy-irrigation-system-1.onrender.com")
    .then(res => res.json())
    .then(data => {
      console.log("Backend response:", data);
    })
    .catch(err => {
      console.log("Backend error:", err);
    });
}, []);

const C = {
  soil:  "#1D9E75",
  temp:  "#D85A30",
  hum:   "#378ADD",
  irr:   "#7F77DD",
  water: "#0F6E56",
  grid:  "rgba(255,255,255,0.15)",
};

// ─── Animated SVG Background ───────────────────────────────
function IrrigationBackground() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      background: "linear-gradient(180deg, #bfe3f1 0%, #86d6fb 30%, #2e8b57 70%, #0b3d0b 100%)",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes drop1 { 0%{transform:translateY(-8px);opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:translateY(38px);opacity:0} }
        @keyframes drop2 { 0%{transform:translateY(-8px);opacity:0} 20%{opacity:.8} 80%{opacity:.8} 100%{transform:translateY(34px);opacity:0} }
        @keyframes sway  { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes sway2 { 0%,100%{transform:rotate(1deg)}  50%{transform:rotate(-3deg)} }
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes drip  { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-60} }
        .drop-a { animation: drop1 2.2s ease-in infinite; }
        .drop-b { animation: drop1 2.2s ease-in infinite 0.7s; }
        .drop-c { animation: drop2 2.8s ease-in infinite 1.1s; }
        .drop-d { animation: drop1 2.4s ease-in infinite 0.3s; }
        .drop-e { animation: drop2 3.0s ease-in infinite 1.5s; }
        .drop-f { animation: drop1 2.6s ease-in infinite 0.9s; }
        .drop-g { animation: drop2 2.2s ease-in infinite 0.5s; }
        .drop-h { animation: drop1 2.8s ease-in infinite 1.8s; }
        .sway1  { transform-origin: 50% 100%; animation: sway  4s ease-in-out infinite; }
        .sway2  { transform-origin: 50% 100%; animation: sway2 5s ease-in-out infinite; }
        .sway3  { transform-origin: 50% 100%; animation: sway  6s ease-in-out infinite 1s; }
        .sway4  { transform-origin: 50% 100%; animation: sway2 4.5s ease-in-out infinite 2s; }
        .pipe-flow { stroke-dasharray: 8 6; animation: drip 1.5s linear infinite; }
        .star { animation: pulse 3s ease-in-out infinite; }
      `}</style>
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

        {/* Stars / sky dots */}
        {[[80,60],[200,30],[350,80],[500,20],[700,50],[900,35],[1100,65],[1300,25],[1400,55],[150,100],[450,110],[750,90],[1050,75],[1250,100]].map(([x,y],i) => (
          <circle key={i} className="star" cx={x} cy={y} r={i%3===0?1.5:1} fill="white" opacity={0.4 + (i%4)*0.1} style={{animationDelay:`${i*0.4}s`}}/>
        ))}

        {/* Moon */}
        <circle cx="1320" cy="80" r="28" fill="#e8f4d0" opacity="0.18"/>
        <circle cx="1334" cy="72" r="22" fill="#0a2e1a" opacity="0.85"/>

        {/* Distant hills */}
        <ellipse cx="200"  cy="700" rx="320" ry="120" fill="#0d3d20" opacity="0.7"/>
        <ellipse cx="600"  cy="720" rx="380" ry="110" fill="#0f4525" opacity="0.6"/>
        <ellipse cx="1100" cy="690" rx="420" ry="130" fill="#0d3d20" opacity="0.7"/>
        <ellipse cx="1400" cy="710" rx="300" ry="100" fill="#0f4525" opacity="0.5"/>

        {/* Soil ground layer */}
        <rect x="0" y="800" width="1440" height="100" fill="#2d1a0e" opacity="0.9"/>
        <rect x="0" y="820" width="1440" height="80"  fill="#3d2410" opacity="0.8"/>
        {/* Soil texture lines */}
        {[0,80,160,240,320,400,480,560,640,720,800,880,960,1040,1120,1200,1280,1360].map((x,i) => (
          <line key={i} x1={x} y1={830 + (i%3)*6} x2={x+60} y2={836 + (i%2)*4} stroke="#5a3820" strokeWidth="0.5" opacity="0.4"/>
        ))}

        {/* ── Main drip irrigation pipe (horizontal) ── */}
        <rect x="0" y="310" width="1440" height="7" rx="3" fill="#4a7a5a" opacity="0.8"/>
        <rect x="0" y="311" width="1440" height="3" rx="1" fill="#6aaa7a" opacity="0.3"/>

        {/* Pipe flow animation */}
        <line x1="0" y1="313" x2="1440" y2="313" stroke="#7dd4a0" strokeWidth="1.5" className="pipe-flow" opacity="0.4"/>

        {/* ── Drip emitter connectors (vertical tubes) ── */}
        {[120, 280, 440, 600, 760, 920, 1080, 1240, 1380].map((x, i) => (
          <g key={i}>
            <rect x={x-2} y={317} width="4" height="50" rx="2" fill="#3a6a4a" opacity="0.9"/>
            <circle cx={x} cy={372} r="5" fill="#2d5a3d" stroke="#5aaa7a" strokeWidth="1"/>
          </g>
        ))}

        {/* ── Water drops ── */}
        <ellipse className="drop-a" cx="120"  cy="385" rx="3"   ry="5"   fill="#7dd4f0" opacity="0.9"/>
        <ellipse className="drop-b" cx="120"  cy="385" rx="2.5" ry="4.5" fill="#aee8ff" opacity="0.7"/>
        <ellipse className="drop-c" cx="280"  cy="385" rx="3"   ry="5"   fill="#7dd4f0" opacity="0.9"/>
        <ellipse className="drop-d" cx="440"  cy="385" rx="3"   ry="5"   fill="#7dd4f0" opacity="0.9"/>
        <ellipse className="drop-e" cx="600"  cy="385" rx="2.5" ry="4.5" fill="#aee8ff" opacity="0.8"/>
        <ellipse className="drop-f" cx="760"  cy="385" rx="3"   ry="5"   fill="#7dd4f0" opacity="0.9"/>
        <ellipse className="drop-g" cx="920"  cy="385" rx="3"   ry="5"   fill="#7dd4f0" opacity="0.9"/>
        <ellipse className="drop-h" cx="1080" cy="385" rx="2.5" ry="4.5" fill="#aee8ff" opacity="0.8"/>
        <ellipse className="drop-a" cx="1240" cy="385" rx="3"   ry="5"   fill="#7dd4f0" opacity="0.9" style={{animationDelay:"0.6s"}}/>
        <ellipse className="drop-c" cx="1380" cy="385" rx="3"   ry="5"   fill="#7dd4f0" opacity="0.9" style={{animationDelay:"1.2s"}}/>

        {/* ── Tall plants (left cluster) ── */}
        <g className="sway1">
          <rect x="98" y="500" width="6" height="300" rx="3" fill="#1a6b2a"/>
          <ellipse cx="101" cy="480" rx="28" ry="50" fill="#1e8032" opacity="0.9"/>
          <ellipse cx="80"  cy="510" rx="22" ry="38" fill="#25993c" opacity="0.8"/>
          <ellipse cx="122" cy="505" rx="20" ry="36" fill="#1e8032" opacity="0.8"/>
          <ellipse cx="101" cy="455" rx="18" ry="30" fill="#2db348" opacity="0.9"/>
        </g>
        <g className="sway2">
          <rect x="148" y="530" width="5" height="270" rx="3" fill="#1a6b2a"/>
          <ellipse cx="151" cy="510" rx="22" ry="42" fill="#25993c" opacity="0.85"/>
          <ellipse cx="134" cy="535" rx="18" ry="32" fill="#1e8032" opacity="0.8"/>
          <ellipse cx="168" cy="530" rx="16" ry="30" fill="#25993c" opacity="0.75"/>
        </g>

        {/* ── Tall plants (center-left) ── */}
        <g className="sway3">
          <rect x="258" y="490" width="6" height="310" rx="3" fill="#1a6b2a"/>
          <ellipse cx="261" cy="465" rx="30" ry="52" fill="#1e8032" opacity="0.9"/>
          <ellipse cx="238" cy="495" rx="24" ry="40" fill="#25993c" opacity="0.8"/>
          <ellipse cx="284" cy="490" rx="22" ry="38" fill="#1e8032" opacity="0.8"/>
          <ellipse cx="261" cy="440" rx="20" ry="32" fill="#2db348" opacity="0.9"/>
        </g>
        <g className="sway4">
          <rect x="308" y="540" width="5" height="260" rx="3" fill="#156020"/>
          <ellipse cx="311" cy="520" rx="20" ry="38" fill="#1e8032" opacity="0.8"/>
          <ellipse cx="294" cy="545" rx="16" ry="28" fill="#25993c" opacity="0.75"/>
        </g>

        {/* ── Plants center ── */}
        <g className="sway1">
          <rect x="418" y="510" width="6" height="290" rx="3" fill="#1a6b2a"/>
          <ellipse cx="421" cy="488" rx="28" ry="48" fill="#228b38" opacity="0.9"/>
          <ellipse cx="400" cy="515" rx="22" ry="36" fill="#25993c" opacity="0.8"/>
          <ellipse cx="442" cy="510" rx="20" ry="34" fill="#228b38" opacity="0.8"/>
          <ellipse cx="421" cy="465" rx="17" ry="28" fill="#2db348" opacity="0.9"/>
        </g>
        <g className="sway2">
          <rect x="578" y="500" width="6" height="300" rx="3" fill="#1a6b2a"/>
          <ellipse cx="581" cy="476" rx="30" ry="50" fill="#1e8032" opacity="0.9"/>
          <ellipse cx="558" cy="505" rx="24" ry="40" fill="#25993c" opacity="0.8"/>
          <ellipse cx="604" cy="500" rx="22" ry="38" fill="#1e8032" opacity="0.8"/>
          <ellipse cx="581" cy="452" rx="19" ry="30" fill="#33c455" opacity="0.85"/>
        </g>

        {/* ── Plants center-right ── */}
        <g className="sway3">
          <rect x="738" y="495" width="6" height="305" rx="3" fill="#1a6b2a"/>
          <ellipse cx="741" cy="472" rx="29" ry="50" fill="#228b38" opacity="0.9"/>
          <ellipse cx="718" cy="500" rx="23" ry="38" fill="#25993c" opacity="0.8"/>
          <ellipse cx="764" cy="495" rx="21" ry="36" fill="#228b38" opacity="0.8"/>
        </g>
        <g className="sway4">
          <rect x="898" y="510" width="6" height="290" rx="3" fill="#1a6b2a"/>
          <ellipse cx="901" cy="486" rx="28" ry="48" fill="#1e8032" opacity="0.9"/>
          <ellipse cx="880" cy="514" rx="22" ry="36" fill="#25993c" opacity="0.8"/>
          <ellipse cx="922" cy="510" rx="20" ry="34" fill="#1e8032" opacity="0.8"/>
          <ellipse cx="901" cy="462" rx="17" ry="28" fill="#2db348" opacity="0.9"/>
        </g>

        {/* ── Plants right cluster ── */}
        <g className="sway1">
          <rect x="1058" y="500" width="6" height="300" rx="3" fill="#1a6b2a"/>
          <ellipse cx="1061" cy="476" rx="29" ry="50" fill="#228b38" opacity="0.9"/>
          <ellipse cx="1038" cy="504" rx="23" ry="38" fill="#25993c" opacity="0.8"/>
          <ellipse cx="1084" cy="500" rx="21" ry="36" fill="#228b38" opacity="0.8"/>
          <ellipse cx="1061" cy="452" rx="18" ry="30" fill="#33c455" opacity="0.85"/>
        </g>
        <g className="sway2">
          <rect x="1218" y="490" width="6" height="310" rx="3" fill="#1a6b2a"/>
          <ellipse cx="1221" cy="466" rx="30" ry="52" fill="#1e8032" opacity="0.9"/>
          <ellipse cx="1198" cy="495" rx="24" ry="40" fill="#25993c" opacity="0.8"/>
          <ellipse cx="1244" cy="490" rx="22" ry="38" fill="#1e8032" opacity="0.8"/>
          <ellipse cx="1221" cy="442" rx="19" ry="30" fill="#2db348" opacity="0.9"/>
        </g>
        <g className="sway3">
          <rect x="1358" y="510" width="5" height="290" rx="3" fill="#1a6b2a"/>
          <ellipse cx="1361" cy="488" rx="26" ry="46" fill="#228b38" opacity="0.9"/>
          <ellipse cx="1340" cy="516" rx="20" ry="34" fill="#25993c" opacity="0.8"/>
          <ellipse cx="1380" cy="512" rx="18" ry="32" fill="#228b38" opacity="0.8"/>
        </g>

        {/* ── Small ground plants / grass ── */}
        {[60,160,220,360,500,580,660,740,820,960,1020,1140,1180,1300,1420].map((x,i) => (
          <g key={i}>
            <path d={`M${x} 800 Q${x-8} 770 ${x-4} 755`} stroke="#25993c" strokeWidth="2.5" fill="none" opacity="0.7"/>
            <path d={`M${x} 800 Q${x+6} 768 ${x+2} 752`} stroke="#1e8032" strokeWidth="2"   fill="none" opacity="0.6"/>
            <path d={`M${x} 800 Q${x+14} 775 ${x+10} 760`} stroke="#2db348" strokeWidth="2" fill="none" opacity="0.65"/>
          </g>
        ))}

        {/* ── Puddle / water ripples at base of plants ── */}
        {[120, 280, 440, 600, 760, 920, 1080, 1240].map((x, i) => (
          <ellipse key={i} cx={x} cy={802} rx="14" ry="4" fill="#378ADD" opacity="0.2"/>
        ))}

        {/* ── Subtle mist / fog layer ── */}
        <rect x="0" y="750" width="1440" height="60" fill="url(#fogGrad)" opacity="0.15"/>
        <defs>
          <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd4f0" stopOpacity="0"/>
            <stop offset="100%" stopColor="#7dd4f0" stopOpacity="1"/>
          </linearGradient>
        </defs>

        {/* ── Dark overlay vignette to keep content readable ── */}
        <rect x="0" y="0" width="1440" height="900" fill="rgba(5,20,10,0.45)"/>
      </svg>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────
function Badge({ label, value, unit, color }) {
  return (
    <div style={{
      background: "rgba(10,30,18,0.75)",
      backdropFilter: "blur(12px)",
      borderRadius: "var(--border-radius-md)",
      padding: "14px 18px",
      display: "flex", flexDirection: "column", gap: 4,
      borderLeft: `3px solid ${color}`,
      border: `0.5px solid rgba(255,255,255,0.1)`,
      borderLeftWidth: 3, borderLeftColor: color,
    }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 500, color: "#fff", lineHeight: 1 }}>{value}<span style={{ fontSize: 13, marginLeft: 4, color: "rgba(255,255,255,0.5)" }}>{unit}</span></span>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit, color, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 500, letterSpacing: "0.07em",
      textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
      margin: "28px 0 12px",
      borderBottom: "0.5px solid rgba(255,255,255,0.1)",
      paddingBottom: 8,
    }}>{children}</h2>
  );
}

function Chip({ label, color }) {
  return (
    <span style={{
      display: "inline-block",
      background: color + "33",
      color: color,
      border: `0.5px solid ${color}66`,
      borderRadius: 4,
      fontSize: 11, fontWeight: 500,
      padding: "2px 8px",
      letterSpacing: "0.04em",
    }}>{label}</span>
  );
}

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(8,25,14,0.7)",
      backdropFilter: "blur(16px)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      borderRadius: "var(--border-radius-lg)",
      padding: "16px 18px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(8,25,14,0.92)",
      border: "0.5px solid rgba(255,255,255,0.15)",
      borderRadius: "var(--border-radius-md)",
      padding: "10px 14px", fontSize: 12, color: "#fff",
    }}>
      <p style={{ margin: "0 0 6px", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const [soil, setSoil] = useState(40);
  const [temp, setTemp] = useState(28);
  const [hum,  setHum]  = useState(60);

  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  const [historyData, setHistoryData] = useState([]);
  const [scanData,    setScanData]    = useState([]);
  const [heatData,    setHeatData]    = useState([]);

  const predict = useCallback(async (s, t, h) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soil: s, temp: t, hum: h }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      setPrediction(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => predict(soil, temp, hum), 300);
    return () => clearTimeout(t);
  }, [soil, temp, hum, predict]);

  useEffect(() => {
    fetch(`${API}/history`).then(r => r.json()).then(d => setHistoryData(d.readings)).catch(() => {});
    fetch(`${API}/scan?temp=28&hum=60&steps=25`).then(r => r.json()).then(d => setScanData(d.data)).catch(() => {});
    fetch(`${API}/heatmap?hum=60`).then(r => r.json()).then(d => {
      const flat = d.soil_labels.map((sl, si) => {
        const entry = { name: sl };
        d.temp_labels.forEach((tl) => { entry[tl] = d.matrix[si][d.temp_labels.indexOf(tl)].duration; });
        return entry;
      });
      setHeatData(flat);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`${API}/scan?temp=${temp}&hum=${hum}&steps=25`)
        .then(r => r.json()).then(d => setScanData(d.data)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [temp, hum]);

  const durationCategory =
    prediction?.irrigation_duration >= 50 ? "Very Long" :
    prediction?.irrigation_duration >= 35 ? "Long" :
    prediction?.irrigation_duration >= 12 ? "Medium" : "Short";

  const durationColor =
    durationCategory === "Very Long" ? C.temp :
    durationCategory === "Long"      ? "#BA7517" :
    durationCategory === "Medium"    ? C.irr : C.soil;

  const TICK  = { color: "rgba(255,255,255,0.45)", font: { size: 11 } };
  const GRID  = "rgba(255,255,255,0.07)";

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>

      {/* ── Animated background ── */}
      <IrrigationBackground />

      {/* ── Content layer ── */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 980, margin: "0 auto",
        padding: "28px 20px 80px",
        color: "#fff",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#33c455" }}/>
            <span style={{ fontSize: 20, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(19, 14, 100, 0.5)" }}>Fuzzy logic system · live</span>
          </div>
          <h1 style={{ fontSize: 50, fontWeight: 700, margin: 0, color: "#0b0a0a" }}>Irrigation Dashboard</h1>
          <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 35 }}>
            Real-time duration prediction from soil · temperature · humidity
          </p>
        </div>

        {/* Controls + KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <GlassCard>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 18, color: "rgba(255,255,255,0.8)" }}>Sensor inputs</p>
            <Slider label="Soil moisture" value={soil} min={0}  max={100} unit="%" color={C.soil} onChange={setSoil}/>
            <Slider label="Temperature"   value={temp} min={10} max={45}  unit="°C" color={C.temp} onChange={setTemp}/>
            <Slider label="Humidity"      value={hum}  min={20} max={100} unit="%" color={C.hum}  onChange={setHum}/>
          </GlassCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {error && (
              <div style={{ fontSize: 13, padding: 12, background: "rgba(210,50,50,0.2)", border: "0.5px solid rgba(210,50,50,0.4)", borderRadius: 8, color: "#ff9999" }}>
                Flask not connected — run python app.py
              </div>
            )}
            {prediction && (
              <>
                <Badge label="Irrigation duration" value={prediction.irrigation_duration.toFixed(1)} unit="min" color={durationColor}/>
                <Badge label="Water used"           value={prediction.water_used_liters.toFixed(3)}   unit="L"   color={C.water}/>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "10px 14px", background: "rgba(8,25,14,0.65)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>
                  <Chip label={`Soil: ${prediction.soil_class}`}  color={C.soil}/>
                  <Chip label={`Temp: ${prediction.temp_class}`}  color={C.temp}/>
                  <Chip label={`Hum: ${prediction.hum_class}`}    color={C.hum}/>
                  <Chip label={durationCategory}                   color={durationColor}/>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart 1 — 24hr trend */}
        <SectionTitle>24-hour trend — sensors & irrigation</SectionTitle>
        {historyData.length > 0 && (
          <GlassCard style={{ padding: "16px 12px 10px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              {[["Soil %", C.soil],["Temp °C", C.temp],["Humidity %", C.hum],["Irrigation min", C.irr]].map(([l,c]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }}/>{l}
                </span>
              ))}
            </div>
            <div style={{ position: "relative", width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3"/>
                  <XAxis dataKey="label" tick={TICK} interval={3}/>
                  <YAxis tick={TICK}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Line type="monotone" dataKey="soil"       name="Soil %"         stroke={C.soil} strokeWidth={1.5} dot={false}/>
                  <Line type="monotone" dataKey="temp"       name="Temp °C"        stroke={C.temp} strokeWidth={1.5} dot={false}/>
                  <Line type="monotone" dataKey="hum"        name="Humidity %"     stroke={C.hum}  strokeWidth={1.5} dot={false}/>
                  <Line type="monotone" dataKey="irrigation" name="Irrigation min" stroke={C.irr}  strokeWidth={2}   dot={false} strokeDasharray="5 3"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        {/* Chart 2 — Soil sweep */}
        <SectionTitle>Soil moisture vs irrigation duration</SectionTitle>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: -8, marginBottom: 14 }}>
          Predictions across all soil levels at temp {temp}°C · humidity {hum}%
        </p>
        {scanData.length > 0 && (
          <GlassCard style={{ padding: "16px 12px 10px" }}>
            <div style={{ position: "relative", width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scanData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="irrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.irr} stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={C.irr} stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3"/>
                  <XAxis dataKey="soil" tick={TICK} tickFormatter={v => `${v}%`} interval={4}
                    label={{ value: "Soil %", position: "insideBottom", offset: -4, fontSize: 11, fill: "rgba(255,255,255,0.4)" }}/>
                  <YAxis tick={TICK}
                    label={{ value: "min", angle: -90, position: "insideLeft", fontSize: 11, fill: "rgba(255,255,255,0.4)" }}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Area type="monotone" dataKey="irrigation" name="Duration (min)"
                    stroke={C.irr} fill="url(#irrGrad)" strokeWidth={2} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        {/* Chart 3 — Grouped bars */}
        <SectionTitle>Duration by soil condition & temperature tier</SectionTitle>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: -8, marginBottom: 14 }}>
          How temperature shifts fuzzy output at each soil level · fixed humidity 60%
        </p>
        {heatData.length > 0 && (
          <GlassCard style={{ padding: "16px 12px 10px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              {[["Cool","#378ADD"],["Mild","#1D9E75"],["Warm","#BA7517"],["Hot","#D85A30"]].map(([l,c]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }}/>{l}
                </span>
              ))}
            </div>
            <div style={{ position: "relative", width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" tick={TICK}/>
                  <YAxis tick={TICK}
                    label={{ value: "min", angle: -90, position: "insideLeft", fontSize: 11, fill: "rgba(255,255,255,0.4)" }}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Bar dataKey="Cool" name="Cool" fill="#378ADD" radius={[3,3,0,0]}/>
                  <Bar dataKey="Mild" name="Mild" fill="#1D9E75" radius={[3,3,0,0]}/>
                  <Bar dataKey="Warm" name="Warm" fill="#BA7517" radius={[3,3,0,0]}/>
                  <Bar dataKey="Hot"  name="Hot"  fill="#D85A30" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}

        <p style={{ marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
          Powered by scikit-fuzzy · Flask API on localhost:5000
        </p>
      </div>
    </div>
  );
}
