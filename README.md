# SENTRIX — Autonomous DDoS Detection, Monitoring & Defense Simulator

> **Detect Threats in Seconds. Stage Safe Mitigations. Keep Real Users Connected.**

SENTRIX (**Secure Enterprise Network Telemetry & Real-Time Incident X-Defend**) is an autonomous cybersecurity platform and cyber range simulator designed to protect modern web applications from Distributed Denial-of-Service (DDoS) attacks. It continuously monitors incoming web telemetry, uses a regularized Machine Learning pipeline alongside adaptive statistical velocity tracking (EWMA) to identify cyberattacks, automatically suggests safe firewall defense rules in a staged Dry-Run mode, and provides an isolated Traffic Simulator to safely test defense reactions without touching live production infrastructure.

---

## 1. Problem Statement

Every day, online services—including hospitals, educational institutions, government portals, financial services, e-commerce storefronts, and small businesses—are targeted by **Distributed Denial-of-Service (DDoS) attacks**.

### What is a DDoS Attack?
Imagine a popular neighborhood bakery. A malicious competitor hires thousands of individuals to crowd the doorway, occupy the counter, and ask endless questions without buying anything. As a result, genuine customers cannot enter the store and leave frustrated. On the internet, a DDoS attack operates identically: automated botnets flood a server with millions of fake requests, overwhelming its memory, CPU, and network bandwidth until the service becomes unresponsive.

### Why is this Problem Critical?
1. **Severe Financial & Operational Damage:** Unplanned downtime costs organizations thousands of dollars per minute in lost revenue, broken user trust, and emergency incident response expenses.
2. **The "Flash Crowd" Dilemma (False Positives):** When an online store runs a flash sale or a news website publishes a breaking story, thousands of genuine human visitors arrive simultaneously. Traditional defense tools often mistake this viral spike for a DDoS attack and block legitimate customers—causing self-inflicted business damage.
3. **Complex and Opaque Defense Tools:** Most commercial enterprise security tools are expensive, difficult to configure, generate overwhelming amounts of cryptic data, and lack safe sandbox environments where engineers and researchers can safely observe attack mechanics before an incident occurs.

---

## 2. Proposed Solution

SENTRIX provides an intelligent, automated, and understandable security defense system that bridges the gap between raw network telemetry and actionable cyber defense:

1. **Dual-Layer Intelligent Detection:** Instead of relying on rigid, outdated thresholds, SENTRIX combines an **adaptive statistical baseline** (tracking normal traffic velocity using Exponentially Weighted Moving Averages) with an **approved Machine Learning pipeline** (regularized Random Forest trained on the benchmark CIC-DDoS2019 dataset).
2. **Flash Crowd Differentiator (Zero Collateral Damage):** By analyzing the diversity (Shannon entropy ratio $\eta \ge 0.75$) of client IP addresses and tracking response error rates, SENTRIX accurately separates malicious single-source floods from organic viral traffic surges, keeping the door open for genuine visitors.
3. **Safe Staged Mitigation (Dry-Run by Default):** Newly created defensive rules start in a safe **Dry-Run mode**. The system measures how many requests would be dropped and verifies that internal IP addresses are never affected before an operator promotes the rule to active firewall enforcement.
4. **Instant Firewall Export:** With one click, security analysts can export active defense rules directly into production-ready configuration files for popular web servers like **Nginx** (`limit_req_zone`, `deny`) and **Caddy** (`@blocked`).
5. **Built-in Traffic Simulator (Cyber Range Lab):** SENTRIX includes a safe, discrete-event traffic simulator (M/M/1 queuing model). Operators and students can test how the defense system reacts to SYN floods, UDP amplification, or HTTP spikes under laboratory conditions without touching real networks or servers.

### Step-by-Step System Workflow

```mermaid
flowchart TD
    A["1. Incoming Web Requests"] --> B["2. Privacy Masker (/24 Subnets)"]
    B --> C["3. Sliding-Window Aggregator (1s - 60s)"]
    C --> D["4. Statistical Velocity Tracker (EWMA)"]
    C --> E["5. Machine Learning Classifier (Random Forest)"]
    D --> F{"6. Threat Decision Engine"}
    E --> F
    F -- "Harmless Viral Surge" --> G["ALLOW (Flash Crowd Tagged)"]
    F -- "Attack Detected" --> H["Stage Safe Dry-Run Mitigation"]
    H --> I["Security Operator Reviews & Activates Rule"]
    I --> J["Firewall Rules Applied (Nginx / Caddy / Leaky-Bucket)"]
    H --> K["Logged to Immutable Audit Ledger"]
    F --> L["Real-time SOC Web Dashboard"]
```

---

## 3. Target Audience

SENTRIX is designed for a diverse group of users:

- **Network & System Administrators:** Who need an intuitive defense layer to detect unexpected traffic spikes, identify attacking IP addresses, and generate drop-in Nginx/Caddy rate-limiting rules.
- **Cybersecurity Students & Researchers:** Who want to study real-world DDoS attack dynamics, explore how Machine Learning evaluates 14 canonical network flow features, and experiment safely in a controlled lab environment.
- **Security Operations Center (SOC) Analysts:** Who require real-time visibility into active incidents, severity classification (`Critical`, `High`, `Medium`, `Low`), and an immutable regulatory audit trail.
- **Developers & Web Engineers:** Learning how to containerize, test, and deploy resilient full-stack applications with FastAPI, Next.js, Docker Compose, and automated CI/CD pipelines.

---

## 4. Key Features

