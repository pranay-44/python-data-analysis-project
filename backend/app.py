from flask import Flask, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pathlib
import json

app = Flask(
    __name__,
    static_folder="../frontend",   # serve static assets
    template_folder="../frontend"   # serve HTML templates
)

# Enable CORS for development (optional)
CORS(app)

DATA_ROOT = pathlib.Path("../data/processed")

def load_json(name: str):
    path = DATA_ROOT / f"{name}.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ---------- UI routes ----------
@app.route("/")
def dashboard():
    # Render the main dashboard page
    return render_template("cricverse-complete.html")

@app.route("/match-analysis")
def match_analysis():
    return render_template("match-analysis.html")

# ---------- API endpoints ----------
@app.get("/api/matches")
def api_matches():
    return jsonify(load_json("matches"))

@app.get("/api/deliveries")
def api_deliveries():
    return jsonify(load_json("deliveries"))

@app.get("/api/batting")
def api_batting():
    return jsonify(load_json("batting"))

@app.get("/api/bowling")
def api_bowling():
    return jsonify(load_json("bowling"))

# ---------- Catch‑all static files (if needed) ----------
@app.route("/frontend/<path:filename>")
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
