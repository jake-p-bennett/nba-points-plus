#!/bin/bash
# Update Points+ data locally and push to GitHub.
# Intended to be run by launchd on a daily schedule.

set -e

PROJECT_DIR="/Users/jacobbennett/Desktop/portfolio-projects/nba-dashboard"
PYTHON="/opt/miniconda3/bin/python3"
GIT="/opt/homebrew/bin/git"
LOG_FILE="$PROJECT_DIR/scripts/update-data.log"

# Log start
echo "=== Update started at $(date) ===" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Pull latest changes first
$GIT pull --ff-only >> "$LOG_FILE" 2>&1

# Fetch data
echo "Fetching data..." >> "$LOG_FILE"
$PYTHON data/fetch_data.py >> "$LOG_FILE" 2>&1

# Calculate Points+ and generate JSON
echo "Calculating Points+ and generating JSON..." >> "$LOG_FILE"
$PYTHON -c "
import sys
sys.path.insert(0, 'data')
from calculate_points_plus import main as calc_main
from generate_json import main as gen_main
qualifying, game_logs_dict, _ = calc_main()
gen_main(qualifying, game_logs_dict)
" >> "$LOG_FILE" 2>&1

# Copy data to web
echo "Copying data to web..." >> "$LOG_FILE"
rm -rf web/public/data
cp -r data/output web/public/data

# Commit and push if changed
$GIT add web/public/data/
if $GIT diff --staged --quiet; then
    echo "No data changes detected." >> "$LOG_FILE"
else
    $GIT commit -m "Update Points+ data ($(date +%Y-%m-%d))" >> "$LOG_FILE" 2>&1
    $GIT push >> "$LOG_FILE" 2>&1
    echo "Data pushed successfully." >> "$LOG_FILE"
fi

echo "=== Update finished at $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