| Feature | Everyday Explanation | Technical Implementation | Status |
| :--- | :--- | :--- | :---: |
| **Live Traffic Inspection** | Reads incoming network flow records in real time and anonymizes IP addresses to protect user privacy. | GDPR-compliant `/24` subnet masking with thread-safe sliding-window circular buffer. | **IMPLEMENTED** |
| **Velocity Tracking (EWMA)** | Learns what "normal" traffic looks like over time and flags sudden deviations. | Adaptive Exponentially Weighted Moving Average computing statistical Z-scores ($Z_{rps}, Z_{lat}, Z_{err}$). | **IMPLEMENTED** |
| **Machine Learning Brain** | Classifies flows using 14 distinct network traffic patterns with sub-second speed. | Scikit-learn Pipeline (`ColumnTransformer` + regularized `RandomForestClassifier`), depth 8, 99.68% test accuracy. | **IMPLEMENTED** |
| **Flash Crowd Protection** | Ensures real customers are never locked out when a marketing campaign or viral event occurs. | Shannon Entropy Ratio ($\eta \ge 0.75$) combined with low HTTP error rates ($< 10\%$). | **IMPLEMENTED** |
| **Staged Firewall Defense** | Lets operators test rules safely in Dry-Run mode before dropping any live packets. | In-app leaky-bucket rate limiter with automatic Time-to-Live (TTL) rule pruning and safety allowlists. | **IMPLEMENTED** |
| **One-Click Firewall Export** | Converts active defensive rules into ready-to-use configuration files for popular web servers. | Dynamic config exporter generating native Nginx (`limit_req_zone`, `deny`) and Caddy snippets. | **IMPLEMENTED** |
| **Traffic Simulator Lab** | Generates red-team attack scenarios in a safe sandbox so you can test defense mechanisms. | Discrete-event queuing model (M/M/1) with seed-deterministic reproducibility and performance scorecards. | **IMPLEMENTED** |
| **Regulatory Audit Ledger** | Records every security event, rule change, and operator decision in an append-only log. | Relational database ledger (`AuditEventModel`) storing operator ID, timestamps, and action metadata. | **IMPLEMENTED** |
| **Kernel eBPF/XDP Filtering** | Drops attacking packets at the network interface card before reaching the OS kernel stack. | Linux kernel XDP driver with eBPF bytecode maps for 10Gbps+ wire-speed packet rejection. | **PLANNED** |
| **Distributed Redis Buffer** | Coordinates sliding-window traffic buffers across multi-node server clusters. | Distributed Redis circular stream buffer with cluster-wide entropy aggregation. | **PLANNED** |

---

## 5. How the Application Works

SENTRIX operates as an integrated, multi-tier system:

1. **Traffic Observation:** Network flow metrics and HTTP access logs enter the system via REST API endpoints (`/api/v1/telemetry/ingress`).
2. **Feature Extraction:** A sliding-window buffer computes 14 canonical network flow features matching the international CIC-DDoS2019 benchmark schema.
3. **Dual Analysis:**
   - The **Statistical Engine** calculates the velocity shift (Z-score) of traffic volume and error rates compared to running baselines.
   - The **Machine Learning Pipeline** independently scores the 14-flow feature vector to determine the attack probability.
4. **Policy Evaluation:** If both velocity and ML signals indicate an attack, the policy engine assigns an urgency severity (**Critical**, **High**, **Medium**, or **Low**) and creates a staged defense rule.
5. **Operator Control & Presentation:** The **Next.js Web Dashboard** displays real-time metrics, interactive charts, and flagged events. The operator can inspect incident details, simulate mitigation, or export firewall configuration files.

---

## 6. System Architecture

SENTRIX is organized into **six synchronized operational tiers**, matching the detailed specification in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):

```mermaid
flowchart TD
    subgraph Traffic_Layer["1. Ingress & Telemetry Ingestion Tier"]
        Clients["Web Visitors / Attackers"]
        ReverseProxy["Reverse Proxy (Nginx / Caddy / Cloudflare)"]
        IngressAPI["Telemetry Ingress API (/api/v1/telemetry/ingress)"]
        LogParser["Log Parser (Combined, CLF, JSON)"]
        PrivacyMasker["GDPR Privacy Masker (/24 IPv4, /48 IPv6)"]

        Clients --> ReverseProxy
        ReverseProxy --> IngressAPI
        IngressAPI --> LogParser
        LogParser --> PrivacyMasker
    end

    subgraph Feature_Layer["2. Sliding-Window Aggregation & Feature Engine"]
        Aggregator["TelemetryAggregator (Thread-Safe Circular Deque)"]
        CircBuffer["Time Window Buffer (1s - 60s Retention)"]
        PercentileCalc["Latency Percentile Engine (p50, p90, p95, p99)"]
        EntropyCalc["Shannon Entropy Calculator H(X) & Normalized Ratio η"]
        FeatureExtractor["14-Flow Feature Extractor (CIC-DDoS2019 Schema)"]

        PrivacyMasker --> Aggregator
        Aggregator --> CircBuffer
        CircBuffer --> PercentileCalc
        CircBuffer --> EntropyCalc
        CircBuffer --> FeatureExtractor
    end

    subgraph Detection_Layer["3. Dual-Signal Detection & Intelligence Tier"]
        EWMA["Adaptive Baseline Tracker (EWMA Mean μ_t, Variance σ_t^2)"]
        ZScore["Velocity Shift Engine (Z_rps, Z_err, Z_lat)"]
        MLModel["Random Forest Pipeline (rf-1.0.0, ColumnTransformer + RF)"]
        ThreatClassifier["Explainable Multi-Tier Threat Classifier"]
        FlashCrowdDiff{"Flash Crowd Differentiator"}

        Aggregator --> EWMA
        EWMA --> ZScore
        FeatureExtractor --> MLModel
        ZScore --> ThreatClassifier
        EntropyCalc --> ThreatClassifier
        ThreatClassifier --> FlashCrowdDiff
    end

    subgraph Defense_Layer["4. Defensive Mitigation & Policy Engine"]
        DualPolicy["Dual-Signal Policy Consensus Engine"]
        SafetyGate["Protected Allowlist Guard (127.0.0.1, RFC 1918)"]
        DryRunEngine["Staged Dry-Run Mitigation Engine"]
        RateLimiter["Leaky Bucket Rate Limiter"]
        TTLPruner["Automatic Rule TTL Pruning"]
        ConfigExporter["Config Exporters (Nginx / Caddy Firewalls)"]
        SimEngine["Cyber Range Simulator (Discrete-Event M/M/1 Queue)"]

        FlashCrowdDiff -- "ATTACK SIGNAL" --> DualPolicy
        MLModel -- "PROBABILITY SCORE" --> DualPolicy
        FlashCrowdDiff -- "VIRAL SURGE" --> SafetyGate
        DualPolicy --> SafetyGate
        SafetyGate --> DryRunEngine
        DryRunEngine --> RateLimiter
        DryRunEngine --> TTLPruner
        DryRunEngine --> ConfigExporter
    end

    subgraph Persistence_Layer["5. Relational Persistence & Audit Ledger"]
        DB["SQLite / PostgreSQL Database (SQLAlchemy + Alembic)"]
        ObsModel["ObservationModel"]
        DetModel["DetectionModel"]
        AlertModel["AlertModel (Incidents)"]
        MitModel["MitigationModel (Defense Rules)"]
        AuditModel["AuditEventModel (Immutable Audit Trail)"]

        DryRunEngine --> MitModel
        DualPolicy --> DetModel
        DualPolicy --> AlertModel
        FeatureExtractor --> ObsModel
        DryRunEngine --> AuditModel
        ObsModel --> DB
        DetModel --> DB
        AlertModel --> DB
        MitModel --> DB
        AuditModel --> DB
    end

    subgraph Presentation_Layer["6. Next.js 16 Web SOC Dashboard Tier"]
        Browser["Security Analyst Web Browser"]
        NextJS["Next.js 16 Standalone Server (App Router)"]
        ProxyRoute["/api/proxy/[...path] (Bearer Token Auth & CORS Guard)"]
        
        Browser <--> NextJS
        NextJS <--> ProxyRoute

        subgraph SOC_Routes["SOC Analyst Workspaces"]
            SOC_Overview["/overview (System Pulse & Status)"]
            SOC_Detection["/detection (Attack Detection & Events)"]
            SOC_Models["/models (Machine Learning Model Health)"]
            SOC_Protection["/protection (Firewall Rules & Defense Shield)"]
            SOC_Simulator["/simulator (Isolated Cyber Range Lab)"]
            SOC_Health["/health (Service Health & Audit Logs)"]
            SOC_Settings["/settings (Policy Matrix & Sensitivity)"]
        end

        ProxyRoute <--> DB
        ProxyRoute <--> IngressAPI
        ProxyRoute <--> SimEngine
    end
```

