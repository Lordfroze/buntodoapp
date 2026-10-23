#!/usr/bin/env bash
set +e

LOGDIR="/private/var/folders/j2/ksgvyp4j7494vrhjt6pf7rcr0000gn/T/opencode"
mkdir -p "$LOGDIR"
BACKEND_LOG="$LOGDIR/todoapp-backend.log"
CURL_LOG="$LOGDIR/todoapp-curl.log"

echo "=== VERIFICATION START: $(date) ==="
echo

echo "=== SECTION 1: VERSIONS ==="
echo "bun: $(bun --version 2>&1)"
echo "node: $(node --version 2>&1)"
echo "mysql: $(mysql --version 2>&1)"
mysqladmin -u root ping 2>&1 && echo "---MYSQL_PING: OK---" || echo "---MYSQL_PING: FAIL---"
mysql -u root -e "SELECT 1" 2>&1 && echo "---MYSQL_SELECT1: OK---" || echo "---MYSQL_SELECT1: FAIL---"
echo

echo "=== SECTION 2: BACKEND INSTALL ==="
cd /Users/yoga/1.dev/todoappbun/backend
bun install 2>&1
echo "---EXIT:$?---"
echo

echo "=== SECTION 3: BACKEND TYPECHECK ==="
bun run typecheck 2>&1
echo "---EXIT:$?---"
echo

echo "=== SECTION 4: FRONTEND INSTALL ==="
cd /Users/yoga/1.dev/todoappbun/frontend
bun install 2>&1
echo "---EXIT:$?---"
echo

echo "=== SECTION 5: FRONTEND CHECK ==="
bun run check 2>&1
echo "---EXIT:$?---"
echo

echo "=== SECTION 6: FRONTEND BUILD ==="
bun run build 2>&1
echo "---EXIT:$?---"
echo

# Check if mysql is reachable
MYSQL_OK=0
if mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
  MYSQL_OK=1
fi
if [ "$MYSQL_OK" -eq 1 ]; then
  echo "=== SECTION 7: DB CREATE/MIGRATE/SEED ==="
  cd /Users/yoga/1.dev/todoappbun/backend
  bun run db:create 2>&1
  echo "---DBCREATE_EXIT:$?---"
  bun run db:migrate 2>&1
  echo "---DBMIGRATE_EXIT:$?---"
  bun run db:seed 2>&1
  echo "---DBSEED_EXIT:$?---"
  echo
else
  echo "=== SECTION 7: DB SKIPPED (MySQL NOT REACHABLE) ==="
  echo
fi

