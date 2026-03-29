#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "mailclaw launcher missing target entrypoint" >&2
  exit 1
fi

TARGET_PATH="$1"
shift

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

find_node_binary() {
  local -a candidates=()
  local candidate=""

  if command -v node >/dev/null 2>&1; then
    candidates+=("$(command -v node)")
  fi

  for candidate in \
    /opt/homebrew/opt/node@22/bin/node \
    /usr/local/opt/node@22/bin/node \
    /opt/homebrew/bin/node \
    /usr/local/bin/node
  do
    if [ -x "$candidate" ]; then
      candidates+=("$candidate")
    fi
  done

  for candidate in "${candidates[@]}"; do
    if "$candidate" -e 'const major = Number(process.versions.node.split(".")[0]); process.exit(Number.isFinite(major) && major >= 22 ? 0 : 1)' >/dev/null 2>&1; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

NODE_BIN="$(find_node_binary || true)"

if [ -z "$NODE_BIN" ]; then
  CURRENT_VERSION="unknown"
  CURRENT_PATH="node"
  if command -v node >/dev/null 2>&1; then
    CURRENT_VERSION="$(node -p 'process.version' 2>/dev/null || printf 'unknown')"
    CURRENT_PATH="$(command -v node)"
  fi

  echo >&2
  echo "MailClaw requires Node.js 22+ because it uses the built-in node:sqlite module." >&2
  echo "Current runtime: ${CURRENT_VERSION} (${CURRENT_PATH})" >&2
  echo "Install Node 22+ or place a Node 22 binary earlier in PATH and retry." >&2
  exit 1
fi

exec "$NODE_BIN" "$PACKAGE_DIR/$TARGET_PATH" "$@"
