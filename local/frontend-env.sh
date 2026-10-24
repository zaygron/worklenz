#!/bin/sh
set -eu
cat > /app/build/env-config.js <<EOF
window.VITE_API_URL="${VITE_API_URL}";
window.VITE_SOCKET_URL="${VITE_SOCKET_URL}";
window.VITE_CLIENT_PORTAL_URL="${VITE_CLIENT_PORTAL_URL}";
window.VITE_APP_VERSION="${VITE_APP_VERSION}";
EOF