echo "=== SECTION 8: E2E API TESTS ==="
if [ "$MYSQL_OK" -eq 1 ]; then
  cd /Users/yoga/1.dev/todoappbun/backend
  rm -f /tmp/cookies.txt /tmp/cookies2.txt "$BACKEND_LOG"
  echo "Starting backend..."
  nohup bun run src/index.ts > "$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
  echo "BACKEND_PID:$BACKEND_PID"
  echo "Waiting for server..."
  for i in $(seq 1 30); do
    sleep 1
    if curl -s "http://localhost:3000/" >/dev/null 2>&1; then
      echo "Server is up after $i seconds"
      break
    fi
    if [ $i -eq 30 ]; then
      echo "Server failed to start"
    fi
  done
  echo "---"

  echo "1) Register user A (john@todoapp.test):"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X POST "http://localhost:3000/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"John Test","email":"john@todoapp.test","password":"password123"}' \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "2) GET /api/auth/me (user A):"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    "http://localhost:3000/api/auth/me" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "3) POST /api/todos (create):"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X POST "http://localhost:3000/api/auth/me" 2>/dev/null >/dev/null # no wait
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X POST "http://localhost:3000/api/todos" \
    -H "Content-Type: application/json" \
    -d '{"title":"Learn Elysia","description":"Test todo"}' \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "4) GET /api/todos (list):"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    "http://localhost:3000/api/todos" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1 | tee /tmp/todos_list.json
  echo "---"
  
  # Extract first todo id
  TODO_ID=$(cat /tmp/todos_list.json | grep -B1 -A5 '"id"' | grep '"id"' | head -1 | sed 's/.*"id":\s*"\([^"]*\)".*/\1/')
  echo "TODO_ID:$TODO_ID"
  echo "---"

  echo "5) PATCH /api/todos/:id (toggle):"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X PATCH "http://localhost:3000/api/todos/$TODO_ID" \
    -H "Content-Type: application/json" \
    -d '{"isCompleted":true}' \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "6) GET /api/todos/:id:"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    "http://localhost:3000/api/todos/$TODO_ID" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "7) DELETE /api/todos/:id:"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X DELETE "http://localhost:3000/api/todos/$TODO_ID" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "8) POST /api/auth/logout:"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X POST "http://localhost:3000/api/auth/logout" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "9) GET /api/auth/me after logout (expect 401):"
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    "http://localhost:3000/api/auth/me" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "10) GET /api/todos without cookie (expect 401):"
  curl -s "http://localhost:3000/api/todos" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  # Create another todo for user A for isolation test
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"john@todoapp.test","password":"password123"}' \
    -w "\n---HTTP:%{http_code}---\n" >/tmp/login_a.txt 2>&1
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    -X POST "http://localhost:3000/api/todos" \
    -H "Content-Type: application/json" \
    -d '{"title":"User A Todo","description":"Private"}' \
    -w "\n---HTTP:%{http_code}---\n" >/tmp/a_create.txt 2>&1
  curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
    "http://localhost:3000/api/todos" \
    -w "\n---HTTP:%{http_code}---\n" | tee /tmp/todos_a.json >/dev/null 2>&1
  TODO_A_ID=$(cat /tmp/todos_a.json | grep -B1 -A5 '"title":\s*"User A Todo"' | grep '"id"' | head -1 | sed 's/.*"id":\s*"\([^"]*\)".*/\1/')

  echo "11) Register user B (jane@todoapp.test):"
  curl -s -c /tmp/cookies2.txt -b /tmp/cookies2.txt \
    -X POST "http://localhost:3000/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Jane Test","email":"jane@todoapp.test","password":"password123"}' \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "12) User B cannot GET user A's todo (expect 404):"
  curl -s -c /tmp/cookies2.txt -b /tmp/cookies2.txt \
    "http://localhost:3000/api/todos/$TODO_A_ID" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "13) User B cannot PATCH user A's todo (expect 404):"
  curl -s -c /tmp/cookies2.txt -b /tmp/cookies2.txt \
    -X PATCH "http://localhost:3000/api/todos/$TODO_A_ID" \
    -H "Content-Type: application/json" \
    -d '{"isCompleted":true}' \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "14) User B cannot DELETE user A's todo (expect 404):"
  curl -s -c /tmp/cookies2.txt -b /tmp/cookies2.txt \
    -X DELETE "http://localhost:3000/api/todos/$TODO_A_ID" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "15) User B's todos list must not include user A's todo:"
  curl -s -c /tmp/cookies2.txt -b /tmp/cookies2.txt \
    "http://localhost:3000/api/todos" \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "16) Duplicate email registration should return 409:"
  curl -s \
    -X POST "http://localhost:3000/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"John Dup","email":"john@todoapp.test","password":"password123"}' \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "17) Bad login should return 401:"
  curl -s \
    -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"john@todoapp.test","password":"wrong"}' \
    -w "\n---HTTP:%{http_code}---\n" 2>&1
  echo "---"

  echo "Stopping backend (PID:$BACKEND_PID)..."
  kill $BACKEND_PID 2>&1; sleep 2; kill -9 $BACKEND_PID 2>/dev/null
else
  echo "SKIPPED (MySQL not reachable)"
fi

echo
echo "=== VERIFICATION END: $(date) ==="
