import json
import sys


def convert(input_path: str, output_path: str) -> None:
    with open(input_path, "r") as f:
        data = json.load(f)

    mapping = {
        str(item["sleeperBotId"]): item["playerId"]
        for item in data["items"]
        if "sleeperBotId" in item and "playerId" in item
    }

    with open(output_path, "w") as f:
        json.dump(mapping, f, indent=2)

    print(f"Wrote {len(mapping)} entries to {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_players.py <input.json> <output.json>")
        sys.exit(1)

    convert(sys.argv[1], sys.argv[2])