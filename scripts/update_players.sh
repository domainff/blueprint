#!/bin/bash

if [ "$(basename "$(pwd)")" != "blueprint" ]; then
    echo "this script must be run from the root directory of the project"
    exit 1
fi
curl "https://api.sleeper.app/v1/players/nfl" > src/data/players.json
git add src/data/players.json
git commit -m "updated players.json via bash script"
git push
