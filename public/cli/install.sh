#!/usr/bin/env sh
# KRONVEX Official CLI Installer for macOS & Linux
# Usage: curl -fsSL https://kronvex.org/cli/install.sh | sh
set -eu

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js >= 18 is required. Install from https://nodejs.org/" >&2
  exit 1
fi

INSTALL_DIR="${HOME}/.kronvex/bin"
mkdir -p "${INSTALL_DIR}"

CLI_PATH="${INSTALL_DIR}/kronvex.mjs"
echo "Downloading KRONVEX CLI v1.0.0 from https://kronvex.org/cli/kronvex.mjs ..."
curl -fsSL "https://kronvex.org/cli/kronvex.mjs" -o "${CLI_PATH}"
chmod +x "${CLI_PATH}"

ln -sf "${CLI_PATH}" "${INSTALL_DIR}/kronvex"
ln -sf "${CLI_PATH}" "${INSTALL_DIR}/kvx"

echo ""
echo "[OK] KRONVEX CLI installed to ${INSTALL_DIR}"
echo "     Add to PATH (if not present): export PATH=\"\$HOME/.kronvex/bin:\$PATH\""
echo "     Try now: kronvex doctor"
