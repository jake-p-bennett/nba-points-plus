"""Calculate Points+ from raw CSV data."""

import os
import pandas as pd
import numpy as np

RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")

MIN_GAMES = 20
MIN_MPG = 15.0


def parse_opponent(matchup: str) -> str:
    """Extract opponent team abbreviation from matchup string.

    Formats: 'OKC vs. HOU' or 'HOU @ OKC'
    """
    if " vs. " in matchup:
        return matchup.split(" vs. ")[1].strip()
    elif " @ " in matchup:
        return matchup.split(" @ ")[1].strip()
    return ""


def load_data():
    game_logs = pd.read_csv(os.path.join(RAW_DIR, "game_logs.csv"))
    team_stats = pd.read_csv(os.path.join(RAW_DIR, "team_stats.csv"))
    player_index = pd.read_csv(os.path.join(RAW_DIR, "player_index.csv"))
    player_advanced = pd.read_csv(os.path.join(RAW_DIR, "player_advanced_stats.csv"))
    return game_logs, team_stats, player_index, player_advanced


def build_team_lookups(team_stats: pd.DataFrame, game_logs: pd.DataFrame):
    """Build dictionaries for team DEF_RATING and PACE."""
    # Build TEAM_ID -> TEAM_ABBREVIATION mapping from game_logs
    team_id_to_abbr = (
        game_logs[["TEAM_ID", "TEAM_ABBREVIATION"]]
        .drop_duplicates()
        .set_index("TEAM_ID")["TEAM_ABBREVIATION"]
        .to_dict()
    )

    def_rating = {}
    pace = {}

    for _, row in team_stats.iterrows():
        abbr = team_id_to_abbr.get(row["TEAM_ID"], str(row["TEAM_ID"]))
        def_rating[abbr] = row["DEF_RATING"]
        pace[abbr] = row["PACE"]

    league_avg_def = np.mean(list(def_rating.values()))
    league_avg_pace = np.mean(list(pace.values()))

    return def_rating, pace, league_avg_def, league_avg_pace


def calculate(game_logs, team_stats, player_index, player_advanced):
    """Core Points+ calculation."""
    def_rating, pace, league_avg_def, league_avg_pace = build_team_lookups(team_stats, game_logs)

    # Parse opponent from matchup
    game_logs["OPPONENT"] = game_logs["MATCHUP"].apply(parse_opponent)

    # Calculate adjusted points per game
    adjusted_pts = []
    for _, row in game_logs.iterrows():
        opp = row["OPPONENT"]
        raw_pts = row["PTS"]

        opp_def = def_rating.get(opp, league_avg_def)
        opp_pace = pace.get(opp, league_avg_pace)

        # Adjust: harder defense scales up, faster pace scales down
        adj = raw_pts * (league_avg_def / opp_def) * (league_avg_pace / opp_pace)
        adjusted_pts.append(adj)

    game_logs["ADJUSTED_PTS"] = adjusted_pts

    # Aggregate by player
    player_agg = game_logs.groupby("PLAYER_ID").agg(
        PLAYER_NAME=("PLAYER_NAME", "last"),
        TEAM_ABBREVIATION=("TEAM_ABBREVIATION", "last"),
        GAMES_PLAYED=("GAME_ID", "count"),
        TOTAL_PTS=("PTS", "sum"),
        TOTAL_ADJ_PTS=("ADJUSTED_PTS", "sum"),
        TOTAL_MIN=("MIN", "sum"),
    ).reset_index()

    player_agg["RAW_PPG"] = player_agg["TOTAL_PTS"] / player_agg["GAMES_PLAYED"]
    player_agg["ADJ_PPG"] = player_agg["TOTAL_ADJ_PTS"] / player_agg["GAMES_PLAYED"]
    player_agg["MPG"] = player_agg["TOTAL_MIN"] / player_agg["GAMES_PLAYED"]

    # Filter qualifying players
    qualifying = player_agg[
        (player_agg["GAMES_PLAYED"] >= MIN_GAMES) &
        (player_agg["MPG"] >= MIN_MPG)
    ].copy()

    print(f"  {len(qualifying)} qualifying players (>={MIN_GAMES} GP, >={MIN_MPG} MPG)")

    # Calculate Points+
    league_avg_adj_ppg = qualifying["ADJ_PPG"].mean()
    qualifying["POINTS_PLUS"] = (qualifying["ADJ_PPG"] / league_avg_adj_ppg) * 100

    # Sort by Points+ with unrounded adj PPG as tiebreaker
    qualifying = qualifying.sort_values(
        ["POINTS_PLUS", "ADJ_PPG"], ascending=[False, False]
    ).reset_index(drop=True)

    # Round values after sorting
    qualifying["RAW_PPG"] = qualifying["RAW_PPG"].round(1)
    qualifying["ADJ_PPG"] = qualifying["ADJ_PPG"].round(1)
    qualifying["MPG"] = qualifying["MPG"].round(1)
    qualifying["POINTS_PLUS"] = qualifying["POINTS_PLUS"].round(0).astype(int)
    qualifying["RANK"] = qualifying.index + 1

    # Merge player metadata
    if "PERSON_ID" in player_index.columns:
        player_index = player_index.rename(columns={"PERSON_ID": "PLAYER_ID"})

    meta_cols = ["PLAYER_ID"]
    for col in ["POSITION", "HEIGHT", "WEIGHT", "JERSEY_NUMBER"]:
        if col in player_index.columns:
            meta_cols.append(col)

    if len(meta_cols) > 1:
        player_meta = player_index[meta_cols].drop_duplicates(subset=["PLAYER_ID"])
        qualifying = qualifying.merge(player_meta, on="PLAYER_ID", how="left")

    # Merge advanced stats (USG%, TS%)
    adv_cols = ["PLAYER_ID"]
    for col in ["USG_PCT", "TS_PCT"]:
        if col in player_advanced.columns:
            adv_cols.append(col)

    if len(adv_cols) > 1:
        adv_data = player_advanced[adv_cols].drop_duplicates(subset=["PLAYER_ID"])
        qualifying = qualifying.merge(adv_data, on="PLAYER_ID", how="left")

    # Build per-player game logs
    player_game_logs = {}
    for pid in qualifying["PLAYER_ID"].values:
        plogs = game_logs[game_logs["PLAYER_ID"] == pid].copy()
        plogs = plogs.sort_values("GAME_DATE")

        # Compute per-game Points+ (relative to league avg adj ppg)
        plogs["GAME_POINTS_PLUS"] = (plogs["ADJUSTED_PTS"] / league_avg_adj_ppg * 100).round(0).astype(int)

        player_game_logs[int(pid)] = plogs[[
            "GAME_DATE", "MATCHUP", "WL", "MIN", "PTS",
            "ADJUSTED_PTS", "GAME_POINTS_PLUS"
        ]].to_dict("records")

    return qualifying, player_game_logs, league_avg_adj_ppg


def main():
    print("Loading raw data...")
    game_logs, team_stats, player_index, player_advanced = load_data()

    print("Calculating Points+...")
    qualifying, game_logs_dict, league_avg = calculate(
        game_logs, team_stats, player_index, player_advanced
    )

    print(f"\n  League avg adjusted PPG: {league_avg:.1f}")
    print(f"  Top 5:")
    for _, row in qualifying.head(5).iterrows():
        print(f"    {row['RANK']}. {row['PLAYER_NAME']} ({row['TEAM_ABBREVIATION']}) — Points+ {row['POINTS_PLUS']}, PPG {row['RAW_PPG']}")

    return qualifying, game_logs_dict, league_avg


if __name__ == "__main__":
    main()
