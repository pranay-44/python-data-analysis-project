🏏 CricVerse — India ODI World Cup Analytics Dashboard

Every Ball. Every Angle. Every Edge.

A full-stack cricket analytics web application that visualizes India's performance across all 6 ICC Men's ODI World Cup editions (2003–2023). Built with a Python ETL pipeline, Flask REST API, and a vanilla HTML/CSS/JS frontend featuring real match data, worm graphs, match timelines, and per-edition match analysis.

📸 Project Overview

CricVerse lets you explore every India match from the 2003 to 2023 World Cups — click any match to see live-style scorecard stats, boundary percentages, partnership data, worm charts, and ball-by-ball timelines, all powered by real Cricsheet data.

🗂️ Project Structure

cricket-analytics-dashboard/
├── backend/
│   └── app.py                  # Flask REST API server
├── frontend/
│   ├── cricverse-complete.html # Single-page dashboard UI
│   └── script.js               # All frontend logic & data rendering
├── data/
│   ├── raw/
│   │   └── world_cup_all/      # Raw Cricsheet JSON files (not tracked in git)
│   └── processed/              # ETL output JSON files (not tracked in git)
├── notebook/
│   └── Analysis.ipynb          # Exploratory data analysis notebook
├── etl.py                      # ETL pipeline — processes raw data to JSON
├── requirements.txt            # Python dependencies
└── README.md

⚙️ Tech Stack

Backend

TechPurposePython 3.xCore languageFlaskREST API server & HTML template servingFlask-CORSCross-origin request handlingpathlibCross-platform file path resolutionjsonJSON read/write for processed datacollections.defaultdictAccumulator pattern in ETL pipeline

Data & ETL

TechPurposeCricsheet JSONBall-by-ball match data source (open data)Python ETL pipeline (etl.py)Filters, parses and transforms raw match dataNumPyNumerical operations in analysis notebookPandasData manipulation in analysis notebookJupyter NotebookExploratory data analysisipykernelJupyter kernel support

Frontend

TechPurposeHTML5 / CSS3Single-page dashboard layout & stylingVanilla JavaScript (ES6+)All interactivity, data fetching, DOM renderingChart.js 4.4.1Worm graph, Manhattan chart, Run rate chartCanvas APIAnimated stadium background on landing pageCSS VariablesDark theme design systemGoogle FontsBarlow + Barlow Condensed typographyFetch APIAsync REST API calls to Flask backend


🚀 Getting Started

1. Clone the repo

bashgit clone https://github.com/pranay-44/python-data-analysis-project.git
cd python-data-analysis-project

2. Install dependencies

bashpip install flask flask-cors

3. Download match data

Download the ICC Men's Cricket World Cup JSON pack from Cricsheet.org and extract it to:

data/raw/world_cup_all/

4. Run the ETL pipeline

bashpython etl.py

This processes all raw JSON files and outputs 4 files to data/processed/:


matches.json — match metadata for all 49 India WC matches
deliveries.json — ball-by-ball delivery data
batting.json — per-player batting stats per match
bowling.json — per-player bowling stats per match


5. Start the Flask server

bashpython backend/app.py

6. Open in browser

http://127.0.0.1:5000


📊 Features


Landing page — animated stadium canvas background with CTA buttons
Dashboard — hero scorecard, stat cards, worm/run rate/manhattan chart tabs, match timeline
Match Analysis page — all 49 India matches grouped by World Cup edition (2003–2023) with W/L/NR badges, venue info, and win margins
Click any match → dashboard instantly updates with real batting, bowling, and delivery data for that match
Worm graph — cumulative runs per over for both teams
Manhattan chart — runs scored per over
Run rate chart — over-by-over run rate progression
Timeline — key events (wickets, fours, sixes) from India's innings



📁 Data Source

Ball-by-ball data sourced from Cricsheet.org — a free, open dataset of cricket matches in JSON format. Raw data files are not included in this repository due to size.

Editions covered: 2003 · 2007 · 2011 · 2015 · 2019 · 2023
Total matches: 49 India matches across all editions


🔌 API Endpoints

EndpointDescriptionGET /api/matchesAll 49 India WC matchesGET /api/deliveries/<match_id>Ball-by-ball deliveries for a matchGET /api/batting/<match_id>Batting scorecard for a matchGET /api/bowling/<match_id>Bowling figures for a match


👤 Author

Pranay Bhalerao
BSc Information Technology Student
