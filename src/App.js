import React, { useEffect, useState, useRef } from "react";

const OWM_KEY = process.env.REACT_APP_OWM_KEY;
const OWM_BASE = "https://api.openweathermap.org/data/2.5/weather";

const injectStyles = () => {
  const css = `
  :root{
    --bg:#0f1724;
    --card:#0b1220;
    --muted:#97a0b5;
    --accent:#5eead4;
    --danger:#fb7185;
    --glass: rgba(255,255,255,0.03);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  }
  html,body,#root{
    height:100%;
    margin:0;
    background: linear-gradient(180deg,#041022 0%, #071021 100%);
    color:#e6eef8;
  }
  .app {
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:18px;
    box-sizing:border-box;
  }
  .page {
    width:100%;
    max-width:780px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border-radius:18px;
    padding:18px;
    box-sizing:border-box;
    box-shadow: 0 6px 28px rgba(3,8,16,0.6);
    backdrop-filter: blur(8px);
    border:1px solid rgba(255,255,255,0.03);
  }
  .header {
    display:flex;
    align-items:center;
    gap:12px;
    justify-content:space-between;
    margin-bottom:12px;
  }
  .title { font-size:16px; font-weight:600; letter-spacing:0.2px; }
  .subtitle { color:var(--muted); font-size:13px; }
  .big { display:flex; align-items:center; justify-content:center; font-weight:700; font-size:48px; margin:8px 0 12px; }
  .small { font-size:14px; color:var(--muted); }
  .controls { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:12px; }
  button.cta {
    background: linear-gradient(90deg, rgba(94,234,212,0.12), rgba(94,234,212,0.06));
    border: 1px solid rgba(94,234,212,0.14);
    padding:12px 18px;
    border-radius:12px;
    color:var(--accent);
    font-weight:600;
    font-size:15px;
    cursor:pointer;
    min-width:110px;
    text-align:center;
  }
  button.ghost {
    background:transparent;
    border:1px solid rgba(255,255,255,0.04);
    color:var(--muted);
  }
  button.danger {
    background: linear-gradient(90deg, rgba(251,113,133,0.09), rgba(251,113,133,0.03));
    border:1px solid rgba(251,113,133,0.12);
    color:var(--danger);
  }
  input[type="number"], input[type="text"], input[type="time"] {
    padding:10px 12px;
    border-radius:10px;
    border:1px solid rgba(255,255,255,0.04);
    background:var(--glass);
    color:inherit;
    min-width:80px;
    text-align:center;
  }
  .weatherCard {
    display:flex; flex-direction:column; gap:8px; align-items:center; padding:14px;
    border-radius:12px; border:1px solid rgba(255,255,255,0.03);
    background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02));
  }
  .weatherTemp { font-size:44px; font-weight:800; }
  .weatherDesc { text-transform:capitalize; color:var(--muted); }
  .note { font-size:12px; color:var(--muted); margin-top:8px; text-align:center; }
  .meta { font-size:12px; color:var(--muted); text-align:center; margin-top:12px; }
  .fade-badge { opacity: 0; transform: scale(0.95); transition: opacity 0.3s ease, transform 0.3s ease; }
  .fade-badge.show { opacity: 1; transform: scale(1); }
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
};
injectStyles();

function useDeviceOrientation() {
  const [angle, setAngle] = useState(getCurrentAngle());
  useEffect(() => {
    function update() { setAngle(getCurrentAngle()); }
    if (window.screen?.orientation?.addEventListener) {
      window.screen.orientation.addEventListener("change", update);
    } else {
      window.addEventListener("orientationchange", update);
    }
    return () => {
      if (window.screen?.orientation?.removeEventListener) {
        window.screen.orientation.removeEventListener("change", update);
      } else {
        window.removeEventListener("orientationchange", update);
      }
    };
  }, []);
  return mapAngleToPage(angle);
}
function getCurrentAngle() {
  try {
    const s = window.screen;
    if (s?.orientation?.angle != null) return normalizeAngle(s.orientation.angle);
    if (window.orientation != null) return normalizeAngle(window.orientation);
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    return isPortrait ? 0 : 90;
  } catch { return 0; }
}
function normalizeAngle(v) {
  return ((Math.round(v/90) * 90) % 360 + 360) % 360;
}
function mapAngleToPage(angle) {
  switch (angle) {
    case 0: return { angle, page: "alarm", name: "Portrait — Alarm" };
    case 180: return { angle, page: "timer", name: "Portrait — Timer" };
    case 90: return { angle, page: "stopwatch", name: "Landscape — Stopwatch" };
    case 270: return { angle, page: "weather", name: "Landscape — Weather" };
    default: return { angle, page: "alarm", name: "Portrait — Alarm" };
  }
}

function beep(duration = 600, freq = 440, vol = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
    o.stop(ctx.currentTime + duration / 1000 + 0.05);
  } catch {}
}
function formatMs(ms) {
  if (ms <= 0) return "00:00.000";
  const total = Math.floor(ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = total % 1000;
  return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(millis).padStart(3,"0")}`;
}

