# SENTRIX — Operator & Developer Run Guide

**System Name:** SENTRIX (Secure Enterprise Network Telemetry & Real-Time Incident X-Defend)  
**Version:** 2.0.0 (Cloud-Agnostic Release)  
**Scope:** Developer Setup, SOC Operator Workflows, Attack Simulation, and Testing.

---

## 1. System Requirements & Prerequisites

- **Python:** 3.10 to 3.12 (CPython)
- **Node.js:** 20.x or 22.x LTS with npm / pnpm
- **Git**
- **Docker & Docker Compose** (Optional, for containerized run)
- **PowerShell / Bash / curl** (for traffic telemetry generation and API testing)

---

## 2. Quickstart via Docker Compose

The simplest way to run the complete platform is via Docker Compose:

```bash
# 1. Ensure .env exists
cp .env.example .env

# 2. Build and launch services
docker compose up -d --build

# 3. View logs
docker compose logs -f
```

- **SOC Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

To stop the containers:
```bash
docker compose down
```

---

## 3. Local Development Setup (Native OS)

### 3.1 Backend Service (FastAPI)

1. **Activate virtual environment:**
   ```powershell
   # Windows PowerShell:
   .\.venv\Scripts\Activate.ps1
   ```
   *(Linux/macOS: `source .venv/bin/activate`)*

2. **Install backend dependencies in editable mode:**
   ```bash
   pip install --upgrade pip setuptools wheel
   pip install -e backend
   ```

3. **Run database migrations:**
   ```bash
   # From project root:
   python -m alembic -c backend/alembic.ini upgrade head
   ```

4. **Start the FastAPI backend server:**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
   ```

5. **Verify backend health:**
   ```bash
   curl http://127.0.0.1:8000/api/v1/health
   # Returns: {"status":"healthy", "database":"connected", ...}
   ```

---

### 3.2 Frontend Web Dashboard (Next.js 16)

1. **Install Node dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Launch the development server:**
   ```bash
   npm run dev
   ```

3. **Access the SOC Dashboard:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Operational Demonstrations & Scenarios

SENTRIX includes dedicated SOC operator views:
- **`/overview`:** Real-time pulse, active threat status, traffic summary, and quick shield control.
- **`/detection`:** Attack detection center, live threat classification, and flagged security events.
- **`/models`:** Machine Learning model health, benchmark metrics, and interactive flow predictor.
- **`/protection`:** Firewall defense shield, staged dry-run rules, and Nginx/Caddy config exporter.
- **`/simulator`:** Isolated Cyber Range lab for synthetic volumetric and application-layer chaos attacks.
- **`/health`:** Service status, database connectivity verification, and audit logs.
- **`/history`:** Regulatory compliance audit trail logging every detection and mitigation event.
- **`/settings`:** Policy configuration matrix, EWMA sensitivity thresholds, and emergency kill-switch.

---

### Scenario A: Inject Legitimate Traffic (Normal Baseline)

Stream legitimate requests from multiple client IPs:

```powershell
1..40 | ForEach-Object {
    $ip = "192.0.2.$($_ % 15 + 1)"
    $body = @{
        format = "raw_batch"
        items = @(
            @{
                client_ip = $ip
                method = "GET"
                path = "/api/v1/products"
                status_code = 200
                response_time_ms = (Get-Random -Minimum 15 -Maximum 40)
                bytes_sent = (Get-Random -Minimum 800 -Maximum 2200)
            }
        )
    } | ConvertTo-Json -Depth 5

    Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/telemetry/ingress" -Method Post -Body $body -ContentType "application/json"
    Start-Sleep -Milliseconds 80
}
```

**What you will observe:**
- In **Live Telemetry** (`/telemetry`): Balanced requests per second, low P95 latency (<45ms), 100% 2xx status codes, and Shannon entropy $\eta \approx 0.85-0.95$.
- In **Attack Detection** (`/detection`): Status displays **NORMAL TRAFFIC** with Z-scores within nominal ranges ($|Z| < 1.5$).
- In **Overview** (`/overview`): System pulse shows green "ALL TRAFFIC LOOKS NORMAL".

---

### Scenario B: Inject Volumetric HTTP Flood (Attacker)

Simulate a high-rate volumetric attack targeting search endpoints:

```powershell
1..150 | ForEach-Object {
    $body = @{
        format = "raw_batch"
        items = @(
            @{
                client_ip = "198.51.100.88"
                method = "POST"
                path = "/search"
                status_code = (Get-Random -InputObject @(500, 502, 503))
                response_time_ms = (Get-Random -Minimum 1500 -Maximum 3500)
                bytes_sent = 120
            }
        )
    } | ConvertTo-Json -Depth 5

    Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/telemetry/ingress" -Method Post -Body $body -ContentType "application/json"
}
```

**What you will observe:**
- In **Live Telemetry** (`/telemetry`): Error rate surges above 50%, latency P95 spikes past 2500ms, and Shannon entropy collapses ($\eta < 0.25$).
- In **Attack Detection** (`/detection`): Banner turns critical: **VOLUMETRIC HTTP FLOOD DETECTED**. Velocity indicators show $Z_{rps} \ge 3.5$ and $Z_{lat} \ge 3.0$.
- In **Attack Detection Events** (`/detection`): A permanent incident is logged with severity `CRITICAL` and root-cause metrics.

---

### Scenario C: Flash Crowd Differentiator (Zero False Positives)

Simulate a sudden marketing promotion surge where dozens of genuine users visit simultaneously:

```powershell
1..80 | ForEach-Object {
    $body = @{
        format = "raw_batch"
        items = @(
            @{
                client_ip = "203.0.113.$($_)"
                method = "GET"
                path = "/special-deal"
                status_code = 200
                response_time_ms = 22
                bytes_sent = 4100
            }
        )
    } | ConvertTo-Json -Depth 5

    Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/telemetry/ingress" -Method Post -Body $body -ContentType "application/json"
}
```

**What you will observe:**
- In **Attack Detection** (`/detection`): Even though traffic volume surged ($Z_{rps} \ge 2.5$), high client entropy ($\eta \ge 0.80$) and low error rate (<5%) causes SENTRIX to classify the surge as **`FLASH_CROWD`** with recommendation **`ALLOW`**.
- **Result:** Legitimate customers are never locked out.

---

### Scenario D: Export Defensive Rules for Production Firewalls

1. Navigate to **Attack Protection** (`/protection`).
2. Click **Export Nginx Conf** or **Export Caddyfile**.
3. View or download the generated configuration snippets:

**Nginx Configuration:**
```nginx
# SENTRIX Auto-Generated Defensive Rules
# Mode: Active Enforcement

