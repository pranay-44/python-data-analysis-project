import os
import json
from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pathlib

BASE_DIR      = pathlib.Path(__file__).resolve().parent.parent
FRONTEND_DIR  = str(BASE_DIR / "frontend")
PROCESSED_DIR = BASE_DIR / "data" / "processed"

app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path="",
    template_folder=FRONTEND_DIR,
)
CORS(app)

# ── Load processed JSON once into memory at startup ──
_cache = {}

def _load(fname):
    if fname not in _cache:
        path = PROCESSED_DIR / fname
        with open(path, "r", encoding="utf-8") as f:
            _cache[fname] = json.load(f)
    return _cache[fname]

def load_matches():
    return _load("matches.json")

def load_deliveries(match_id):
    return [d for d in _load("deliveries.json") if d.get("match_id") == match_id]

def load_batting(match_id):
    return [b for b in _load("batting.json") if b.get("match_id") == match_id]

def load_bowling(match_id):
    return [b for b in _load("bowling.json") if b.get("match_id") == match_id]

# ── UI route ──
@app.route("/")
@app.route("/cricverse-complete.html")
def dashboard():
    return render_template("cricverse-complete.html")

# ── API endpoints ──
@app.get("/api/matches")
def api_matches():
    return jsonify(load_matches())

# <path:match_id> handles match IDs that contain dashes without Flask misrouting them
@app.get("/api/deliveries/<path:match_id>")
def api_deliveries(match_id):
    return jsonify(load_deliveries(match_id))

@app.get("/api/batting/<path:match_id>")
def api_batting(match_id):
    return jsonify(load_batting(match_id))

@app.get("/api/bowling/<path:match_id>")
def api_bowling(match_id):
    return jsonify(load_bowling(match_id))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)