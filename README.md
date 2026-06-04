# Data Analytical Dashboard

A **single‑page web application** that visualises cricket match data with interactive statistics, player analyses, and AI‑powered insights. The UI now uses a solid pastel colour palette for a clean, premium look.

## ✨ Features
- Full‑stack Flask backend serving processed JSON data via `/api/*` endpoints.
- Responsive SPA built with vanilla HTML, CSS and JavaScript (no heavy frameworks).
- Dynamic dashboards: match summary, batting/bowling stats, highest partnerships, wicket‑takers, run rates, etc.
- Past‑match analysis with heat‑maps, mini‑charts, and AI‑generated commentary.
- Solid pastel UI (no neon glow) while keeping the original colour palette.
- Easy local development with a virtual environment.

## 📦 Project Structure
```
Data analytical dashboard/
├─ backend/                # Flask server
│   ├─ app.py              # Main entry point (serve API & static files)
│   └─ ...
├─ frontend/               # SPA assets
│   ├─ cricverse-complete.html  # Single HTML page (styled with CSS variables)
│   ├─ script.js           # Front‑end logic, fetches API data
│   └─ style.css (inline in HTML)
├─ data/processed/         # JSON files generated from raw cricket data
├─ venv/                   # Python virtual environment (not tracked in git)
└─ README.md               # This file
```

## ⚙️ Installation & Development
1. **Clone the repo** (or copy the folder locally).
2. **Create a virtual environment** and install dependencies:
   ```powershell
   cd "c:\Data analytical dashboard"
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt   # Flask, flask‑cors, etc.
   ```
3. **Run the server**:
   ```powershell
   & "c:\Data analytical dashboard\venv\Scripts\python.exe" "c:\Data analytical dashboard\backend\app.py"
   ```
   The app will be available at `http://127.0.0.1:5000`.
4. Open the URL in a browser – the SPA will load and interact with the API.

## 🚀 Deploying to Production
- Use a WSGI server such as **Gunicorn** or **Waitress** for Windows:
  ```powershell
  pip install gunicorn   # or pip install waitress
  gunicorn -w 4 -b 0.0.0.0:8000 backend.app:app
  ```
- Serve static files through a reverse‑proxy (NGINX, IIS) for optimal performance.
- Ensure the `data/processed` directory is included and readable by the server.

## 🔧 Git Commands – Push to GitHub
Replace `<YOUR_GITHUB_REPO_URL>` with the URL of your remote repository (e.g., `https://github.com/username/cricket-dashboard.git`).
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
