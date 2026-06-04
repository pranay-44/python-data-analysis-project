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
# Initialise a repo (if not done yet)
git init
# Add all project files (excluding venv and .gitignore)
git add .
# First commit
git commit -m "Initial commit – pastel UI, SPA ready"
# Add remote origin (replace the placeholder URL)
git remote add origin <YOUR_GITHUB_REPO_URL>
# Rename default branch to main (optional but recommended)
git branch -M main
# Push to GitHub
git push -u origin main
```

## 🤝 Contributing
Feel free to open issues or submit pull requests. Follow the existing code style and keep the UI consistent with the pastel colour scheme.

## 📄 License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---
*Happy coding and enjoy the clean, pastel‑themed cricket analytics dashboard!*
