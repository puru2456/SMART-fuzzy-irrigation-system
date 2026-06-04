# Irrigation Dashboard

Fuzzy-logic irrigation prediction system with a React frontend and Flask backend.

## Project Structure

```
irrigation-dashboard/
├── app.py              ← Flask API (your fuzzy logic engine)
├── requirements.txt    ← Python dependencies
├── package.json        ← Node/React dependencies
├── vite.config.js      ← Vite dev server (proxies /api → Flask)
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    └── Dashboard.jsx   ← Full React dashboard
```

## Setup & Run

### 1. Python / Flask backend

```bash
# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start Flask (runs on http://localhost:5000)
python app.py
```

### 2. React frontend

```bash
# Install Node dependencies
npm install

# Start dev server (runs on http://localhost:3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/predict` | Single prediction `{ soil, temp, hum }` |
| GET  | `/api/scan`    | Soil sweep at fixed temp & hum |
| GET  | `/api/heatmap` | Duration matrix: soil × temp tiers |
| GET  | `/api/history` | Simulated 24-hr sinusoidal time series |
| GET  | `/api/health`  | Server health check |

### Example `/api/predict` request

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"soil": 40, "temp": 30, "hum": 60}'
```

Response:
```json
{
  "input": { "soil": 40, "temp": 30, "hum": 60 },
  "irrigation_duration": 25.4,
  "water_used_liters": 1.27,
  "soil_class": "Medium",
  "temp_class": "Moderate",
  "hum_class": "Medium"
}
```

## Dashboard Features

- **Live sliders** — adjust soil, temperature, and humidity; prediction updates in real time (300ms debounce)
- **KPI cards** — irrigation duration, water used, fuzzy class labels
- **Line chart** — simulated 24-hour sensor + irrigation trend
- **Area chart** — soil moisture sweep at current temp/humidity (updates with sliders)
- **Grouped bar chart** — irrigation duration across soil conditions × temperature tiers

## Production Build

```bash
npm run build       # outputs to dist/
```

Serve `dist/` with any static host (Nginx, Vercel, etc.) and point the API base URL
to your deployed Flask server.
