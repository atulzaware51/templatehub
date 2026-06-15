#!/usr/bin/env bash
# Lightweight search for common secret patterns in the repo (does not rewrite history).
set -e
echo "Searching for potential secret leaks..."
echo
patterns=("AWS_SECRET" "AWS_ACCESS_KEY_ID" "JWT_SECRET" "MONGO_URI" "PASSWORD" "SECRET_KEY" "AKIA")
for p in "${patterns[@]}"; do
  echo "-- Pattern: $p"
  git grep -n --break --heading -I -e "$p" || true
done

echo
echo "If any results appear above, rotate those secrets and remove them from the repo history using 'git filter-repo' or 'git filter-branch'."
