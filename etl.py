import os
import json
from collections import defaultdict

RAW_DIR = "data/raw/world_cup_all"
PROCESSED_DIR = "data/processed"

if not os.path.exists(PROCESSED_DIR):
    os.makedirs(PROCESSED_DIR)

TARGET_YEARS = {'2002/03', '2006/07', '2010/11', '2014/15', '2019', '2023/24'}

YEAR_DISPLAY = {
    '2002/03': '2003',
    '2006/07': '2007',
    '2010/11': '2011',
    '2014/15': '2015',
    '2019':    '2019',
    '2023/24': '2023',
}


def process_data():
    matches = []
    deliveries = []
    batting = []
    bowling = []

    file_count = 0
    skipped_count = 0

    for root, _, files in os.walk(RAW_DIR):
        for fname in files:
            if not fname.lower().endswith('.json'):
                continue
            file_count += 1
            path = os.path.join(root, fname)

            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if 'info' not in data:
                skipped_count += 1
                continue

            meta  = data.get("info", {})
            teams = meta.get("teams", [])

            # ── Filter 1: India must be playing ──
            if "India" not in teams:
                skipped_count += 1
                continue

            # ── Filter 2: Must be a target World Cup season ──
            raw_year = str(meta.get("season", ""))
            if raw_year not in TARGET_YEARS:
                skipped_count += 1
                continue

            display_year = YEAR_DISPLAY.get(raw_year, raw_year)

            # ── Build match_id ──
            date_str = meta.get("dates", [None])[0] or "unknown"
            team1    = teams[0] if len(teams) > 0 else "unknown"
            team2    = teams[1] if len(teams) > 1 else "unknown"
            match_id = f"{date_str}-{team1.replace(' ', '-')}-vs-{team2.replace(' ', '-')}"

            toss    = meta.get("toss", {})
            outcome = meta.get("outcome", {})

            match_row = {
                "match_id":        match_id,
                "date":            date_str,
                "year":            display_year,
                "season":          raw_year,
                "team1":           team1,
                "team2":           team2,
                "venue":           meta.get("venue"),
                "city":            meta.get("city"),
                "toss_winner":     toss.get("winner"),
                "toss_decision":   toss.get("decision"),
                "winner":          outcome.get("winner"),
                "win_margin": (
                    outcome.get("by", {}).get("runs")
                    or outcome.get("by", {}).get("wickets")
                ),
                "player_of_match": meta.get("player_of_match"),
            }
            matches.append(match_row)

            # ── Accumulators for batting / bowling ──
            batting_stats = defaultdict(lambda: defaultdict(lambda: {
                "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "dismissed": False
            }))
            bowling_stats = defaultdict(lambda: defaultdict(lambda: {
                "balls": 0, "runs_conceded": 0, "wickets": 0
            }))

            # ── Deliveries (flat Cricsheet format) ──
            for inn in data.get("innings", []):
                if not isinstance(inn, dict):
                    continue

                batting_team = inn.get("team")
                bowling_team = team2 if batting_team == team1 else team1

                for over_obj in inn.get("overs", []):
                    if not isinstance(over_obj, dict):
                        continue
                    over_num = over_obj.get("over")

                    for delivery in over_obj.get("deliveries", []):
                        if not isinstance(delivery, dict):
                            continue

                        runs_info        = delivery.get("runs", {})
                        runs_bat         = runs_info.get("batter", 0)
                        extras           = runs_info.get("extras", 0)
                        total            = runs_info.get("total", 0)
                        wickets          = delivery.get("wickets", [])
                        is_wicket        = int(bool(wickets))
                        dismissal_kind   = wickets[0].get("kind")       if wickets else None
                        player_dismissed = wickets[0].get("player_out") if wickets else None
                        batter           = delivery.get("batter")
                        bowler           = delivery.get("bowler")

                        deliveries.append({
                            "match_id":         match_id,
                            "innings":          batting_team,
                            "over":             over_num,
                            "ball":             delivery.get("ball"),
                            "batter":           batter,
                            "bowler":           bowler,
                            "runs_bat":         runs_bat,
                            "extras":           extras,
                            "total_runs":       total,
                            "is_wicket":        is_wicket,
                            "dismissal_kind":   dismissal_kind,
                            "player_dismissed": player_dismissed,
                        })

                        # accumulate batting
                        b = batting_stats[batting_team][batter]
                        b["runs"]  += runs_bat
                        b["balls"] += 1
                        if runs_bat == 4: b["fours"] += 1
                        if runs_bat == 6: b["sixes"] += 1
                        if is_wicket and player_dismissed == batter:
                            b["dismissed"] = True

                        # accumulate bowling
                        bw = bowling_stats[bowling_team][bowler]
                        bw["balls"]         += 1
                        bw["runs_conceded"] += total
                        if is_wicket and dismissal_kind not in (
                            "run out", "retired hurt", "obstructing the field"
                        ):
                            bw["wickets"] += 1

            # ── Flatten batting ──
            for team, players in batting_stats.items():
                for player, s in players.items():
                    sr = round((s["runs"] / s["balls"]) * 100, 2) if s["balls"] else 0
                    batting.append({
                        "match_id":  match_id,
                        "player":    player,
                        "team":      team,
                        "runs":      s["runs"],
                        "balls":     s["balls"],
                        "fours":     s["fours"],
                        "sixes":     s["sixes"],
                        "sr":        sr,
                        "dismissed": int(s["dismissed"]),
                    })

            # ── Flatten bowling ──
            for team, bowlers in bowling_stats.items():
                for player, s in bowlers.items():
                    overs   = f"{s['balls'] // 6}.{s['balls'] % 6}"
                    economy = round((s["runs_conceded"] / s["balls"]) * 6, 2) if s["balls"] else 0
                    bowling.append({
                        "match_id":      match_id,
                        "player":        player,
                        "team":          team,
                        "overs":         overs,
                        "runs_conceded": s["runs_conceded"],
                        "wickets":       s["wickets"],
                        "economy":       economy,
                    })

    # ── Summary ──
    print(f"\nFiles scanned    : {file_count}")
    print(f"Files skipped    : {skipped_count}")
    print(f"Matches kept     : {len(matches)}")
    print(f"Deliveries       : {len(deliveries)}")
    print(f"Batting rows     : {len(batting)}")
    print(f"Bowling rows     : {len(bowling)}")

    if matches:
        years_found = sorted({m['year'] for m in matches})
        opponents   = sorted({
            (m['team2'] if m['team1'] == 'India' else m['team1'])
            for m in matches
        })
        print(f"WC editions      : {', '.join(years_found)}")
        print(f"Opponents        : {', '.join(opponents)}")
        print(f"\nMatches per edition:")
        for y in years_found:
            count = sum(1 for m in matches if m['year'] == y)
            print(f"  {y} : {count} matches")

    # ── Write JSON ──
    out_files = {
        "matches.json":    matches,
        "deliveries.json": deliveries,
        "batting.json":    batting,
        "bowling.json":    bowling,
    }
    for out_fname, out_data in out_files.items():
        out_path = os.path.join(PROCESSED_DIR, out_fname)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(out_data, f)
        size_kb = os.path.getsize(out_path) // 1024
        print(f"Wrote {out_fname:<22} ({size_kb} KB)")


if __name__ == "__main__":
    process_data()