deny 198.51.100.88;
```

**Caddyfile Configuration:**
```caddy
# SENTRIX Auto-Generated Defensive Rules
@blocked remote_ip 198.51.100.88
respond @blocked 403
```

---

## 5. Integrating with Your Own Web Application

SENTRIX provides ASGI middleware for FastAPI and Starlette apps.

```python
from fastapi import FastAPI
from app.integrations.middleware import SentrixTelemetryMiddleware

app = FastAPI()

app.add_middleware(
    SentrixTelemetryMiddleware,
    sentrix_url="http://127.0.0.1:8000",
    batch_size=50,
    flush_interval_seconds=1.0,
    api_token="your-api-token-if-configured",
)
```

Every incoming request is asynchronously buffered, anonymized to `/24` or `/48` CIDR blocks for privacy, and forwarded to the SENTRIX detection core.

---

## 6. Codebase Structure

| Directory | Purpose |
| :--- | :--- |
| `backend/app/main.py` | FastAPI application entry point, lifecycle & CORS |
| `backend/app/api/v1/` | REST API routes (alerts, mitigations, telemetry, simulations) |
| `backend/app/detection/` | ML model loader, predictor, EWMA baselines & threat classifier |
| `backend/app/features/` | Feature definitions, sliding windows & telemetry aggregator |
| `backend/app/policy/` | Dual-signal hybrid policy engine & threshold evaluation |
| `backend/app/mitigation/` | Virtual shield, leaky-bucket limiter & config exporters |
| `backend/app/simulator/` | Isolated Cyber Range attack simulation engine |
| `backend/app/storage/` | SQLAlchemy models, repositories & audit logging |
| `frontend/src/app/` | Next.js 16 App Router pages (overview, telemetry, threats, etc.) |
| `frontend/src/components/`| Reusable SOC UI components |
| `frontend/src/lib/api.ts` | Type-safe REST client for SENTRIX backend |
| `models/` | Trained Machine Learning model artifacts (`rf-1.0.0`) |
| `ml/` | Training pipelines, evaluation scripts & dataset configs |
