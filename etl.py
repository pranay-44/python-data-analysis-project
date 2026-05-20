import os
import json
import pandas as pd
import numpy as np

RAW_DIR = "data/raw/world_cup" # or wherever the unzipped world cup files are
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
    
    # Try all files in raw/world_cup or raw/odis/all_matches
    # Wait, the jupyter notebook noted they extracted to raw/odis/all_matches but also raw/world_cup. 
    # Let's check both if needed, but let's assume raw/world_cup has them, if not raw/odis/all_matches
    
    dirs_to_check = ["data/raw/world_cup", "data/raw/odis/all_matches"]
    files = []
    for d in dirs_to_check:
        if os.path.exists(d):
            files.extend([os.path.join(d, f) for f in os.listdir(d) if f.endswith('.json')])
            break # just use the first valid one

    india_wc_matches = []
    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                match = json.load(f)
            
            info = match.get("info", {})
            teams = info.get("teams", [])
            event = info.get("event", {}).get("name", "").lower()
            date_str = info.get("dates", [""])[0]
            if not date_str: continue
            
            year = int(date_str[:4])
            
            # Check criteria
            if "India" in teams and year in TARGET_YEARS and "world cup" in event:
                india_wc_matches.append(match)
        except Exception as e:
            continue
            
    print(f"Found {len(india_wc_matches)} India WC Matches.")
    
    for match in india_wc_matches:
        info = match["info"]
        match_id = info["dates"][0] + "-" + info["teams"][0][:3] + "-vs-" + info["teams"][1][:3]
        
        # --- MATCH META ---
        matches.append({
            "match_id": match_id,
            "date": info["dates"][0],
            "year": int(info["dates"][0][:4]),
            "team1": info["teams"][0],
            "team2": info["teams"][1],
            "venue": info.get("venue", ""),
            "city": info.get("city", ""),
            "toss_winner": info.get("toss", {}).get("winner", ""),
            "toss_decision": info.get("toss", {}).get("decision", ""),
            "winner": info.get("outcome", {}).get("winner", ""),
            "win_margin": f"{info.get('outcome', {}).get('by', {}).get('runs', '')} runs" if "runs" in info.get("outcome", {}).get("by", {}) else f"{info.get('outcome', {}).get('by', {}).get('wickets', '')} wickets",
            "player_of_match": info.get("player_of_match", [""])[0] if info.get("player_of_match") else ""
        })
        
        # --- DELIVERIES, BATTING, BOWLING ---
        # Initialize match stats containers
        match_batsmen = {}
        match_bowlers = {}
        
        innings_data = match.get("innings", [])
        for inn_idx, inning in enumerate(innings_data):
            if "team" in inning and "overs" in inning:
                # Newer JSON format (e.g., v1.4)
                inn_data = inning
                team_batting = inn_data["team"]
            else:
                # Older JSON format (v0.9)
                inn_name = list(inning.keys())[0]
                inn_data = inning[inn_name]
                team_batting = inn_data.get("team", inn_name)
            
            overs = inn_data.get("overs", [])
            for over in overs:
                o_num = over["over"]
                for b_idx, d in enumerate(over["deliveries"]):
                    batter = d.get("batter", "")
                    bowler = d.get("bowler", "")
                    runs_bat = d.get("runs", {}).get("batter", 0)
                    runs_extras = d.get("runs", {}).get("extras", 0)
                    runs_total = d.get("runs", {}).get("total", 0)
                    wickets = d.get("wickets", [])
                    is_wicket = len(wickets) > 0
                    dismissal_kind = wickets[0].get("kind", "") if is_wicket else ""
                    player_dismissed = wickets[0].get("player_out", "") if is_wicket else ""
                    
                    # Log Delivery
                    deliveries.append({
                        "match_id": match_id,
                        "innings": team_batting,
                        "over": o_num,
                        "ball": b_idx + 1,
                        "batter": batter,
                        "bowler": bowler,
                        "runs_bat": runs_bat,
                        "extras": runs_extras,
                        "total_runs": runs_total,
                        "is_wicket": is_wicket,
                        "dismissal_kind": dismissal_kind,
                        "player_dismissed": player_dismissed
                    })
                    
                    # Accumulate Batting
                    if batter not in match_batsmen:
                        match_batsmen[batter] = {"team": team_batting, "runs": 0, "balls": 0, "4s": 0, "6s": 0, "dismissed": False, "dismissal_info": ""}
                    
                    # Legal delivery for batter? Wides don't count as balls faced, no balls do count in ODIs sometimes, but standard is wide=no ball faced, no ball=ball faced.
                    # Actually standard is wides don't count as ball faced, no balls DO count.
                    if "wides" not in d.get("extras", {}):
                        match_batsmen[batter]["balls"] += 1
                    
                    match_batsmen[batter]["runs"] += runs_bat
                    if runs_bat == 4: match_batsmen[batter]["4s"] += 1
                    if runs_bat == 6: match_batsmen[batter]["6s"] += 1
                    
                    if is_wicket and player_dismissed == batter:
                        match_batsmen[batter]["dismissed"] = True
                        match_batsmen[batter]["dismissal_info"] = dismissal_kind
                    
                    # Accumulate Bowling
                    if bowler not in match_bowlers:
                        match_bowlers[bowler] = {"team": "Unknown", "runs_conceded": 0, "balls_bowled": 0, "wickets": 0}
                    
                    # Legal ball for bowler? Wides and no balls don't count as legal deliveries for over count
                    is_legal = True
                    if "wides" in d.get("extras", {}) or "noballs" in d.get("extras", {}):
                        is_legal = False
                    
                    if is_legal:
                        match_bowlers[bowler]["balls_bowled"] += 1
                    
                    match_bowlers[bowler]["runs_conceded"] += runs_total
                    if is_wicket and dismissal_kind not in ["run out", "retired hurt", "obstructing the field"]:
                        match_bowlers[bowler]["wickets"] += 1
                        
        for p, stat in match_batsmen.items():
            batting.append({
                "match_id": match_id,
                "player": p,
                "team": stat["team"],
                "runs": stat["runs"],
                "balls": stat["balls"],
                "fours": stat["4s"],
                "sixes": stat["6s"],
                "sr": round((stat["runs"]/stat["balls"])*100, 2) if stat["balls"] > 0 else 0,
                "dismissed": stat["dismissed"],
                "dismissal_info": stat["dismissal_info"]
            })
            
        for p, stat in match_bowlers.items():
            bowling.append({
                "match_id": match_id,
                "player": p,
                "overs": f"{stat['balls_bowled']//6}.{stat['balls_bowled']%6}",
                "runs_conceded": stat["runs_conceded"],
                "wickets": stat["wickets"],
                "economy": round(stat["runs_conceded"] / (stat['balls_bowled']/6), 2) if stat['balls_bowled'] > 0 else 0
            })

    # Save to JSON
    with open(os.path.join(PROCESSED_DIR, "matches.json"), "w") as f:
        json.dump(matches, f)
    with open(os.path.join(PROCESSED_DIR, "deliveries.json"), "w") as f:
        json.dump(deliveries, f)
    with open(os.path.join(PROCESSED_DIR, "batting.json"), "w") as f:
        json.dump(batting, f)
    with open(os.path.join(PROCESSED_DIR, "bowling.json"), "w") as f:
        json.dump(bowling, f)
        
    print("ETL complete. JSON files written to data/processed.")

if __name__ == "__main__":
    process_data()
