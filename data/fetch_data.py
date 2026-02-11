"""Fetch NBA data from nba_api and save as CSVs."""

import os
import time
import pandas as pd
from nba_api.stats.endpoints import (
    LeagueGameLog,
    LeagueDashTeamStats,
    PlayerIndex,
    LeagueDashPlayerStats,
)

RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")
SEASON = "2025-26"
DELAY = 0.6


def fetch_with_retry(fn, retries=3, **kwargs):
    for attempt in range(retries):
        try:
            result = fn(**kwargs)
            time.sleep(DELAY)
            return result
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** (attempt + 1))
            else:
                raise


def fetch_game_logs():
    print("Fetching player game logs...")
    logs = fetch_with_retry(
        LeagueGameLog,
        season=SEASON,
        player_or_team_abbreviation="P",
        season_type_all_star="Regular Season",
    )
    df = logs.get_data_frames()[0]
    df.to_csv(os.path.join(RAW_DIR, "game_logs.csv"), index=False)
    print(f"  Saved {len(df)} game log rows")
    return df


def fetch_team_stats():
    print("Fetching team advanced stats (DEF_RATING, PACE)...")
    stats = fetch_with_retry(
        LeagueDashTeamStats,
        season=SEASON,
        measure_type_detailed_defense="Advanced",
        season_type_all_star="Regular Season",
    )
    df = stats.get_data_frames()[0]
    df.to_csv(os.path.join(RAW_DIR, "team_stats.csv"), index=False)
    print(f"  Saved {len(df)} team rows")
    return df


def fetch_player_index():
    print("Fetching player index...")
    idx = fetch_with_retry(
        PlayerIndex,
        season=SEASON,
    )
    df = idx.get_data_frames()[0]
    df.to_csv(os.path.join(RAW_DIR, "player_index.csv"), index=False)
    print(f"  Saved {len(df)} player rows")
    return df


def fetch_player_stats():
    print("Fetching player season stats (USG%, TS%)...")
    stats = fetch_with_retry(
        LeagueDashPlayerStats,
        season=SEASON,
        measure_type_detailed_defense="Advanced",
        season_type_all_star="Regular Season",
    )
    df = stats.get_data_frames()[0]
    df.to_csv(os.path.join(RAW_DIR, "player_advanced_stats.csv"), index=False)
    print(f"  Saved {len(df)} player stat rows")
    return df


def main():
    os.makedirs(RAW_DIR, exist_ok=True)
    print(f"Fetching data for {SEASON} season...\n")

    fetch_game_logs()
    fetch_team_stats()
    fetch_player_index()
    fetch_player_stats()

    print("\nAll data fetched successfully!")


if __name__ == "__main__":
    main()