### Architectural Tiers Breakdown

1. **Ingress & Telemetry Tier:** Ingests live HTTP traffic from edge proxies (Nginx, Caddy, Cloudflare) via `/api/v1/telemetry/ingress`. Automatically anonymizes client IP addresses to `/24` (IPv4) or `/48` (IPv6) subnets for GDPR compliance.
2. **Feature Extraction Engine:** Maintains an in-memory sliding window (1s to 60s) using thread-safe circular buffers. Continuously calculates P50/P90/P95/P99 latencies, Shannon entropy ratios ($\eta$), and canonical 14-flow feature vectors.
3. **Dual-Signal Detection Tier:** Runs real-time adaptive baselining (EWMA moving mean and variance for velocity Z-scores) in parallel with an approved supervised Random Forest pipeline (`rf-1.0.0`) trained on the CIC-DDoS2019 dataset.
4. **Defensive Policy & Mitigation Tier:** Evaluates consensus between ML and statistical signals. Enforces safety allowlists (protecting `127.0.0.1` and RFC 1918 internal subnets), stages rules in Dry-Run mode, provides an in-app leaky-bucket rate limiter, and exports native drop-in Nginx and Caddy firewall configurations. Also hosts an isolated Cyber Range simulator with discrete-event queuing theory (M/M/1).
5. **Persistence & Audit Tier:** Stores flow observations, model detections, security alerts, and active mitigations using SQLAlchemy 2.0 ORM with Alembic migrations, supporting both local SQLite and production PostgreSQL. Writes immutable records to an append-only audit ledger (`AuditEventModel`).
6. **SOC Presentation Tier:** Next.js 16 App Router dashboard providing real-time traffic pulse graphs, AI incident evaluation, ML model health telemetry, interactive rule promotion, and system diagnostics through 7 unified analyst views. Protected by an internal server-side proxy route (`/api/proxy/[...path]`) that prevents browser CORS leakage and injects bearer tokens.

---

## 7. Technology Stack

