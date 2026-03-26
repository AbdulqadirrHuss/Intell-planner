#!/bin/bash
# Smart git push — auto-detects the correct local proxy port if it has rotated.
REPO="AbdulqadirrHuss/Intell-planner"
BRANCH="master"

push_with_port() {
    local port=$1
    git remote set-url origin "http://local_proxy@127.0.0.1:${port}/git/${REPO}"
    git push -u origin "$BRANCH"
}

# Try current port first
CURRENT=$(git remote get-url origin | grep -oP '127\.0\.0\.1:\K\d+')
echo "→ Trying port $CURRENT..."
if push_with_port "$CURRENT"; then
    echo "✓ Pushed to master (port $CURRENT)"
    exit 0
fi

# Port stale — scan localhost listeners for the new proxy port
echo "✗ Port $CURRENT failed. Scanning for new proxy port..."
PORTS=$(ss -tlnp 2>/dev/null | grep '127\.0\.0\.1' | grep -oP '127\.0\.0\.1:\K\d+' | sort -n)

for PORT in $PORTS; do
    [ "$PORT" = "$CURRENT" ] && continue
    echo "→ Trying port $PORT..."
    if push_with_port "$PORT" 2>/dev/null; then
        echo "✓ Pushed to master (new port $PORT — remote updated)"
        exit 0
    fi
done

echo "✗ ERROR: Push failed. No working proxy port found."
exit 1
