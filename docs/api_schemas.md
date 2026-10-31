# SENTRIX REST API Specification (v1.5.0)

The SENTRIX API provides a secure, token-authenticated DevSecOps control plane for real-time traffic monitoring, machine learning threat detection, automated mitigation lifecycle management, and discrete-event chaos simulations.

- **Base URL Prefix:** `/api/v1` (with `/internal` for platform keepalive and root `/healthz` for liveness probes)
- **Authentication Scheme:** HTTP Bearer Token (`Authorization: Bearer <API_AUTH_TOKEN>`)
- **Query Parameter Auth:** Supported for browser-initiated export streams (`?token=<API_AUTH_TOKEN>`)
- **Telemetry Format:** Strict JSON (`application/json`) with optional CSV format for audit trails (`format=csv`)
- **Timestamp Standard:** Strict UTC ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)

---

## 1. Global Conventions & Error Envelopes

Every API response includes an immutable tracing identifier header:
```http
X-Request-ID: req_9f8c3d1b7a2e4f50
```

### Standard Error Envelope

All 4xx client and 5xx server responses adhere to a sanitized envelope without leaking internal stack traces:

```json
{
  "error": {
    "code": "SAFETY_GATE_REJECTED",
    "message": "Target IP 127.0.0.1 is protected by safety allowlist.",
    "request_id": "req_9f8c3d1b7a2e4f50"
  }
}
```

| HTTP Status | Error Code (`code`) | Trigger Condition |
| :---: | :--- | :--- |
| `400` | `INVALID_REQUEST` / `SAFETY_GATE_REJECTED` | Parameter bounds breach, protected allowlist target, or invalid state machine input. |
| `401` | `UNAUTHORIZED` | Missing, malformed, or invalid `Authorization: Bearer` token. |
| `403` | `FORBIDDEN` | Caller lacks permissions to toggle safety parameters. |
| `404` | `NOT_FOUND` | Specified simulation run, mitigation action, or alert resource does not exist. |
| `409` | `CONFLICT` | Invalid lifecycle transition (e.g. attempting to reset an actively running simulation). |
| `422` | `VALIDATION_ERROR` | Pydantic schema validation failure (e.g. non-numeric rates, missing required keys). |
| `500` | `INTERNAL_ERROR` | Unexpected backend runtime fault (sanitized for operator safety). |
| `503` | `SERVICE_UNAVAILABLE` | Database connectivity failure during keepalive ping. |

---

## 2. Master Endpoint Directory (35 Endpoints)