| Layer | Technology | Version | Purpose in SENTRIX |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.4.3` | High-performance React web dashboard with server-side rendering and proxy routing. |
| **UI Components** | React & Tailwind CSS | `19.3.1` / `4.3.3` | Modern, responsive cybersecurity interface with dark-mode aesthetic. |
| **Data Visualization** | Recharts | `3.10.1` | Real-time traffic wave graphs and simulation progression charts. |
| **Backend Framework** | FastAPI (Python) | `>= 0.110.0` | High-speed asynchronous Python REST API serving security telemetry and control endpoints. |
| **ASGI Web Server** | Uvicorn | `>= 0.29.0` | Production ASGI web server running FastAPI worker processes. |
| **Machine Learning** | Scikit-Learn & Joblib | `>= 1.4.0` | Pipeline (`ColumnTransformer` + regularized `RandomForestClassifier`) artifact deserialization. |
| **Numerical Processing** | NumPy & Pandas | `>= 1.26.0` | Sliding-window percentile calculation, Shannon entropy, and feature array alignment. |
| **Database ORM** | SQLAlchemy | `>= 2.0.0` | Database abstraction layer supporting both SQLite (local) and PostgreSQL (cloud). |
| **Database Migrations**| Alembic | `>= 1.13.0` | Version-controlled, idempotent relational database schema migrations. |
| **Containerization** | Docker & Docker Compose| Multi-stage | Lightweight, non-root production containers ensuring reproducible cross-platform execution. |
| **Cloud Hosting** | Render | Blueprint v1 | Cloud platform hosting backend and frontend services with automated health checks. |
| **CI/CD Pipeline** | GitHub Actions | Workflows v4 | Continuous integration and deployment pipeline running linting, tests, and builds. |

---

## 8. Project Directory Structure

```text
SENTRIX/
├── .github/
│   └── workflows/
│       ├── ci.yml               # Automated CI: Linting, pytest suite, and Next.js build
│       ├── cd.yml               # Automated CD: Render deployment webhook trigger
│       └── supabase-keepalive.yml # Scheduled GitHub Action pinging cloud database pooler
├── backend/
│   ├── app/
│   │   ├── api/                 # REST API endpoints (v1 routes & internal keepalive)
│   │   │   ├── v1/              # alerts, audit, config, detection, health, mitigations, models, simulations, telemetry
│   │   │   └── internal.py      # /internal/keepalive endpoint for database anti-pausing
│   │   ├── core/                # Configuration, logging, error handlers, and security gate
│   │   ├── detection/           # Model loading, predictor, threat classifier, and EWMA tracker
│   │   ├── features/            # 14-feature canonical extraction schema and sliding windows
│   │   ├── ingestion/           # Access log parser (Combined, CLF, JSON) and IP anonymizer
│   │   ├── mitigation/          # Defense lifecycle, leaky-bucket limiter, and Nginx/Caddy config exporters
│   │   ├── policy/              # Dual-signal consensus engine, allowlist, and threshold models
│   │   ├── safety/              # Safety gate invariant validation and emergency kill-switch
│   │   ├── simulator/           # Discrete-event queuing model (M/M/1), victim capacity, and clock worker
│   │   ├── storage/             # SQLAlchemy database models, session management, and repositories
│   │   └── main.py              # FastAPI application initialization, middleware, and liveness probes
│   ├── migrations/              # Alembic database migration scripts (0001_initial to 0002_observation_target_ip)
│   ├── tests/                   # 173 automated tests (unit, integration, api, storage, test_cases)
│   ├── alembic.ini              # Alembic database migration configuration
│   ├── Dockerfile               # Multi-stage security-hardened backend Docker image
│   └── pyproject.toml           # Python package configuration and dependencies
├── data/
│   ├── fixtures/                # Benchmark test fixtures and evidence files
│   └── processed/               # Processed CIC-DDoS2019 dataset splits (train.csv, val.csv, test.csv)
├── docs/                        # In-depth architectural, ML, and operational documentation
│   ├── api_schemas.md           # Complete REST API specification (35 endpoints)
│   ├── ARCHITECTURE.md          # Complete system architecture and mathematical definitions
│   ├── ML Pipeline.md           # Machine learning feature schema and training pipeline
│   ├── model_evaluation_report.md# Benchmark accuracy, precision, recall, and ROC-AUC metrics
│   ├── Run Guide.md             # Developer run guide and operational demonstrations
│   ├── SCHEMA.md                # Relational database schema reference (8 tables)
│   ├── Testing Guide.md         # Full testing guide and validation instructions (173 tests)
│   └── Troubleshooting.md       # Step-by-step diagnostic and recovery guide
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages (/overview, /detection, /models, /protection, /simulator, /health, /settings)
│   │   │   └── api/proxy/[...path]/ # Server-side API proxy routing requests and hiding bearer tokens
│   │   ├── components/          # Reusable UI components (alerts, charts, common, layout, mitigation, simulator, ui)
│   │   ├── config/              # Navigation routes and layout configurations
│   │   ├── hooks/               # Custom React hooks (usePagination)
│   │   ├── lib/                 # API client, error handling, formatters, and polling engine
│   │   └── types/               # TypeScript interfaces and API schemas
│   ├── public/                  # Static assets and favicon files
│   ├── Dockerfile               # Multi-stage standalone Next.js Docker image
│   ├── next.config.ts           # Next.js configuration with standalone output enabled
│   ├── package.json             # Frontend dependencies and npm scripts
│   └── tsconfig.json            # Strict TypeScript compiler configuration
├── ml/
│   ├── configs/                 # YAML configuration for dataset paths and hyper-parameters
│   ├── prepare_data.py          # Dataset ingestion, stratified sampling, and feature extraction
│   ├── train_rf.py              # Regularized Random Forest training with ColumnTransformer
│   ├── train_iforest.py         # Isolation Forest unsupervised training
│   ├── evaluate.py              # Statistical evaluation against validation and test splits
│   └── export_model.py          # Production model verification and approval export
├── models/
│   ├── rf-1.0.0/                # Versioned approved Random Forest model, metrics.json, and approval.json
│   ├── iforest-1.0.0/           # Evaluated Isolation Forest baseline and metrics.json
│   └── approved_model.joblib    # Active runtime model artifact loaded by the backend
├── notebooks/
│   └── test.ipynb               # Primary evaluation notebook: multi-vector benchmark & synthetic streams
├── scripts/                     # Helper utilities (send_test_traffic.py, replay_dataset.py, reset_database.py)
├── .dockerignore                # Excludes virtual environments and build caches from Docker contexts
├── .env.example                 # Comprehensive environment variable template
├── docker-compose.yml           # Local production-like multi-container orchestration
├── render.yaml                  # Render Infrastructure-as-Code deployment blueprint
├── LICENSE                      # MIT License
└── README.md                    # Main project documentation (this file)
```

---

## 9. Prerequisites

Before installing SENTRIX, ensure your computer has the following tools installed:

- **Git:** Version control (`git --version`)
- **Python:** Version `3.10`, `3.11`, or `3.12` (`python --version`)
- **Node.js:** Version `20.x` or `22.x` LTS (`node --version`)
- **npm:** Package manager included with Node.js (`npm --version`)
- **Docker & Docker Compose** *(Optional, recommended for containerized execution)*: (`docker compose version`)

---

## 10. Local Development Setup

To run SENTRIX directly on your local machine for development:

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/SENTRIX.git
cd SENTRIX
```

