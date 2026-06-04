# Cricket Data Analytical Dashboard

A web app I built to explore and visualise IPL/cricket match data. You can see batting and bowling stats, run rates, partnerships, wicket timelines, and AI-generated match commentary — all from a clean dashboard in your browser.

---

## What this project does

I wanted a way to make sense of raw cricket data without staring at spreadsheets. So I built a small Flask server that reads processed JSON files and exposes them as API endpoints, and a single-page frontend that pulls that data and renders charts and tables interactively.

The data pipeline (in `etl.py`) handles the heavy lifting — cleaning raw match data and saving it as structured JSON files that the app uses at runtime.

---

## Project layout
python-data-analysis-project/
├── backend/           → Flask app (serves API + static files)
│   └── app.py
├── frontend/          → The actual web page
│   └── cricverse-complete.html
├── data/
│   └── processed/     → JSON files the app reads from
├── notebook/          → Jupyter notebooks (exploratory analysis)
├── etl.py             → Script to process raw data into JSON
└── requirements.txt

---

## Running it locally

You'll need Python 3.8+ installed.

```bash
# 1. Clone the repo
git clone https://github.com/pranay-44/python-data-analysis-project.git
cd python-data-analysis-project

# 2. Set up a virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the Flask server
python backend/app.py
```

Then open `http://127.0.0.1:5000` in your browser. That's it.

> **Note:** If the dashboard shows no data, run `python etl.py` first to generate the processed JSON files inside `data/processed/`.

---

## Tech used
- **Python / Flask** — backend API
- **HTML + CSS + JavaScript** — frontend (no frameworks, just vanilla)
- **Pandas** — data processing in `etl.py`
- **Jupyter Notebook** — initial exploration before building the app

---

## Known issues / things I'd improve
- The frontend is a single large HTML file — could be split into components
- No authentication; meant for local use only
- Deployment setup is manual (see below)
---
## Deploying (optional)
If you want to host this somewhere:
```bash
pip install gunicorn       # Linux/Mac
gunicorn -w 4 -b 0.0.0.0:8000 backend.app:app

# Windows alternative
pip install waitress
waitress-serve --port=8000 backend.app:app
```
Point a reverse proxy (like NGINX) at that port if you're exposing it publicly.

*Happy coding and enjoy the clean, pastel‑themed cricket analytics dashboard!*
