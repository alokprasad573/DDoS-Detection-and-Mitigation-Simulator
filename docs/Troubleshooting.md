# SENTRIX — Troubleshooting & Diagnostics Guide

**Scope:** Common operational failure modes, root-cause analyses, and verified remediation steps.

---

## 1. Quick Diagnostic Checklist

When experiencing unexpected behavior, run through these quick diagnostic commands:

```bash
# 1. Check Backend Health
curl -s http://127.0.0.1:8000/api/v1/health

# 2. Check Database Connectivity
python -c "from app.storage.database import check_db_health; print(check_db_health())"

# 3. Check ML Model Availability & Schema Validation
python -c "from app.detection.model_loader import load_runtime_model; m = load_runtime_model(); print(f'Model loaded: {type(m).__name__}, Features: {m.n_features_in_}')"

# 4. Check Frontend Ingress Proxy
curl -s http://127.0.0.1:3000/api/health
```

---

## 2. Common Issues & Remediations

### Issue 1: Overview Tab Shows "Potential Attack Flagged" While Simulation is OFF
- **Symptom:** The Overview banner displays red `POTENTIAL ATTACK FLAGGED` with 0 PPS and no active traffic simulation.
- **Root Cause:** Historical simulation alerts remained in `status: "active"` in the SQLite database from a previous test run.
- **Resolution:**
  - SENTRIX automatically purges inactive simulation alerts on application startup and during simulation pause/stop calls via `resolve_inactive_simulation_alerts()`.
  - To manually reset alert statuses in the database:
    ```bash
    python -c "from app.storage.database import SessionLocal; from app.storage.repositories import AlertRepository; s = SessionLocal(); AlertRepository(s).resolve_inactive_simulation_alerts(); s.commit(); print('Alerts reconciled')"
    ```

---

### Issue 2: `ModelNotFoundError` or `IncompatibleModelError`
- **Symptom:** Backend startup fails with:
  `ModelNotFoundError: Approved runtime model not found at 'models/approved_model.joblib'`
  or
  `IncompatibleModelError: Model expects X features, but schema 1.0.0 defines 14.`
- **Root Cause:** The model file is missing or was trained with a different number of features than the 14 defined in `backend/app/features/definitions.py`.
- **Resolution:**
  1. Verify the approved model exists at `models/approved_model.joblib` or `models/rf-1.0.0/model.joblib`.
  2. If missing, copy the versioned model:
     ```bash
     cp models/rf-1.0.0/model.joblib models/approved_model.joblib
     ```
  3. Re-validate feature schema count:
     ```bash
     python -c "import joblib; m = joblib.load('models/approved_model.joblib'); print('Feature count:', m.n_features_in_)"
     # Must print: Feature count: 14
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

---

### Issue 5: CORS Errors in Web Console
- **Symptom:** Browser console logs: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`.
- **Resolution:**
  1. Verify that `NEXT_PUBLIC_USE_PROXY=true` in `frontend/.env.local`. This routes all requests through Next.js server-side proxy (`/api/backend/*`), completely eliminating CORS in browser environments.
  2. If connecting directly, add your frontend origin to `CORS_ORIGINS` in `.env`:
     ```env
     CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
     ```

---

### Issue 6: SQLite `database is locked`
- **Symptom:** `OperationalError: database is locked` occurs under high write concurrency.
- **Root Cause:** SQLite default locking limits concurrent writes.
- **Resolution:**
  1. Ensure Uvicorn is running with `--workers 1` when using SQLite.
  2. For high-volume multi-worker production deployments, migrate to PostgreSQL by updating `DATABASE_URL` in `.env`:
     ```env
     DATABASE_URL=postgresql://sentrix:securepass@localhost:5432/sentrix
     ```