### Step 2: Configure Environment Variables
Copy the template environment file to create your local `.env`:
```bash
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

---

## 11. Backend Setup

### Step 1: Create and Activate Python Virtual Environment
```powershell
# On Windows (PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# On Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Backend Dependencies in Editable Mode
```bash
python -m pip install --upgrade pip setuptools wheel
python -m pip install -e "backend[dev]"
```

### Step 3: Run Database Migrations
Initialize the SQLite database schema and seed default threshold values:
```bash
python -m alembic -c backend/alembic.ini upgrade head
```

### Step 4: Start the FastAPI Backend Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
```

- **Swagger Interactive API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Liveness Probe Endpoint:** [http://127.0.0.1:8000/healthz](http://127.0.0.1:8000/healthz)

---

## 12. Frontend Setup

In a new terminal window:

### Step 1: Navigate to the Frontend Directory & Install Dependencies
```bash
cd frontend
npm ci
```

### Step 2: Launch the Next.js Development Server
```bash
npm run dev
```

### Step 3: Access the SENTRIX Security Dashboard
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 13. Database Configuration

SENTRIX uses **SQLAlchemy 2.0** as its Object-Relational Mapper (ORM), allowing it to run on two different database engines without changing application code:

1. **SQLite (Default for Local Development & Testing):**
   - Configured via `DATABASE_URL=sqlite:///./sentrix.db`
   - Requires zero installation or external database processes.
   - Automatically created in the project root or container volume.
2. **PostgreSQL / Supabase (Recommended for Production & High Concurrency):**
   - Configured via `DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-[region].pooler.supabase.com:6543/postgres`
   - **Important:** When using Supabase connection poolers, use port **`6543`** (Transaction Mode) for runtime application pooling to prevent connection exhaustion (`FATAL: (EMAXCONNSESSION)`). Use port `5432` only when running schema migrations (`alembic upgrade head`).

### Running Schema Migrations
Whenever database models change, execute migrations with:
```bash
python -m alembic -c backend/alembic.ini upgrade head
```

---

## 14. Environment Variables Reference

All environment variables used by the system are documented below. Configure these in your `.env` file:

| Variable Name | Service | Default Value | Required? | Purpose & Everyday Explanation |
| :--- | :---: | :---: | :---: | :--- |
| `APP_ENV` | Backend | `development` | Optional | Sets system environment (`development`, `staging`, `production`). |
| `PORT` | Backend | `8000` | Optional | Network port the FastAPI server listens on. |
| `MITIGATION_MODE` | Backend | `simulation` | Optional | Defense mode: `simulation` (safe memory test), `dry_run` (log only), `active` (enforce rate limits). |
| `MODEL_PATH` | Backend | `models/approved_model.joblib` | Optional | File path to the trained Random Forest model artifact. |
| `DATABASE_URL` | Backend | `sqlite:///./sentrix.db` | **Yes** | Connection string for SQLite or PostgreSQL relational database. |
| `API_AUTH_REQUIRED` | Backend | `true` | Optional | When true, protected endpoints require a valid Bearer token. |
| `API_AUTH_TOKEN` | Both | *(User Defined)* | **Yes** | Secret token used to authenticate requests between frontend and backend. |
| `KEEPALIVE_SECRET` | Backend | *(Unset)* | Optional | Dedicated token for the `/internal/keepalive` database ping endpoint. |
| `CORS_ORIGINS` | Backend | `http://localhost:3000,...` | Optional | Comma-separated list of web addresses allowed to access the backend API. |
| `NODE_ENV` | Frontend | `production` | Optional | Node.js execution mode (`development` or `production`). |
| `BACKEND_URL` | Frontend | `http://127.0.0.1:8000` | **Yes** | Internal address the Next.js server proxy uses to contact the backend. |
| `NEXT_PUBLIC_USE_PROXY` | Frontend | `true` | Optional | When true, browser routes requests via Next.js server proxy, hiding tokens from users. |
| `NEXT_PUBLIC_APP_URL` | Frontend | `http://localhost:3000` | Optional | Canonical web address of the dashboard for metadata and links. |

---

## 15. Docker-Based Setup (Local Production Environment)

The easiest and most reliable way to run the entire SENTRIX platform locally is using **Docker Compose**:

### 1. Build and Start All Containers
```bash
# 1. Ensure .env file exists with a strong API_AUTH_TOKEN
cp .env.example .env

# 2. Build and launch services in detached (background) mode
docker compose up -d --build
```

### 2. View Service Logs in Real Time
```bash
docker compose logs -f
```

### 3. Verify Container Health
```bash
docker compose ps
```
You should see:
- `sentrix-backend` running on port `8000` (Status: `healthy`)
- `sentrix-frontend` running on port `3000` (Status: `healthy`)

### 4. Stop and Clean Up Containers
```bash
# Stop containers while preserving database volume
docker compose down

# Stop containers and remove persistent database volume
docker compose down -v
```

---

## 16. API Documentation & Endpoints

When the backend is running, an interactive **Swagger UI** is available at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

### Core API Endpoints Summary (35 Endpoints)

