# SENTRIX — Troubleshooting & Diagnostics Guide

**Scope:** Common operational failure modes, root-cause analyses, and verified remediation steps.  

---

## 1. Quick Diagnostic Checklist

When experiencing unexpected behavior, run through these quick diagnostic commands:

```bash
# 1. Check Backend Health & Service Readiness
curl -s http://127.0.0.1:8000/healthz

# 2. Check Database Connectivity (SELECT 1)
python -c "from app.storage.database import get_session_factory; from sqlalchemy import text; s = get_session_factory()(); print('DB Connected:', s.execute(text('SELECT 1')).scalar() == 1); s.close()"

# 3. Check ML Model Availability & Pipeline Deserialization
python -c "from app.detection.model_loader import load_runtime_model; m = load_runtime_model(); print('Runtime Model Loaded:', type(m).__name__)"

# 4. Check Frontend Ingress Proxy to Backend
curl -s http://127.0.0.1:3000/api/proxy/api/v1/health
```

---

## 2. Common Issues & Remediations

### Issue 1: Overview Tab Shows "Potential Attack Flagged" While Simulation is OFF
- **Symptom:** The Overview banner displays red `POTENTIAL ATTACK FLAGGED` with 0 PPS and no active traffic simulation.
- **Root Cause:** Historical simulation alerts remained in `status: "active"` in the relational database from an interrupted or uncommitted test run.
- **Resolution:**
  - SENTRIX automatically purges inactive simulation alerts on application startup and during simulation pause/stop calls via `resolve_inactive_simulation_alerts()`.
  - To manually reset alert statuses in the database:
    ```bash
    python -c "from app.storage.database import get_session_factory; from app.storage.repositories import AlertRepository; s = get_session_factory()(); AlertRepository(s).resolve_inactive_simulation_alerts(); s.commit(); s.close(); print('Alerts reconciled')"
    ```

---

### Issue 2: `ModelNotFoundError` or `IncompatibleModelError`
- **Symptom:** Backend startup fails with:
  `ModelNotFoundError: Approved runtime model not found at 'models/approved_model.joblib'`
  or
  `IncompatibleModelError: Model expects X features, but schema 1.0.0 defines 14.`
- **Root Cause:** The model artifact is missing or was trained with a different number of features than the 14 defined in `backend/app/features/definitions.py`.
- **Resolution:**
  1. Verify the approved model exists at `models/approved_model.joblib` or `models/rf-1.0.0/model.joblib`.
  2. If missing, copy the versioned model:
     ```bash
     cp models/rf-1.0.0/model.joblib models/approved_model.joblib
     ```
  3. Validate runtime model loading:
     ```bash
     python -c "from app.detection.model_loader import load_runtime_model; m = load_runtime_model(); print('Model verified:', type(m).__name__)"
     ```

---

### Issue 3: Port 8000 or 3000 Already in Use
- **Symptom:** Uvicorn fails with `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000): address already in use`.
- **Resolution:**
  - **On Windows (PowerShell):**
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
    ```
  - **On Linux / macOS:**
    ```bash
    fuser -k 8000/tcp
    ```

---

### Issue 4: HTTP 401 Unauthorized on API Requests
- **Symptom:** Browser or curl receives `{"detail":"Invalid or missing authentication credentials"}` with HTTP status 401.
- **Root Cause:** `API_AUTH_REQUIRED=true` is set in `.env`, but requests do not include the `Authorization: Bearer <TOKEN>` header.
- **Resolution:**
  1. Inspect `API_AUTH_TOKEN` in `.env`.
  2. In local development, you can set `API_AUTH_REQUIRED=false` in `.env` to disable token requirements.
  3. In production, ensure both backend and frontend use identical `API_AUTH_TOKEN` values.
  4. Note that `/healthz` and root `/` endpoints are unauthenticated specifically for container and platform health checks.

---

### Issue 5: CORS Errors in Web Console
- **Symptom:** Browser console logs: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`.
- **Resolution:**
  1. Verify that `NEXT_PUBLIC_USE_PROXY=true` in `frontend/.env.local`. This routes all requests through the Next.js server-side proxy (`/api/proxy/[...path]`), completely eliminating browser CORS issues and hiding tokens from users.
  2. If connecting directly, add your frontend origin to `CORS_ORIGINS` in `.env`:
     ```env
     CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
     ```

---

### Issue 6: SQLite `database is locked`
- **Symptom:** `OperationalError: database is locked` occurs under high write concurrency.
- **Root Cause:** SQLite default file locking limits concurrent write transactions.
- **Resolution:**
  1. Ensure Uvicorn is running with a single worker process (`--workers 1`) when using SQLite.
  2. For high-volume multi-worker production deployments, migrate to PostgreSQL by updating `DATABASE_URL` in `.env`:
     ```env
     DATABASE_URL=postgresql+psycopg2://sentrix:securepass@localhost:5432/sentrix
     ```

---

### Issue 7: Supabase `FATAL: (EMAXCONNSESSION) max clients reached in session mode`
- **Symptom:** Backend API calls fail with:
  `psycopg2.OperationalError: connection to server at "aws-0-ap-south-1.pooler.supabase.com", port 5432 failed: FATAL: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15`
- **Root Cause:** Connecting to Supabase pooler on port **5432** (Session Mode) holds dedicated database connections. Supabase free-tier strictly limits session mode to 15 concurrent clients. When background workers, migrations, and frontend polling run concurrently, the 15-connection ceiling is exceeded.
- **Resolution:**
  1. In `.env`, change the Supabase pooler port from `5432` to **`6543`** (Transaction Mode):
     ```env
     DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
     ```
  2. In `backend/app/storage/database.py`, ensure the PostgreSQL engine uses conservative connection pooling (`pool_size=3`, `max_overflow=2`, `pool_pre_ping=True`, `pool_recycle=300`).
  3. Note: Use port `5432` only when running schema migrations (`alembic upgrade head`) if required by the cloud pooler.

---

### Issue 8: Windows Node.js `EPERM: operation not permitted, mkdir ...` during `npm run build`
- **Symptom:** Next.js static prerendering fails on Windows with `Error: EPERM: operation not permitted, mkdir '.../.next/server/app/...'`.
- **Root Cause:** The Windows file indexer, antivirus, or concurrent multi-worker prerendering temporarily locks newly created segment directories inside `.next`.
- **Resolution:**
  1. Clean the build directory and retry the build:
     ```powershell
     Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
     npm run build --prefix frontend
     ```
  2. If the issue persists, run with single-worker build mode:
     ```powershell
     $env:NEXT_BUILD_WORKERS="1"
     npm run build --prefix frontend
     ```
