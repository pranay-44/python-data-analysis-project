from flask import Flask, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pathlib
import json
import os

# Resolve paths relative to this file (backend/app.py)
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
FRONTEND_DIR = str(BASE_DIR / "frontend")
DATA_DIR = BASE_DIR / "data" / "processed"

app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path="",              # serve static files from root URL
    template_folder=FRONTEND_DIR
)

# Enable CORS for development
CORS(app)

def load_json(name: str):
    path = DATA_DIR / f"{name}.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ---------- UI routes ----------
@app.route("/")
def dashboard():
    return render_template("cricverse-complete.html")

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
