import os
import json
import pandas as pd
import numpy as np
import sqlite3  # === CHANGED SECTION === Added SQLite import

RAW_DIR = "data/raw/world_cup"  # or wherever the unzipped world cup files are
PROCESSED_DIR = "data/processed"

if not os.path.exists(PROCESSED_DIR):
    os.makedirs(PROCESSED_DIR)

# WC editions to include
TARGET_YEARS = [2003, 2007, 2011, 2015, 2019, 2023]

def process_data():
    matches = []
    deliveries = []
    batting = []
    bowling = []

    # ---------- ETL logic (unchanged) ----------
    # … (the whole data‑extraction loop you already have) …
    # -----------------------------------------------------------------
    # (lines that build the four Python lists: matches, deliveries, batting, bowling)
    # -----------------------------------------------------------------
    # Save to SQLite – replaces the previous JSON dump block
    save_to_sqlite(matches, deliveries, batting, bowling)   # === CHANGED SECTION ===
    print("ETL complete. SQLite DB written to data/processed/cricket.db")

# -----------------------------------------------------------------
# New helper: write the four tables to an SQLite database
def save_to_sqlite(matches, deliveries, batting, bowling):
    """Create (or replace) data/processed/cricket.db and fill it."""
    db_path = os.path.join(PROCESSED_DIR, "cricket.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Drop old tables – makes re‑run safe
    cur.executescript("""
        DROP TABLE IF EXISTS matches;
        DROP TABLE IF EXISTS deliveries;
        DROP TABLE IF EXISTS batting;
        DROP TABLE IF EXISTS bowling;
    """)

    # ---------- Table definitions ----------
    cur.executescript("""
        CREATE TABLE matches (
            match_id      TEXT PRIMARY KEY,
            date          TEXT,
            year          INTEGER,
            team1         TEXT,
            team2         TEXT,
            venue         TEXT,
            city          TEXT,
            toss_winner   TEXT,
            toss_decision TEXT,
            winner        TEXT,
            win_margin    TEXT,
            player_of_match TEXT
        );

        CREATE TABLE deliveries (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id          TEXT,
            innings           TEXT,
            over              INTEGER,
            ball              INTEGER,
            batter            TEXT,
            bowler            TEXT,
            runs_bat          INTEGER,
            extras            INTEGER,
            total_runs        INTEGER,
            is_wicket         INTEGER,
            dismissal_kind    TEXT,
            player_dismissed  TEXT,
            FOREIGN KEY(match_id) REFERENCES matches(match_id)
        );

        CREATE TABLE batting (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id          TEXT,
            player            TEXT,
            team              TEXT,
            runs              INTEGER,
            balls             INTEGER,
            fours             INTEGER,
            sixes             INTEGER,
            sr                REAL,
            dismissed         INTEGER,
            dismissal_info    TEXT,
            FOREIGN KEY(match_id) REFERENCES matches(match_id)
        );

        CREATE TABLE bowling (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id          TEXT,
            player            TEXT,
            overs             TEXT,
            runs_conceded     INTEGER,
            wickets           INTEGER,
            economy           REAL,
            FOREIGN KEY(match_id) REFERENCES matches(match_id)
        );
    """)

    # ---------- Insert data ----------
    cur.executemany("""
        INSERT INTO matches
        (match_id, date, year, team1, team2, venue, city,
         toss_winner, toss_decision, winner, win_margin, player_of_match)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """, [
        (
            m["match_id"], m["date"], m["year"], m["team1"], m["team2"],
            m["venue"], m["city"], m["toss_winner"], m["toss_decision"],
            m["winner"], m["win_margin"], m["player_of_match"]
        )
        for m in matches
    ])

    cur.executemany("""
        INSERT INTO deliveries
        (match_id, innings, over, ball, batter, bowler,
         runs_bat, extras, total_runs, is_wicket,
         dismissal_kind, player_dismissed)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """, [
        (
            d["match_id"], d["innings"], d["over"], d["ball"], d["batter"], d["bowler"],
            d["runs_bat"], d["extras"], d["total_runs"], int(d["is_wicket"]),
            d["dismissal_kind"], d["player_dismissed"]
        )
        for d in deliveries
    ])

    cur.executemany("""
        INSERT INTO batting
        (match_id, player, team, runs, balls, fours, sixes,
         sr, dismissed, dismissal_info)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, [
        (
            b["match_id"], b["player"], b["team"], b["runs"], b["balls"],
            b["fours"], b["sixes"], b["sr"], int(b["dismissed"]), b["dismissal_info"]
        )
        for b in batting
    ])

    cur.executemany("""
        INSERT INTO bowling
        (match_id, player, overs, runs_conceded, wickets, economy)
        VALUES (?,?,?,?,?,?)
    """, [
        (
            bw["match_id"], bw["player"], bw["overs"],
            bw["runs_conceded"], bw["wickets"], bw["economy"]
        )
        for bw in bowling
    ])

    conn.commit()
    conn.close()

# -----------------------------------------------------------------
if __name__ == "__main__":
    process_data()
