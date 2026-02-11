"""Generate JSON files for the website from calculated data."""

import os
import json
import numpy as np
from datetime import datetime

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")


def generate_leaderboard(qualifying):
    """Generate leaderboard.json with all qualifying players."""
    players = []
    for _, row in qualifying.iterrows():
        player = {
            "id": int(row["PLAYER_ID"]),
            "name": row["PLAYER_NAME"],
            "team": row["TEAM_ABBREVIATION"],
            "rank": int(row["RANK"]),
            "gp": int(row["GAMES_PLAYED"]),
            "ppg": float(row["RAW_PPG"]),
            "adjPpg": float(row["ADJ_PPG"]),
            "pointsPlus": int(row["POINTS_PLUS"]),
            "mpg": float(row["MPG"]),
        }

        if "POSITION" in row and not (isinstance(row.get("POSITION"), float) and np.isnan(row.get("POSITION", np.nan))):
            player["position"] = str(row["POSITION"])
        if "JERSEY_NUMBER" in row and not (isinstance(row.get("JERSEY_NUMBER"), float) and np.isnan(row.get("JERSEY_NUMBER", np.nan))):
            jersey = str(row["JERSEY_NUMBER"])
            if jersey.endswith(".0"):
                jersey = jersey[:-2]
            player["jersey"] = jersey
        if "USG_PCT" in row and not (isinstance(row.get("USG_PCT"), float) and np.isnan(row.get("USG_PCT", np.nan))):
            player["usgPct"] = round(float(row["USG_PCT"]) * 100, 1)
        if "TS_PCT" in row and not (isinstance(row.get("TS_PCT"), float) and np.isnan(row.get("TS_PCT", np.nan))):
            player["tsPct"] = round(float(row["TS_PCT"]) * 100, 1)

        players.append(player)

    path = os.path.join(OUTPUT_DIR, "leaderboard.json")
    with open(path, "w") as f:
        json.dump(players, f, indent=2)

    print(f"  Saved leaderboard.json ({len(players)} players)")
    return players


def generate_player_files(qualifying, game_logs_dict, leaderboard):
    """Generate individual player JSON files."""
    players_dir = os.path.join(OUTPUT_DIR, "players")
    os.makedirs(players_dir, exist_ok=True)

    # Build a lookup from leaderboard
    lb_lookup = {p["id"]: p for p in leaderboard}

    count = 0
    for _, row in qualifying.iterrows():
        pid = int(row["PLAYER_ID"])
        player_data = lb_lookup.get(pid, {}).copy()

        # Add game log
        logs = game_logs_dict.get(pid, [])
        # Convert ADJUSTED_PTS to adjPts
        game_log = []
        for g in logs:
            game_log.append({
                "date": g["GAME_DATE"],
                "matchup": g["MATCHUP"],
                "result": g.get("WL", ""),
                "min": g["MIN"],
                "pts": g["PTS"],
                "adjPts": round(g["ADJUSTED_PTS"], 1),
                "pointsPlus": int(g["GAME_POINTS_PLUS"]),
            })

        player_data["gameLog"] = game_log

        path = os.path.join(players_dir, f"{pid}.json")
        with open(path, "w") as f:
            json.dump(player_data, f, indent=2)
        count += 1

    print(f"  Saved {count} player files")


def generate_distribution(qualifying):
    """Generate histogram data for Points+ distribution."""
    values = qualifying["POINTS_PLUS"].values

    # Create bins that cover the full range of values
    min_val = int(np.floor(values.min() / 10) * 10)
    max_val = int(np.ceil(values.max() / 10) * 10)
    bin_edges = list(range(min_val, max_val + 1, 10))
    counts, edges = np.histogram(values, bins=bin_edges)

    bins = []
    for i in range(len(counts)):
        bins.append({
            "min": int(edges[i]),
            "max": int(edges[i + 1]),
            "label": f"{int(edges[i])}-{int(edges[i + 1])}",
            "count": int(counts[i]),
        })

    path = os.path.join(OUTPUT_DIR, "distribution.json")
    with open(path, "w") as f:
        json.dump(bins, f, indent=2)

    print(f"  Saved distribution.json ({len(bins)} bins)")


def generate_metadata(qualifying):
    """Generate metadata about the data generation."""
    meta = {
        "generatedAt": datetime.now().isoformat(),
        "season": "2025-26",
        "asOfDate": "2026-02-10",
        "qualifyingCriteria": {
            "minGames": 20,
            "minMpg": 15.0,
        },
        "totalQualifyingPlayers": len(qualifying),
        "leagueAvgPointsPlus": 100,
    }

    path = os.path.join(OUTPUT_DIR, "metadata.json")
    with open(path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"  Saved metadata.json")


def main(qualifying, game_logs_dict):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Generating JSON files...")
    leaderboard = generate_leaderboard(qualifying)
    generate_player_files(qualifying, game_logs_dict, leaderboard)
    generate_distribution(qualifying)
    generate_metadata(qualifying)
    print("\nAll JSON files generated!")


if __name__ == "__main__":
    from calculate_points_plus import main as calc_main
    qualifying, game_logs_dict, _ = calc_main()
    main(qualifying, game_logs_dict)