| # | HTTP Method | Path | Subsystem | Description |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `GET` | `/` | Liveness | Unauthenticated root probe returning backend service metadata. |
| **2** | `GET` | `/healthz` | Liveness | Unauthenticated liveness probe for Docker, Kubernetes, and Render. |
| **3** | `GET` | `/api/v1/health` | System | Authenticated healthcheck verifying database and engine readiness. |
| **4** | `GET` | `/internal/keepalive` | System | Dedicated database anti-pausing connectivity ping (`SELECT 1`). |
| **5** | `GET` | `/api/v1/keepalive` | System | Alias for internal keepalive endpoint. |
| **6** | `GET` | `/api/v1/models` | AI & Detection | List registered classifiers and active runtime approved model. |
| **7** | `GET` | `/api/v1/models/metrics` | AI & Detection | Retrieve verified model benchmark metrics (`rf-1.0.0` vs `iforest-1.0.0`). |
| **8** | `POST` | `/api/v1/detection/analyze` | AI & Detection | Execute ad-hoc ML flow feature vector inference (14 canonical features). |
| **9** | `GET` | `/api/v1/detection/live` | AI & Detection | Evaluate active HTTP telemetry sliding window for DDoS signatures. |
| **10** | `GET` | `/api/v1/detection/baseline` | AI & Detection | Retrieve current adaptive EWMA baseline statistics (mean, variance, Z-scores). |
| **11** | `POST` | `/api/v1/detection/baseline/reset` | AI & Detection | Reset and re-calibrate adaptive telemetry baselines. |
| **12** | `POST` | `/api/v1/detection/evaluate-telemetry` | AI & Detection | Evaluate custom telemetry snapshot against baseline and signatures. |
| **13** | `POST` | `/api/v1/telemetry/ingress` | Telemetry | Ingest access log batches or metric items into sliding-window buffer. |
| **14** | `GET` | `/api/v1/telemetry/summary` | Telemetry | Retrieve live HTTP telemetry metrics over the active sliding window. |
| **15** | `POST` | `/api/v1/telemetry/reset` | Telemetry | Reset real-time telemetry sliding window buffers. |
| **16** | `GET` | `/api/v1/alerts` | Alerts | Paginated alert feed with severity filters (`info`, `low`, `medium`, `high`, `critical`). |
| **17** | `GET` | `/api/v1/mitigations/status` | Mitigation | Real-time defense shield status, countdown timer, dynamic host IP, and DNS gateways. |
| **18** | `GET` | `/api/v1/mitigations` | Mitigation | List active and historical mitigation actions with status filtering. |
| **19** | `POST` | `/api/v1/mitigations/simulate` | Mitigation | Rapid manual operator defense shield activation in simulation mode. |
| **20** | `POST` | `/api/v1/mitigations/{action_id}/cancel` | Mitigation | Early cancellation of an active mitigation rule. |
| **21** | `POST` | `/api/v1/mitigations/disable` | Mitigation | Emergency kill switch to disengage or lock down all future mitigations. |
| **22** | `POST` | `/api/v1/mitigations/defensive/propose` | Mitigation | Propose a new defensive mitigation policy (Defaults to safe Dry-Run mode). |
| **23** | `GET` | `/api/v1/mitigations/defensive/rules` | Mitigation | List all active and dry-run defensive mitigation rules. |
| **24** | `POST` | `/api/v1/mitigations/defensive/{rule_id}/approve` | Mitigation | Operator approval to promote a dry-run rule to active enforcement. |
| **25** | `POST` | `/api/v1/mitigations/defensive/{rule_id}/revoke` | Mitigation | Immediately cancel or revoke an active or dry-run defense rule. |
| **26** | `GET` | `/api/v1/mitigations/export/nginx` | Mitigation | Export active defensive policies as production-grade Nginx configuration. |
| **27** | `GET` | `/api/v1/mitigations/export/caddy` | Mitigation | Export active defensive policies as Caddyfile configuration. |
| **28** | `POST` | `/api/v1/simulations` | Simulator | Initialize a new discrete-event chaos simulation run. |
| **29** | `GET` | `/api/v1/simulations` | Simulator | List historical simulation sessions with pagination. |
| **30** | `POST` | `/api/v1/simulations/compare` | Simulator | Side-by-side comparative analysis of 2 to 5 simulation runs. |
| **31** | `GET` | `/api/v1/simulations/{run_id}` | Simulator | Fetch comprehensive simulation session state and final scorecard. |
| **32** | `POST` | `/api/v1/simulations/{run_id}/control` | Simulator | Lifecycle controls: `start`, `pause`, `resume`, `step`, `cancel`, `reset`. |
| **33** | `GET` | `/api/v1/simulations/{run_id}/ticks` | Simulator | Fetch chronological time-series ticks for live chart rendering. |
| **34** | `GET` | `/api/v1/simulations/{run_id}/export` | Simulator | Export simulation run data as downloadable CSV or JSON. |
| **35** | `GET` | `/api/v1/config/thresholds` | Config | Retrieve active versioned volumetric and ML sensitivity thresholds. |
| **36** | `PATCH` | `/api/v1/config/thresholds` | Config | Incrementally calibrate specific threshold limits. |
| **37** | `PUT` | `/api/v1/config/thresholds` | Config | Fully replace and activate a new semantic threshold version. |
| **38** | `GET` | `/api/v1/audit` | Audit | Query immutable regulatory audit trail (`json` or `csv`). |

---

## 3. Subsystem Specifications & Payloads

### 3.1 System & Health

