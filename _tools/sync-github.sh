#!/usr/bin/env bash
# Push the whole TESERACT project to https://github.com/gireeshkumarreddy/Teseract-creative-studious (public).
# Every push runs .github/workflows/pages.yml, which publishes the built site (teseract-website/dist) at
#   https://gireeshkumarreddy.github.io/Teseract-creative-studious/
#
#   bash _tools/sync-github.sh              # one sync
#   bash _tools/sync-github.sh --loop 20    # sync every 20 minutes until stopped
#
# A build that is halfway through writing dist/ is never pushed: the snapshot waits until no build.py /
# prepare_*.py is running, and is taken again if one started while it was being taken.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_URL="https://github.com/gireeshkumarreddy/Teseract-creative-studious.git"
TRAILER="Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# number of site builds running now (Windows: python build.py / prepare_*.py)
builds() {
  powershell.exe -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | Where-Object { \$_.CommandLine -match 'build\.py|prepare_' } | Measure-Object).Count" 2>/dev/null | tr -d '\r '
}
wait_no_build() {
  local i
  for i in $(seq 1 120); do [ "$(builds)" = "0" ] && return 0; sleep 10; done
  return 1
}
site_ok() {     # the built site passes scripts/check.py with 0 errors
  (cd "$ROOT/teseract-website" && python -I -B scripts/check.py 2>/dev/null) | python -I -c "
import sys, json, re
t = sys.stdin.read(); m = re.search(r'\{\s*\"routes\".*\}', t, re.S)
sys.exit(0 if m and json.loads(m.group(0)).get('errors') == [] else 1)"
}

stage_all() {   # stage while no build runs; again if one started meanwhile; never commit a partial or failing site
  local try left
  for try in 1 2 3 4 5; do
    wait_no_build || echo "warning: a build kept running for 20 min; staging anyway"
    if ! site_ok; then   # the live site keeps its last good version; the rest of the project still syncs
      echo "site check has errors: keeping the last good published site, syncing the rest"
      git -C "$ROOT" add -A -- . ':!teseract-website/dist' 2>&1 | grep -v "LF will be replaced\|CRLF" | sed 's/^/add: /'
      [ "$(builds)" = "0" ] && return 0
      sleep 30; continue
    fi
    git -C "$ROOT" add -A 2>&1 | grep -v "LF will be replaced\|CRLF" | sed 's/^/add: /'
    # every file of the built site must be staged (an add can fail half-way, e.g. on a locked index)
    left="$(git -C "$ROOT" status --porcelain -- teseract-website/dist | grep -c '^??\|^ M\|^ D')"
    if [ "$left" != "0" ]; then echo "warning: $left site file(s) not staged yet, retrying"; sleep 10; continue; fi
    [ "$(builds)" = "0" ] && return 0
    sleep 30
  done
  echo "error: could not stage the whole site; not committing"; return 1
}

sync_once() {
  local stamp n areas
  stamp="$(date '+%d %b %H:%M')"
  cd "$ROOT" || return 1
  stage_all || return 1
  if ! git rev-parse -q --verify HEAD >/dev/null; then
    git commit -q -m "TESERACT Creative Studios: website, brand kit, specs and tools" \
      -m "The whole project folder: teseract-website (the static site generator in scripts/, src/, public/ and the built, checked site in dist/, published by GitHub Pages), brand-kit (logos, app icons, social images, guides, PDF brand guidelines), _ref/specs (owner decisions and content specs) and _tools (QA, capture and this sync script)." \
      -m "$TRAILER" && echo "first commit: $(git ls-files | wc -l | tr -d ' ') files"
  elif ! git diff --cached --quiet; then
    n="$(git diff --cached --name-only | wc -l | tr -d ' ')"
    areas="$(git diff --cached --name-only | awk -F/ '{print ($1=="teseract-website" && NF>2) ? $1"/"$2 : $1}' | sort -u | head -6 | paste -sd ', ' -)"
    git commit -q -m "Auto-sync $stamp: $n file(s) in $areas" -m "$TRAILER" && echo "committed $n file(s)"
  fi
  git push -q -u origin main 2>&1 | grep -v "^remote: *$" | sed 's/^/push: /'
  echo "synced $stamp"
}

git -C "$ROOT" remote get-url origin >/dev/null 2>&1 || git -C "$ROOT" remote add origin "$REPO_URL"
if [ "${1:-}" = "--loop" ]; then
  every="${2:-20}"
  while true; do sync_once; sleep $((every * 60)); done
else
  sync_once
fi
