from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend running"
@app.route("/api")
def home():
    return jsonify({"message": "Smart Fuzzy Irrigation API is running!"})

# ─────────────────────────────────────────────
# Build Fuzzy System (runs once at startup)
# ─────────────────────────────────────────────

soil = ctrl.Antecedent(np.arange(0, 101, 1), 'soil')
temp = ctrl.Antecedent(np.arange(10, 46, 1), 'temp')
hum  = ctrl.Antecedent(np.arange(20, 101, 1), 'hum')
duration = ctrl.Consequent(np.arange(0, 61, 1), 'duration')

soil['dry']    = fuzz.trimf(soil.universe, [0, 0, 30])
soil['medium'] = fuzz.trimf(soil.universe, [25, 50, 75])
soil['wet']    = fuzz.trimf(soil.universe, [70, 100, 100])

temp['low']      = fuzz.trimf(temp.universe, [10, 15, 22])
temp['moderate'] = fuzz.trimf(temp.universe, [20, 28, 34])
temp['high']     = fuzz.trimf(temp.universe, [32, 40, 45])

hum['low']    = fuzz.trimf(hum.universe, [10, 25, 45])
hum['medium'] = fuzz.trimf(hum.universe, [40, 60, 75])
hum['high']   = fuzz.trimf(hum.universe, [70, 90, 100])

duration['short']     = fuzz.trimf(duration.universe, [0, 0, 12])
duration['medium']    = fuzz.trimf(duration.universe, [10, 25, 40])
duration['long']      = fuzz.trimf(duration.universe, [35, 50, 60])
duration['very_long'] = fuzz.trimf(duration.universe, [50, 60, 60])

rules = [
    ctrl.Rule(soil['dry']    & temp['low']      & hum['low'],    duration['long']),
    ctrl.Rule(soil['dry']    & temp['low']      & hum['medium'], duration['long']),
    ctrl.Rule(soil['dry']    & temp['low']      & hum['high'],   duration['medium']),
    ctrl.Rule(soil['dry']    & temp['moderate'] & hum['low'],    duration['long']),
    ctrl.Rule(soil['dry']    & temp['moderate'] & hum['medium'], duration['long']),
    ctrl.Rule(soil['dry']    & temp['moderate'] & hum['high'],   duration['medium']),
    ctrl.Rule(soil['dry']    & temp['high']     & hum['low'],    duration['very_long']),
    ctrl.Rule(soil['dry']    & temp['high']     & hum['medium'], duration['long']),
    ctrl.Rule(soil['dry']    & temp['high']     & hum['high'],   duration['medium']),
    ctrl.Rule(soil['medium'] & temp['low']      & hum['low'],    duration['medium']),
    ctrl.Rule(soil['medium'] & temp['low']      & hum['medium'], duration['medium']),
    ctrl.Rule(soil['medium'] & temp['low']      & hum['high'],   duration['short']),
    ctrl.Rule(soil['medium'] & temp['moderate'] & hum['low'],    duration['medium']),
    ctrl.Rule(soil.terms['medium'] & temp['moderate'] & hum['medium'], duration['medium']),
    ctrl.Rule(soil['medium'] & temp['moderate'] & hum['high'],   duration['short']),
    ctrl.Rule(soil['medium'] & temp['high']     & hum['low'],    duration['medium']),
    ctrl.Rule(soil['medium'] & temp['high']     & hum['medium'], duration['medium']),
    ctrl.Rule(soil['medium'] & temp['high']     & hum['high'],   duration['short']),
    ctrl.Rule(soil['wet']    & temp['low']      & hum['low'],    duration['short']),
    ctrl.Rule(soil['wet']    & temp['low']      & hum['medium'], duration['short']),
    ctrl.Rule(soil['wet']    & temp['low']      & hum['high'],   duration['short']),
    ctrl.Rule(soil['wet']    & temp['moderate'] & hum['low'],    duration['short']),
    ctrl.Rule(soil['wet']    & temp['moderate'] & hum['medium'], duration['short']),
    ctrl.Rule(soil['wet']    & temp['moderate'] & hum['high'],   duration['short']),
    ctrl.Rule(soil['wet']    & temp['high']     & hum['low'],    duration['medium']),
    ctrl.Rule(soil['wet']    & temp['high']     & hum['medium'], duration['short']),
    ctrl.Rule(soil['wet']    & temp['high']     & hum['high'],   duration['short']),
    ctrl.Rule(soil['dry']    & temp['moderate'],                  duration['medium']),
    ctrl.Rule(soil['medium'] & temp['high'],                      duration['medium']),
    ctrl.Rule(soil['medium'] & hum['high'],                       duration['short']),
]

system = ctrl.ControlSystem(rules)

FLOW_RATE = 3  # L/hr