#### `GET /` and `GET /healthz`
Public liveness probes for Docker container healthchecks, cloud balancers, and orchestrators.
- **Auth:** Not Required.
- **Response (`200 OK`):**
```json
{
  "status": "ok",
  "service": "sentrix-backend"
}
```

#### `GET /api/v1/health`
Returns authenticated operational health status and database connectivity.
- **Auth:** Bearer Token.
- **Response (`200 OK`):**
```json
{
  "status": "ok"
}
```

#### `GET /internal/keepalive` and `GET /api/v1/keepalive`
Lightweight query executing `SELECT 1` to ensure cloud databases (e.g. Supabase poolers) remain active and prevent inactivity pausing.
- **Auth:** Bearer Token (`KEEPALIVE_SECRET` or `API_AUTH_TOKEN`).
- **Response (`200 OK`):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-10-31T12:00:00.123456Z"
}
```

---

### 3.2 AI Models & Threat Detection

#### `GET /api/v1/models`
Lists all candidate and active classifiers registered in the system.
- **Response (`200 OK`):**
```json
{
  "approved_model": "rf-1.0.0",
  "schema_version": "1.0.0",
  "models": [
    {
      "model_version": "rf-1.0.0",
      "model_type": "Pipeline (ColumnTransformer + RandomForestClassifier)",
      "status": "approved",
      "schema_version": "1.0.0"
    },
    {
      "model_version": "iforest-1.0.0",
      "model_type": "IsolationForest",
      "status": "experimental_unapproved",
      "schema_version": "1.0.0"
    }
  ]
}
```

#### `GET /api/v1/models/metrics`
Retrieves verified statistical test metrics from `models/rf-1.0.0/metrics.json` and `models/iforest-1.0.0/metrics.json`.
- **Response (`200 OK`):**
```json
{
  "dataset": "CIC-DDoS2019",
  "schema_version": "1.0.0",
  "rf_metrics": {
    "model_name": "RandomForestClassifier",
    "pipeline_architecture": "ColumnTransformer + RandomForestClassifier",
    "accuracy": 0.996725,
    "precision": 0.999874,
    "recall": 0.996822,
    "f1": 0.998346,
    "false_positive_rate": 0.014409,
    "roc_auc": 0.999580,
    "p95_latency_ms": 19.26,
    "training_time_seconds": 0.969,
    "held_out_test_metrics": {
      "accuracy": 0.99675,
      "precision": 0.999899,
      "recall": 0.996822,
      "f1": 0.998358,
      "false_positive_rate": 0.011527,
      "roc_auc": 0.999547
    },
    "synthetic_benchmark_metrics": {
      "accuracy": 0.9558,
      "precision": 0.985513,
      "recall": 0.9252,
      "f1": 0.954405,
      "false_positive_rate": 0.0136,
      "roc_auc": 0.994749
    }
  },
  "iforest_metrics": {
    "model_name": "IsolationForest",
    "accuracy": 0.9943,
    "precision": 0.995351,
    "recall": 0.998916,
    "f1": 0.99713,
    "false_positive_rate": 0.533141,
    "p95_latency_ms": 4.81,
    "training_time_seconds": 0.088
  }
}
```

#### `POST /api/v1/detection/analyze`
Executes an on-demand inference pass against a 14-dimensional flow feature vector.
- **Request Body:**
```json
{
  "features": {
    "Total Length of Fwd Packets": 150000.0,
    "Bwd Packet Length Max": 0.0,
    "Flow Bytes/s": 15000000.0,
    "Fwd IAT Total": 1000.0,
    "Bwd IAT Total": 0.0,
    "Fwd PSH Flags": 0.0,
    "Fwd Packets/s": 12000.0,
    "FIN Flag Count": 0.0,
    "Fwd Avg Bytes/Bulk": 0.0,
    "Bwd Avg Bulk Rate": 0.0,
    "Subflow Fwd Packets": 12000.0,
    "Init_Win_bytes_forward": 1024.0,
    "Active Mean": 0.0,
    "Idle Mean": 0.0
  },
  "target_ip": "192.168.1.100"
}
```
- **Response (`200 OK`):**
```json
{
  "event_id": "det_manual_01",
  "prediction": "suspicious",
  "score": 0.985,
  "score_type": "random_forest_probability",
  "model_version": "rf-1.0.0",
  "feature_schema_version": "1.0.0",
  "policy_action": "simulate_rate_limit",
  "policy_reasons": ["ML prediction is suspicious", "Flow rate exceeds 5,000 PPS"],
  "traffic_threshold_exceeded": true,
  "mitigation_mode": "simulation",
  "timestamp": "2026-10-31T12:00:00Z"
}
```

#### `GET /api/v1/detection/live`
Evaluates the real-time sliding window buffer against adaptive EWMA baselines and heuristics.
- **Query Parameter:** `window_seconds=10`
- **Response (`200 OK`):**
```json
{
  "threat_type": "VOLUMETRIC_HTTP_FLOOD",
  "severity": "CRITICAL",
  "confidence": 0.92,
  "is_threat": true,
  "is_flash_crowd": false,
  "recommended_action": "RATE_LIMIT",
  "z_scores": {
    "rps": 3.85,
    "error_rate": 2.94,
    "latency": 3.12
  },
  "current_metrics": {
    "rps": 1250.0,
    "error_rate": 0.28,
    "p95_latency_ms": 1420.0,
    "client_entropy_ratio": 0.22
  },
  "baseline_metrics": {
    "mean_rps": 120.0,
    "mean_latency_ms": 35.0
  }
}
```

#### `GET /api/v1/detection/baseline`
Retrieves the active state of the adaptive Exponentially Weighted Moving Average (EWMA) tracker.
- **Response (`200 OK`):**
```json
{
  "alpha": 0.1,
  "sample_count": 4820,
  "mean_rps": 115.4,
  "variance_rps": 450.2,
  "mean_error_rate": 0.021,
  "mean_latency_ms": 32.8
}
```

#### `POST /api/v1/detection/baseline/reset`
Resets the EWMA baseline tracker to initial un-calibrated state.
- **Response (`200 OK`):**
```json
{
  "status": "ok",
  "message": "Telemetry baselines successfully reset."
}
```

---

### 3.3 Telemetry Ingestion & Real-Time Monitoring

#### `POST /api/v1/telemetry/ingress`
Ingests batches of structured HTTP request items or raw server access logs (Combined, CLF, or JSON format). Automatically anonymizes client IP addresses to `/24` (IPv4) or `/48` (IPv6) subnets.
- **Request Body:**
```json
{
  "raw_logs": [
    "198.51.100.88 - - [31/Oct/2026:12:00:00 +0000] \"GET /api/v1/data HTTP/1.1\" 200 4520 \"-\" \"curl/7.88.1\" 0.045",
    "203.0.113.14 - - [31/Oct/2026:12:00:00 +0000] \"POST /login HTTP/1.1\" 401 120 \"-\" \"Mozilla/5.0\" 0.850"
  ],
  "anonymize_ips": true
}
```
- **Response (`202 Accepted`):**
```json
{
  "status": "accepted",
  "accepted_count": 2,
  "dropped_or_invalid_count": 0
}
```

#### `GET /api/v1/telemetry/summary`
Retrieves aggregated telemetry over the requested sliding window (e.g. 10s to 60s).
- **Query Parameter:** `window_seconds=10`
- **Response (`200 OK`):**
```json
{
  "window_seconds": 10.0,
  "request_count": 850,
  "requests_per_second": 85.0,
  "error_rate": 0.035,
  "p50_latency_ms": 22.0,
  "p90_latency_ms": 48.0,
  "p95_latency_ms": 65.0,
  "p99_latency_ms": 110.0,
  "client_ip_count": 42,
  "shannon_entropy": 3.82,
  "normalized_entropy_ratio": 0.88,
  "status_code_distribution": {
    "2xx": 820,
    "4xx": 25,
    "5xx": 5
  }
}
```

#### `POST /api/v1/telemetry/reset`
Clears the sliding-window circular buffer.
- **Response (`200 OK`):**
```json
{
  "status": "ok"
}
```

---

### 3.4 Alerts

#### `GET /api/v1/alerts`
Retrieves a paginated list of security incident alerts.
- **Query Parameters:** `limit=50`, `offset=0`, `severity=critical`, `status=active`
- **Response (`200 OK`):**
```json
{
  "total_count": 1,
  "limit": 50,
  "offset": 0,
  "alerts": [
    {
      "alert_id": "alt_8f7b2a1c0d3e",
      "detection_id": 142,
      "severity": "critical",
      "title": "Live Threat: VOLUMETRIC_HTTP_FLOOD",
      "description": "Traffic volume surged 3.8x above EWMA baseline with concentrated single-source entropy.",
      "source_id": "sensor_edge_01",
      "timestamp": "2026-10-31T12:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### 3.5 Defensive Mitigation & Firewall Exporters

#### `GET /api/v1/mitigations/status`
Real-time shield telemetry polled by the frontend AppShell navigation bar and dashboards.
- **Response (`200 OK`):**
```json
{
  "emergency_disabled": false,
  "mode": "simulation",
  "shield_active": true,
  "active_simulated_count": 1,
  "max_concurrent_limit": 100,
  "status": "operational",
  "latest_mitigation": {
    "action_id": "sim_shield_4f98c5d2f1ab",
    "target_ip": "198.51.100.88",
    "target_port": 80,
    "rate_limit_pps": 5000,
    "duration_seconds": 60,
    "remaining_seconds": 38,
    "status": "active",
    "expires_at": "2026-10-31T12:01:00Z"
  },
  "host_ip": "127.0.0.1",
  "hostname": "sentrix-node-01",
  "is_deployed": false,
  "environment": "development",
  "dns_gateways": ["8.8.8.8", "1.1.1.1"],
  "protected_gateways": ["127.0.0.1", "10.0.0.1"],
  "rate_limit_bounds": { "min_pps": 100, "max_pps": 50000 },
  "duration_bounds": { "min_seconds": 10, "max_seconds": 300 },
  "cooldown_ticks": 10
}
```

#### `GET /api/v1/mitigations`
Lists all active and historical mitigation actions with status filtering.
- **Query Parameters:** `limit=50`, `offset=0`, `status=active`
- **Response (`200 OK`):**
```json
{
  "total_count": 1,
  "mitigations": [
    {
      "action_id": "act_8f7b2a1c0d",
      "target_ip": "198.51.100.88",
      "target_port": 80,
      "action_type": "rate_limit",
      "rate_limit_pps": 1000,
      "duration_seconds": 60,
      "status": "simulated",
      "mode": "simulation",
      "created_at": "2026-10-31T12:00:00Z",
      "updated_at": "2026-10-31T12:00:00Z",
      "expires_at": "2026-10-31T12:01:00Z",
      "cancelled_at": null
    }
  ]
}
```

#### `POST /api/v1/mitigations/simulate`
Manually initiates an isolated virtual rate-limiting rule.
- **Request Body:**
```json
{
  "target_ip": "198.51.100.88",
  "target_port": 80,
  "action_type": "rate_limit",
  "rate_limit_pps": 5000,
  "duration_seconds": 60,
  "reason": "Operator rapid defense activation from Overview dashboard"
}
```
- **Response (`201 Created`):**
```json
{
  "action_id": "act_8f7b2a1c0d",
  "target_ip": "198.51.100.88",
  "target_port": 80,
  "action_type": "rate_limit",
  "rate_limit_pps": 5000,
  "duration_seconds": 60,
  "status": "simulated",
  "mode": "simulation",
  "created_at": "2026-10-31T12:00:00Z",
  "expires_at": "2026-10-31T12:01:00Z"
}
```

#### `POST /api/v1/mitigations/{action_id}/cancel`
Cancels an active mitigation rule before its natural expiration.
- **Response (`200 OK`):**
```json
{
  "action_id": "act_8f7b2a1c0d",
  "status": "cancelled",
  "cancelled_at": "2026-10-31T12:00:20Z"
}
```

#### `POST /api/v1/mitigations/disable`
Toggles the global emergency kill switch.
- **Query Parameter:** `enable=true` (re-enable normal operation) or omit (engage lockdown).
- **Response (`200 OK`):**
```json
{
  "emergency_disabled": true,
  "status": "locked_down",
  "message": "All mitigation requests blocked globally."
}
```

#### `POST /api/v1/mitigations/defensive/propose`
Proposes a new staged defensive mitigation rule (starts in `DRY_RUN` mode by default).
- **Request Body:**
```json
{
  "target_ip_or_cidr": "198.51.100.88",
  "action_type": "RATE_LIMIT",
  "rate_limit_rps": 10,
  "burst_capacity": 20,
  "ttl_seconds": 600,
  "reason": "Sustained volumetric flood observed on /search"
}
```
- **Response (`201 Created`):**
```json
{
  "rule_id": "def_rule_7c4e9f2b",
  "target_ip_or_cidr": "198.51.100.88",
  "action_type": "RATE_LIMIT",
  "rate_limit_rps": 10,
  "burst_capacity": 20,
  "mode": "DRY_RUN",
  "created_at": 1798718400.0,
  "expires_at": 1798719000.0,
  "ttl_seconds": 600,
  "reason": "Sustained volumetric flood observed on /search",
  "approved_by": null,
  "simulated_blocked_count": 0,
  "active_blocked_count": 0
}
```

#### `GET /api/v1/mitigations/defensive/rules`
Lists all active and staged defensive rules.
- **Query Parameter:** `include_expired=false`
- **Response (`200 OK`):** List of `DefensiveMitigationRule` objects.

#### `POST /api/v1/mitigations/defensive/{rule_id}/approve`
Promotes a staged Dry-Run rule to active enforcement status.
- **Response (`200 OK`):** Updated rule with `mode: "ACTIVE"` and operator signature.

#### `POST /api/v1/mitigations/defensive/{rule_id}/revoke`
Revokes an active or staged rule immediately.
- **Response (`200 OK`):**
```json
{
  "status": "revoked",
  "rule_id": "def_rule_7c4e9f2b"
}
```

#### `GET /api/v1/mitigations/export/nginx`
Downloads production-grade Nginx rate-limiting and blocking configuration snippet.
- **Response (`200 OK`):** `text/plain` Nginx snippet with `deny` and `limit_req_zone` statements.

#### `GET /api/v1/mitigations/export/caddy`
Downloads production-ready Caddyfile configuration snippet.
- **Response (`200 OK`):** `text/plain` Caddyfile snippet with `@blocked` named matchers.

---

### 3.6 Chaos Simulator Engine

#### `POST /api/v1/simulations`
Initializes a new reproducible discrete-event simulation run.
- **Request Body:**
```json
{
  "scenario_type": "syn_flood",
  "seed": 42,
  "duration_seconds": 60,
  "baseline_pps": 250.0,
  "attack_peak_pps": 10000.0,
  "attack_start_tick": 9,
  "attack_end_tick": 51,
  "speed_multiplier": 1.0,
  "target_ip": "192.168.1.100",
  "target_port": 80,
  "victim": {
    "bandwidth_mbps": 100.0,
    "cpu_capacity_pps": 5000.0,
    "max_active_connections": 10000,
    "max_latency_ms": 5000.0,
    "baseline_latency_ms": 15.0
  }
}
```
- **Response (`201 Created`):**
```json
{
  "run_id": "sim_4f98c5d2f1ab",
  "scenario_type": "syn_flood",
  "status": "created",
  "seed": 42,
  "total_ticks": 60,
  "current_tick": 0,
  "speed_multiplier": 1.0,
  "config": { },
  "scorecard": null,
  "created_at": "2026-10-31T12:00:00Z",
  "updated_at": "2026-10-31T12:00:00Z",
  "completed_at": null
}
```

#### `GET /api/v1/simulations`
Lists simulation sessions with optional status filter.
- **Query Parameters:** `status=completed`, `limit=20`, `offset=0`
- **Response (`200 OK`):** Paginated list of simulation runs.

#### `POST /api/v1/simulations/compare`
Compares 2 to 5 simulation runs side-by-side.
- **Request Body:**
```json
{
  "run_ids": ["sim_4f98c5d2f1ab", "sim_7c4e9f2b1a8d"]
}
```
- **Response (`200 OK`):**
```json
{
  "runs": [ ],
  "comparison_matrix": {
    "attack_traffic_blocked_pct": { "sim_4f98c5d2f1ab": 93.18, "sim_7c4e9f2b1a8d": 89.4 },
    "collateral_legitimate_pct": { "sim_4f98c5d2f1ab": 2.0, "sim_7c4e9f2b1a8d": 4.1 },
    "time_to_detect_seconds": { "sim_4f98c5d2f1ab": 0, "sim_7c4e9f2b1a8d": 1 }
  }
}
```

#### `POST /api/v1/simulations/{run_id}/control`
Dispatches lifecycle control commands to the simulation run.
- **Request Body:**
```json
{
  "action": "step"
}
```
*(Valid actions: `start`, `pause`, `resume`, `step`, `cancel`, `reset`)*
- **Response (`200 OK`):**
```json
{
  "run_id": "sim_4f98c5d2f1ab",
  "status": "running",
  "current_tick": 1,
  "message": "Advanced virtual clock to tick 1."
}
```

#### `GET /api/v1/simulations/{run_id}/ticks`
Fetches chronological time-series points recorded during the simulation.
- **Query Parameter:** `limit=150`, `offset=0`
- **Response (`200 OK`):** List of `SimulationTickModel` metrics.

#### `GET /api/v1/simulations/{run_id}`
Returns simulation run metadata and the final computed scorecard when completed.
- **Response (`200 OK`):** Full run object including scorecard.

#### `GET /api/v1/simulations/{run_id}/export`
Exports simulation ticks and scorecard as a downloadable file.
- **Query Parameter:** `format=csv` or `format=json`
- **Response (`200 OK`):** Downloadable attachment stream.

---

### 3.7 Dynamic Configuration & Thresholds

#### `GET /api/v1/config/thresholds`
Fetches the active threshold configuration governing the policy engine.
- **Response (`200 OK`):**
```json
{
  "id": 1,
  "version": "v1.0.0",
  "is_active": true,
  "pps_threshold": 5000.0,
  "bps_threshold": 10000000.0,
  "syn_pps_threshold": 500.0,
  "syn_ack_ratio_threshold": 5.0,
  "rf_probability_threshold": 0.75,
  "iforest_score_threshold": 0.2664,
  "updated_by": "system",
  "created_at": "2026-10-31T12:00:00Z"
}
```

#### `PATCH /api/v1/config/thresholds`
Calibrates specific threshold values while preserving remaining limits.
- **Request Body:**
```json
{
  "pps_threshold": 7500.0,
  "rf_probability_threshold": 0.80
}
```
- **Response (`200 OK`):** Updated threshold model.

#### `PUT /api/v1/config/thresholds`
Fully replaces and activates a new semantic threshold version.

---

### 3.8 Audit Trail & Compliance

#### `GET /api/v1/audit`
Queries the tamper-evident audit trail tracking every mitigation state transition, simulation completion, and operator action.
- **Query Parameters:** `limit=50`, `offset=0`, `event_type=mitigation_triggered`, `format=json|csv`
- **Response (`200 OK`):**
```json
{
  "total_count": 142,
  "limit": 50,
  "offset": 0,
  "events": [
    {
      "event_id": "aud_7a9c3d1b8f",
      "event_type": "mitigation_triggered",
      "action": "simulate_rate_limit",
      "actor": "hybrid_policy",
      "details": {
        "action_id": "sim-act-9-b4f1",
        "target_ip": "198.51.100.88",
        "rate_limit_pps": 5000
      },
      "timestamp": "2026-10-31T12:00:00Z"
    }
  ]
}
```
*(When `format=csv`, returns downloadable `text/csv` with `Content-Disposition: attachment; filename=audit_export.csv`)*