| Method | Endpoint | Auth Required? | Description & Everyday Purpose |
| :---: | :--- | :---: | :--- |
| `GET` | `/healthz` | No | Public liveness probe returning `{"status":"ok"}` for container/cloud checks. |
| `GET` | `/api/v1/health` | Yes | Authenticated service health check verifying database and engine readiness. |
| `GET` | `/internal/keepalive` | Yes | Dedicated database keepalive query preventing cloud pooler timeouts. |
| `GET` | `/api/v1/models` | Yes | Lists registered classifiers and the active approved model artifact. |
| `GET` | `/api/v1/models/metrics` | Yes | Retrieves verified model benchmark metrics (`rf-1.0.0` vs `iforest-1.0.0`). |
| `POST` | `/api/v1/detection/analyze` | Yes | Submits a 14-feature flow vector for real-time Random Forest classification. |
| `GET` | `/api/v1/detection/live` | Yes | Evaluates active HTTP telemetry sliding window for DDoS signatures. |
| `GET` | `/api/v1/detection/baseline` | Yes | Retrieves adaptive EWMA baseline statistics (mean, variance, Z-scores). |
| `POST` | `/api/v1/detection/baseline/reset` | Yes | Resets and re-calibrates adaptive telemetry baselines. |
| `POST` | `/api/v1/telemetry/ingress` | Yes | Ingests access log batches or metric items into sliding-window buffer. |
| `GET` | `/api/v1/telemetry/summary` | Yes | Retrieves live HTTP telemetry metrics over the active sliding window. |
| `GET` | `/api/v1/alerts` | Yes | Retrieves paginated security incidents filtered by severity. |
| `GET` | `/api/v1/mitigations/status` | Yes | Returns defense shield status, countdown timer, dynamic host IP, and gateways. |
| `GET` | `/api/v1/mitigations` | Yes | Lists all active, staged dry-run, and expired firewall rules. |
| `POST` | `/api/v1/mitigations/simulate` | Yes | Manually triggers an isolated virtual defense shield in simulation mode. |
| `POST` | `/api/v1/mitigations/{id}/cancel` | Yes | Cancels an active mitigation rule before its scheduled expiration. |
| `POST` | `/api/v1/mitigations/disable` | Yes | Global emergency kill switch that immediately bypasses all active mitigations. |
| `POST` | `/api/v1/mitigations/defensive/propose` | Yes | Proposes a new defensive rate-limiting or block rule in Dry-Run mode. |
| `GET` | `/api/v1/mitigations/defensive/rules` | Yes | Lists all active and staged defensive rules with remaining TTL. |
| `POST` | `/api/v1/mitigations/defensive/{id}/approve` | Yes | Promotes a staged Dry-Run rule to active enforcement status. |
| `POST` | `/api/v1/mitigations/defensive/{id}/revoke` | Yes | Revokes an active or staged rule immediately. |
| `GET` | `/api/v1/mitigations/export/nginx` | Yes | Downloads production-ready firewall rules in **Nginx** format. |
| `GET` | `/api/v1/mitigations/export/caddy` | Yes | Downloads production-ready firewall rules in **Caddy** format. |
| `GET` | `/api/v1/simulations` | Yes | Lists past and active Cyber Range test runs with status filters. |
| `POST` | `/api/v1/simulations` | Yes | Initializes a new deterministic attack simulation scenario. |
| `POST` | `/api/v1/simulations/compare` | Yes | Compares 2 to 5 simulation runs side-by-side with comparison matrix. |
| `GET` | `/api/v1/simulations/{id}` | Yes | Fetches comprehensive simulation session state and final scorecard. |
| `POST` | `/api/v1/simulations/{id}/control` | Yes | Controls the simulation clock (`start`, `pause`, `resume`, `step`, `cancel`, `reset`). |
| `GET` | `/api/v1/simulations/{id}/ticks` | Yes | Fetches chronological time-series ticks for live chart rendering. |
| `GET` | `/api/v1/simulations/{id}/export` | Yes | Exports simulation run data as downloadable CSV or JSON. |
| `GET` | `/api/v1/config/thresholds` | Yes | Retrieves active volumetric and ML sensitivity thresholds. |
| `PATCH` | `/api/v1/config/thresholds` | Yes | Incrementally calibrates specific threshold limits. |
| `GET` | `/api/v1/audit` | Yes | Queries the immutable regulatory audit ledger of all operator actions. |

*For complete payload examples and schemas, see [docs/api_schemas.md](docs/api_schemas.md).*

---

## 17. Machine Learning Pipeline & Model Information

SENTRIX uses a **regularized Random Forest Pipeline** (`rf-1.0.0`) trained on the benchmark **CIC-DDoS2019** dataset.

### The 14 Canonical Network Features
To ensure sub-second inference speed without sacrificing detection accuracy, SENTRIX extracts 14 key flow characteristics:

1. `Total Length of Fwd Packets`: Total byte volume transmitted forward.
2. `Bwd Packet Length Max`: Largest packet size received in response.
3. `Flow Bytes/s`: Overall byte transmission speed.
4. `Fwd IAT Total`: Total time elapsed between forward packets.
5. `Bwd IAT Total`: Total time elapsed between return packets.
6. `Fwd PSH Flags`: Push flag count (indicates interactive payload transfers).
7. `Fwd Packets/s`: Frequency of incoming packets (key volumetric flood indicator).
8. `FIN Flag Count`: Connection termination request frequency.
9. `Fwd Avg Bytes/Bulk`: Average packet volume during bulk transfers.
10. `Bwd Avg Bulk Rate`: Data transfer rate of bulk server responses.
11. `Subflow Fwd Packets`: Forward packet count within sub-flows.
12. `Init_Win_bytes_forward`: TCP initial window size.
13. `Active Mean`: Average duration flows stayed active before going idle.
14. `Idle Mean`: Average idle time between transmissions.

### Model Architecture
- **Pipeline:** `scikit-learn.pipeline.Pipeline` with `ColumnTransformer` feature selector feeding a regularized `RandomForestClassifier`.
- **Flow Dynamics Selection:** The `ColumnTransformer` selects 6 invariant flow dynamics features (`Total Length of Fwd Packets`, `Flow Bytes/s`, `Fwd IAT Total`, `Fwd Packets/s`, `Subflow Fwd Packets`, `Idle Mean`) to prevent shortcut learning from dataset-specific unidirectional reflection captures.
- **Trees (`n_estimators`):** 100 decision trees
- **Max Depth (`max_depth`):** 8 levels (prevents tree memorization of noise)
- **Minimum Samples Leaf (`min_samples_leaf`):** 2 samples
- **Minimum Samples Split (`min_samples_split`):** 4 samples
- **Class Balancing:** `class_weight="balanced_subsample"`
- **Max Features:** `"sqrt"`
- **Artifact File:** `models/approved_model.joblib` (784 KB) and `models/rf-1.0.0/model.joblib`