def run_simulation(soil_v, temp_v, hum_v):
    sim = ctrl.ControlSystemSimulation(system)
    sim.input['soil'] = float(soil_v)
    sim.input['temp'] = float(temp_v)
    sim.input['hum']  = float(hum_v)
    sim.compute()
    irrigation = sim.output['duration']
    water_used  = (irrigation / 60) * FLOW_RATE

    if soil_v < 30:
        soil_label = "Dry"
    elif soil_v < 70:
        soil_label = "Medium"
    else:
        soil_label = "Wet"

    if temp_v < 22:
        temp_label = "Low"
    elif temp_v < 34:
        temp_label = "Moderate"
    else:
        temp_label = "High"

    if hum_v < 45:
        hum_label = "Low"
    elif hum_v < 75:
        hum_label = "Medium"
    else:
        hum_label = "High"

    return {
        "irrigation_duration": round(irrigation, 2),
        "water_used_liters":   round(water_used, 3),
        "soil_class":  soil_label,
        "temp_class":  temp_label,
        "hum_class":   hum_label,
    }


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route("/api/predict", methods=["POST"])
def predict():
    """Single prediction from JSON body: { soil, temp, hum }"""
    data = request.get_json()
    try:
        soil_v = float(data["soil"])
        temp_v = float(data["temp"])
        hum_v  = float(data["hum"])
    except (KeyError, TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

    if not (0 <= soil_v <= 100):
        return jsonify({"error": "soil must be 0–100"}), 400
    if not (10 <= temp_v <= 45):
        return jsonify({"error": "temp must be 10–45"}), 400
    if not (20 <= hum_v <= 100):
        return jsonify({"error": "hum must be 20–100"}), 400

    result = run_simulation(soil_v, temp_v, hum_v)
    return jsonify({"input": {"soil": soil_v, "temp": temp_v, "hum": hum_v}, **result})


@app.route("/api/scan", methods=["GET"])
def scan():
    """
    Generate a sweep of predictions across soil moisture range (0–100)
    at fixed temp & hum, for trend chart data.
    Query params: temp (default 28), hum (default 60), steps (default 20)
    """
    try:
        temp_v = float(request.args.get("temp", 28))
        hum_v  = float(request.args.get("hum", 60))
        steps  = int(request.args.get("steps", 20))
    except ValueError:
        return jsonify({"error": "Invalid query param"}), 400

    soil_values = np.linspace(0, 100, steps)
    results = []
    for s in soil_values:
        r = run_simulation(s, temp_v, hum_v)
        results.append({
            "soil": round(float(s), 1),
            "irrigation": r["irrigation_duration"],
            "water":      r["water_used_liters"],
        })
    return jsonify({"temp": temp_v, "hum": hum_v, "data": results})


@app.route("/api/heatmap", methods=["GET"])
def heatmap():
    """
    Return irrigation duration for a grid of soil × temp values.
    Fixed hum (default 60). Used for bar/area breakdown chart.
    """
    try:
        hum_v = float(request.args.get("hum", 60))
    except ValueError:
        return jsonify({"error": "Invalid hum"}), 400

    soil_bins = [10, 30, 50, 70, 90]
    temp_bins = [15, 25, 35, 43]
    soil_labels = ["Very Dry", "Dry", "Medium", "Moist", "Wet"]
    temp_labels  = ["Cool", "Mild", "Warm", "Hot"]

    matrix = []
    for s, sl in zip(soil_bins, soil_labels):
        row = []
        for t, tl in zip(temp_bins, temp_labels):
            r = run_simulation(s, t, hum_v)
            row.append({
                "soil": sl, "temp": tl,
                "duration": r["irrigation_duration"],
                "water":    r["water_used_liters"],
            })
        matrix.append(row)

    return jsonify({
        "soil_labels": soil_labels,
        "temp_labels":  temp_labels,
        "matrix": matrix,
    })


@app.route("/api/history", methods=["GET"])
def history():
    """
    Simulate a time-series of 24 hourly readings using a sinusoidal pattern.
    Useful for the line chart demo.
    """
    import math
    readings = []
    for h in range(24):
        soil_v = 40 + 25 * math.sin(h * math.pi / 12)
        temp_v = 28 + 8  * math.sin((h - 6) * math.pi / 12)
        hum_v  = 60 + 15 * math.cos(h * math.pi / 12)
        soil_v = max(0, min(100, soil_v))
        temp_v = max(10, min(45, temp_v))
        hum_v  = max(20, min(100, hum_v))
        r = run_simulation(soil_v, temp_v, hum_v)
        readings.append({
            "hour":       h,
            "label":      f"{h:02d}:00",
            "soil":       round(soil_v, 1),
            "temp":       round(temp_v, 1),
            "hum":        round(hum_v, 1),
            "irrigation": r["irrigation_duration"],
            "water":      r["water_used_liters"],
        })
    return jsonify({"readings": readings})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "fuzzy-irrigation-v1"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