function AlarmClock() {
  const [time, setTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState("");
  const alarmSetRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!alarmTime) return;
    const now = new Date();
    const [hh, mm] = alarmTime.split(":").map(Number);
    if (isNaN(hh) || isNaN(mm)) return;
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const ms = target - now;
    alarmSetRef.current && clearTimeout(alarmSetRef.current);
    alarmSetRef.current = setTimeout(() => {
      beep(1200, 880, 0.35);
      navigator.vibrate?.([300,120,300]);
      alert("Alarm! " + alarmTime);
    }, ms);
    return () => clearTimeout(alarmSetRef.current);
  }, [alarmTime]);

  return (
    <div>
      <div className="header" style={{ marginBottom: 16 }}>
        <div>
          <div className="title">Alarm Clock</div>
          <div className="subtitle">Portrait — upright</div>
        </div>
        <div className="small">{time.toLocaleDateString()}</div>
      </div>
      <div className="big">{time.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}</div>
      <div style={{ display:"flex", justifyContent:"center", gap:10 }}>
        <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} />
        <button className="cta" onClick={() => {
          if (!alarmTime) {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2,"0");
            const mm = String((now.getMinutes() + 1) % 60).padStart(2,"0");
            setAlarmTime(`${hh}:${mm}`);
            return;
          }
          setAlarmTime("");
          alarmSetRef.current && clearTimeout(alarmSetRef.current);
        }}>{alarmTime ? "Cancel Alarm" : "Quick Set +1min"}</button>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [acc, setAcc] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const [display, setDisplay] = useState("00:00.000");

  useEffect(() => {
    if (running) {
      startRef.current = performance.now();
      const loop = () => {
        const now = performance.now();
        setDisplay(formatMs(acc + (now - startRef.current)));
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      rafRef.current && cancelAnimationFrame(rafRef.current);
      setDisplay(formatMs(acc));
    }
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [running, acc]);

  return (
    <div>
      <div className="header" style={{ marginBottom: 16 }}>
        <div>
          <div className="title">Stopwatch</div>
          <div className="subtitle">Landscape — right-side up</div>
        </div>
      </div>
      <div className="big">{display}</div>
      <div className="controls">
        <button className="cta" onClick={() => {
          if (running) {
            setAcc((a) => a + (performance.now() - startRef.current));
            setRunning(false);
          } else setRunning(true);
        }}>{running ? "Pause" : "Start"}</button>
        <button className="danger" onClick={() => { setRunning(false); setAcc(0); setDisplay("00:00.000"); }}>Reset</button>
      </div>
    </div>
  );
}

function Timer({ manualMode }) {
  const [inputMin, setInputMin] = useState(0);
  const [inputSec, setInputSec] = useState(30);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(30000);
  const endRef = useRef(null);
  const tickerRef = useRef(null);

  useEffect(() => {
    if (!running) {
      setRemaining((inputMin * 60 + Number(inputSec || 0)) * 1000);
    }
  }, [inputMin, inputSec, running]);

  useEffect(() => {
    if (running) {
      tickerRef.current = setInterval(() => {
        const r = Math.max(0, endRef.current - Date.now());
        setRemaining(r);
        if (r <= 0) {
          setRunning(false);
          clearInterval(tickerRef.current);
          beep(1400, 660, 0.35);
          navigator.vibrate?.([500, 150, 300]);
          alert("Timer finished");
        }
      }, 200);
    } else {
      tickerRef.current && clearInterval(tickerRef.current);
    }
    return () => tickerRef.current && clearInterval(tickerRef.current);
  }, [running]);

  return (
    <div>
      <div className="header" style={{ marginBottom: 16 }}>
        <div>
          <div className="title">Timer</div>
          <div className="subtitle">Portrait — upside-down</div>
          <div className={`fade-badge ${manualMode ? "show" : ""}`} style={{ fontSize: 11, color: "var(--danger)" }}>
            (manual mode — 180° rotation unavailable)
          </div>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
        <div><div className="small">Min</div>
          <input type="number" min="0" max="999" value={inputMin} onChange={(e) => setInputMin(Math.max(0, Number(e.target.value||0)))} />
        </div>
        <div><div className="small">Sec</div>
          <input type="number" min="0" max="59" value={inputSec} onChange={(e) => setInputSec(Math.max(0, Math.min(59, Number(e.target.value||0))))} />
        </div>
      </div>
      <div className="big" style={{ marginTop: 16 }}>{formatMs(remaining)}</div>
      <div className="controls">
        <button className="cta" onClick={() => {
          if (running) {
            setRunning(false);
          } else if (remaining > 0) {
            endRef.current = Date.now() + remaining;
            setRunning(true);
          }
        }}>
          {running ? "Pause" : "Start"}
        </button>
        <button className="danger" onClick={() => { setRunning(false); setRemaining((inputMin * 60 + Number(inputSec || 0)) * 1000); }}>
          Reset
        </button>
      </div>
    </div>
  );
}

function Weather() {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLoading(false); },
      () => { setLoading(false); setError("Location denied. Search a city."); },
      { timeout: 7000 }
    );
  }, []);

  useEffect(() => { if (coords) fetchWeather(coords.lat, coords.lon).then(setWeather).catch((e) => setError(String(e))); }, [coords]);

  async function fetchWeather(lat, lon, q) {
    setError(null); setLoading(true);
    try {
      if (!OWM_KEY) {
        throw new Error("Missing OpenWeatherMap API key (set REACT_APP_OWM_KEY in .env)");
      }
      const url = q ? `${OWM_BASE}?q=${encodeURIComponent(q)}&appid=${OWM_KEY}&units=metric`
                    : `${OWM_BASE}?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
      const res = await fetch(url); const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Weather fetch failed");
      setLoading(false); return data;
    } catch (e) { setLoading(false); throw e; }
  }

  return (
    <div>
      <div className="header" style={{ marginBottom: 16 }}>
        <div><div className="title">Weather</div><div className="subtitle">Landscape — flipped</div></div>
      </div>
      <div style={{ display:"flex", justifyContent:"center" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ display:"flex", gap:8, marginBottom: 10 }}>
            <input type="text" placeholder="Search city" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
            <button className="cta" onClick={() => { if (cityInput) fetchWeather(null, null, cityInput).then(setWeather).catch((e) => setError(String(e.message||e))); }}>Search</button>
          </div>
          {loading && <div className="note">Loading weather…</div>}
          {error && <div className="note" style={{ color: "var(--danger)" }}>{error}</div>}
          {weather && (
            <div className="weatherCard">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div><div style={{ fontSize: 16, fontWeight: 700 }}>{weather.name}, {weather.sys.country}</div>
                <div className="weatherDesc">{weather.weather[0].description}</div></div>
                <div className="weatherTemp">{Math.round(weather.main.temp)}°C</div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
                <div className="small">Humidity: {weather.main.humidity}%</div>
                <div className="small">Wind: {Math.round(weather.wind.speed)} m/s</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const orientation = useDeviceOrientation();
  const [page, setPage] = useState(orientation.page);
  const [manualTimer, setManualTimer] = useState(false);

  useEffect(() => {
    setPage(orientation.page);
    if (orientation.page === "timer") setManualTimer(false);
  }, [orientation.page]);

  return (
    <div className="app">
      <div className="page" style={{ maxWidth: 720 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Prompt This Into Existence — Mobile</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Auto-switches by device orientation</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {page === "timer" ? "Portrait — Timer" : orientation.name}
            </div>
            {page !== "timer" && (
              <button className="cta" style={{ padding: "6px 10px", fontSize: 12, minWidth: "auto" }}
                onClick={() => { setPage("timer"); setManualTimer(true); }}>
                Switch to Timer
              </button>
            )}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {page === "alarm" && <AlarmClock />}
          {page === "stopwatch" && <Stopwatch />}
          {page === "timer" && <Timer manualMode={manualTimer} />}
          {page === "weather" && <Weather />}
        </div>
        <div className="meta">Built with React. Rotate your device to switch pages.</div>
      </div>
    </div>
  );
}