---

## 18. Model Evaluation Summary

The trained model was thoroughly evaluated across held-out test data from the CIC-DDoS2019 dataset (`test.csv`, 40,000 flows), validation split (`val.csv`, 40,000 flows), and the multi-vector evaluation benchmark in [`notebooks/test.ipynb`](notebooks/test.ipynb):

| Evaluation Metric | Real-World Held-Out Test (`test.csv`) | Multi-Vector Synthetic Stream (`test.ipynb`) | Target Threshold | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Accuracy** | **99.68%** | **95.58%** | $\ge 90.0\%$ | **Passed** |
| **DDoS Precision** | **99.99%** | **98.55%** | $\ge 90.0\%$ | **Passed** |
| **DDoS Recall (Catch Rate)** | **99.68%** | **92.52%** | $\ge 90.0\%$ | **Passed** |
| **F1 Score** | **99.84%** | **95.44%** | $\ge 90.0\%$ | **Passed** |
| **False Positive Rate (FPR)**| **1.15%** | **1.36%** | $\le 5.0\%$ | **Passed** |
| **ROC-AUC Score** | **0.9995** | **0.9947** | $\ge 0.90$ | **Passed** |
| **P95 Inference Latency** | **19.26 ms** | **19.26 ms** | $\le 100\text{ ms}$ | **Passed** |

*For complete confusion matrices, overfitting diagnosis, and 5-iteration progression tables, see [docs/model_evaluation_report.md](docs/model_evaluation_report.md).*

---

## 19. Testing Instructions

SENTRIX includes a rigorous automated test suite covering unit tests, API contracts, database operations, and frontend builds.

### 1. Run Backend Automated Pytest Suite (All 173 Tests)
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run all 173 backend tests
python -m pytest backend/tests -v
```

### 2. Run Backend Ruff Linter Check
```bash
python -m ruff check backend
python -m ruff format --check backend
```

### 3. Run Frontend Linter & Typechecks
```bash
cd frontend
npm run lint
npm run typecheck
```

### 4. Test Production Frontend Compilation
```bash
cd frontend
npm run build
```

---

## 20. Production Deployment Guide (Render)

SENTRIX is fully configured for deployment on **Render** using the provided `render.yaml` Infrastructure-as-Code blueprint.

### Step-by-Step Render Deployment:

1. **Push your code to GitHub:**
   Ensure all changes are pushed to your `main` branch.
2. **Log in to Render:**
   Navigate to [dashboard.render.com](https://dashboard.render.com).
3. **Create New Blueprint Instance:**
   - Click **New +** in the top navigation and select **Blueprint**.
   - Connect your GitHub repository (`SENTRIX`).
   - Render will automatically detect `render.yaml`.
4. **Review Configured Services:**
   Render will create two connected services:
   - `sentrix-backend`: Python 3.11 web service with automatic `API_AUTH_TOKEN` generation.
   - `sentrix-frontend`: Node.js 20 web service automatically receiving `API_AUTH_TOKEN` and `BACKEND_URL` from the backend service.
5. **Click "Apply":**
   Render will build the backend, run Alembic database migrations, compile the Next.js frontend, and launch both services.
6. **Verify Live Deployment:**
   - Visit `https://your-frontend-name.onrender.com`
   - Visit `https://your-backend-name.onrender.com/healthz` to confirm healthy status.

---

## 21. GitHub Actions CI/CD Pipeline

SENTRIX includes three automated GitHub Actions workflows in `.github/workflows/`:

```mermaid
flowchart LR
    subgraph CI["Continuous Integration (ci.yml)"]
        Trigger1["Every Push & Pull Request"] --> BackendJob["Backend Job\n- Python 3.11\n- Ruff Lint\n- 173 Pytest Tests"]
        Trigger1 --> FrontendJob["Frontend Job\n- Node 20\n- ESLint\n- TypeScript Check\n- Next.js Build"]
    end

    subgraph CD["Continuous Deployment (cd.yml)"]
        Trigger2["Push to 'main' or Release Tag"] --> ValidationJob["Pre-Deploy Validation\n(Ensures Tests Pass)"]
        ValidationJob --> DeployJob["Trigger Render Deploy Hook\n(POST RENDER_DEPLOY_HOOK_URL)"]
        DeployJob --> SmokeTest["Post-Deploy Smoke Test\n(Verifies /healthz is live)"]
    end

    subgraph Keepalive["Database Anti-Pausing (supabase-keepalive.yml)"]
        CronTrigger["Scheduled Cron (Mon & Thu 06:00 UTC)"] --> PingJob["Ping /internal/keepalive\n(SELECT 1 Query)"]
    end
```

### Configured GitHub Secrets

| Secret Name | Required? | Description |
| :--- | :---: | :--- |
| `RENDER_DEPLOY_HOOK_URL` | Optional | Webhook URL provided by Render to trigger automatic backend redeployment on push. |
| `RENDER_FRONTEND_DEPLOY_HOOK_URL`| Optional | Webhook URL to trigger frontend redeployment on Render. |
| `PROD_API_URL` | Optional | Public URL of your deployed backend (e.g. `https://sentrix-backend.onrender.com`) used by the smoke test. |
| `KEEPALIVE_SECRET` | Optional | Secret key required to authenticate with the `/internal/keepalive` anti-pausing endpoint. |

---

## 22. Security Considerations & Safety Invariants

SENTRIX is built with strict security-by-design principles:

1. **Protected Allowlist Invariant:** Critical infrastructure addresses (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, and health check probes) can **never** be blocked or rate-limited. The mitigation engine rejects any rule targeting protected IP ranges (`is_protected_target`).
2. **Safe Dry-Run by Default:** Newly proposed defensive rules always start in `DRY_RUN` mode. No live customer traffic is dropped until an authorized operator inspects the evidence and explicitly clicks "Approve".
3. **Mandatory Rule Time-To-Live (TTL):** Every rule enforces an automatic expiration timer (default 300 seconds, max 3600 seconds). Expired rules are automatically purged by background workers, preventing permanent accidental blockades.
4. **Global Emergency Kill-Switch:** If unexpected traffic issues occur, clicking **"Emergency Bypass"** immediately deactivates all active mitigations in sub-millisecond time.
5. **Masking Sensitive Data in Logs:** The backend uses Pydantic `SecretStr` for authentication tokens, ensuring credentials are never exposed in log outputs, error traces, or API responses.
6. **Non-Root Container Hardening:** Both backend and frontend Docker containers run under dedicated, unprivileged system users (`sentrix:sentrix` and `nextjs:nodejs`), preventing container breakout vulnerabilities.

---

## 23. Troubleshooting Guide

### Common Issues & Quick Solutions

#### 1. Supabase `FATAL: (EMAXCONNSESSION) max clients reached in session mode`
- **Cause:** Connecting to Supabase pooler on port 5432 (Session Mode) with multiple workers/threads exceeds the free-tier limit of 15 connections.
- **Solution:** Change port to `6543` (Transaction Mode) in `DATABASE_URL` in `.env`:
  ```env
  DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-[region].pooler.supabase.com:6543/postgres
  ```

#### 2. `EPERM: operation not permitted, mkdir ...` on Windows during `npm run build`
- **Cause:** Windows file indexer or multi-worker page prerendering locks `.next` directories.
- **Solution:** Clean the build cache and run the build:
  ```powershell
  Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
  npm run build --prefix frontend
  ```

#### 3. `ModuleNotFoundError: No module named 'app'` when running backend
- **Cause:** Terminal is running `uvicorn` from outside the `backend/` directory without the app directory flag.
- **Solution:** Specify `--app-dir backend`:
  ```powershell
  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
  ```

#### 4. Backend returns `401 Unauthorized` for `/api/v1/...`
- **Cause:** `API_AUTH_REQUIRED=true` is enabled in `.env`, but no valid Bearer token was provided in the request headers.
- **Solution:** Provide the Authorization header or configure `API_AUTH_TOKEN`:
  ```bash
  curl -H "Authorization: Bearer <your-token>" http://127.0.0.1:8000/api/v1/health
  ```
  *(Note: The `/healthz` and `/` endpoints are unauthenticated specifically for container and cloud health checks).*

*For more diagnostic scenarios, see [docs/Troubleshooting.md](docs/Troubleshooting.md).*

---

## 24. Future Enhancements & Research Roadmap

The following future milestones are prioritized based on technical relevance, architectural dependencies, and operational maturity. These describe proposed future capabilities, not existing implementations:

### Priority 1: High-Performance Mitigation & Wire-Speed Filtering
- [ ] **Linux Kernel eBPF / XDP Packet Dropping:** Move active mitigation from application-layer web proxies to Linux kernel-space eBPF filters (eXpress Data Path). By dropping malicious packets at the network interface driver before sk_buff allocation, SENTRIX can achieve wire-speed 10Gbps+ packet filtering with minimal CPU consumption.
- [ ] **Dynamic Hardware Offload (SmartNICs):** Investigate offloading eBPF maps to Netronome / NVIDIA BlueField DPUs for wire-speed line-rate line dropping in datacenter deployments.

### Priority 2: Distributed State & Scalability Architecture
- [ ] **Multi-Node Redis Sliding Window:** Transition in-memory circular deques (`TelemetryAggregator`) to distributed Redis sliding-window streams. This allows multiple SENTRIX edge instances to share traffic state across geographically distributed reverse proxies.
- [ ] **Cluster-Wide Shannon Entropy:** Implement distributed streaming algorithms (HyperLogLog / Count-Min Sketch) to compute global Shannon entropy and client diversity across multi-region server fleets.

### Priority 3: Machine Learning Generalization & Continuous Adaptation
- [ ] **Online Concept Drift Detection:** Integrate statistical drift detectors (Page-Hinkley test / ADWIN) to continuously monitor the distribution of incoming flow vectors and flag model degradation when attack signatures evolve.
- [ ] **Automated Shadow Retraining Pipeline:** Implement an automated retraining loop where newly labeled flows trigger background model training in shadow mode, automatically gating deployment against validation and synthetic stream benchmarks.
- [ ] **Explainable AI (XAI) for SOC Analysts:** Surface per-flow SHAP (SHapley Additive exPlanations) or TreeSHAP feature contributions directly on the `/detection` dashboard, showing analysts exactly which flow characteristics triggered an attack classification.

### Priority 4: Advanced Chaos Engineering & Cyber Range Expansion
- [ ] **Distributed Multi-Agent Botnet Simulation:** Expand the discrete-event simulator to model multi-tier command-and-control (C2) botnet architectures with coordinated pulse attacks, DNS water torture, and adaptive low-and-slow exfiltration.
- [ ] **Adversarial Robustness Testing:** Generate adversarial flow perturbations (FGSM / evasion attacks) to evaluate the classifier's boundary resilience against attackers actively attempting to mimic normal user entropy.

### Priority 5: Standards & Observability Integration
- [ ] **OpenTelemetry (OTel) Native Ingestion:** Provide native OTel Collector receivers so SENTRIX can ingest OpenTelemetry traces and span metrics directly from Kubernetes clusters.
- [ ] **BGP Flowspec & Cloudflare Magic Transit Integration:** Automatically push approved CIDR drop rules to upstream Internet Service Providers via BGP Flowspec (RFC 5575) and edge WAF APIs.

---

## 25. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

Copyright (c) 2026 Alok Prasad.
