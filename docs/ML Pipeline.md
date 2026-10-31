# SENTRIX — Machine Learning Pipeline & Training Architecture

**Module Version:** 1.0.0  
**Feature Schema Version:** `1.0.0`  
**Approved Production Model:** `models/rf-1.0.0/model.joblib` (ColumnTransformer + Regularized Random Forest Pipeline)  
**Active Production Artifact:** `models/approved_model.joblib`  
**Dataset:** CIC-DDoS2019 Benchmark Dataset  

---

## 1. Overview and Objectives

The SENTRIX Machine Learning pipeline provides autonomous, sub-second classification of network traffic flows to detect volumetric, protocol, and application-layer DDoS attacks.

The pipeline is engineered with **100% strict schema parity**: the 14 network flow features extracted during live telemetry sliding windows match the exact feature set, column ordering, and data transformations used during offline training.

```mermaid
flowchart TD
    subgraph Data_Preparation["1. Offline Data Pipeline"]
        Raw["CIC-DDoS2019 Raw Flow Records"]
        Cleaner["Missing Value & Infinity Cleaner"]
        Sampler["Stratified Class Balancer"]
        Extractor["14-Feature Canonical Extractor"]
        
        Raw --> Cleaner --> Sampler --> Extractor
        Extractor --> Manifest["data/processed/manifest.json"]
    end

    subgraph Training_Evaluation["2. Model Training & Validation"]
        Manifest --> Split["Train / Validation / Test Split"]
        Split --> RF_Train["Random Forest Pipeline (ColumnTransformer + RF)"]
        Split --> IF_Train["Isolation Forest (Unsupervised Baseline)"]
        
        RF_Train --> Evaluator["Cross-Validation & Metric Evaluation"]
        IF_Train --> Evaluator
        Evaluator --> Report["docs/model_evaluation_report.md"]
    end

    subgraph Production_Export["3. Serialization & Runtime Deployment"]
        Evaluator --> Exporter["Artifact Serializer (joblib)"]
        Exporter --> Artifact["models/rf-1.0.0/model.joblib"]
        Artifact --> Symlink["models/approved_model.joblib"]
    end

    subgraph Runtime_Inference["4. Real-Time Scoring Engine"]
        LiveTraffic["Live Ingress Telemetry"] --> FeatureWin["SlidingWindowAggregator"]
        FeatureWin --> FeatureAlign["Canonical 14-Feature Vector"]
        Symlink --> ModelLoader["app.detection.model_loader"]
        ModelLoader --> Predictor["app.detection.predictor.run_flow_inference"]
        FeatureAlign --> Predictor
        Predictor --> Policy["app.policy.engine.evaluate_hybrid_policy"]
    end
```

---

## 2. Feature Schema & Parity Invariants

All features are defined in `backend/app/features/definitions.py` and strictly validated at load time by `app.detection.model_loader.load_runtime_model`. If an exported model expects a different number of features, runtime initialization fails fast with an `IncompatibleModelError`.

### Canonical 14 Features (Version 1.0.0)

| Index | Feature Name | Unit / Range | Mathematical / Network Meaning |
| :---: | :--- | :--- | :--- |
| **0** | `Total Length of Fwd Packets` | Bytes ($\ge 0$) | Total payload volume transmitted in forward direction. |
| **1** | `Bwd Packet Length Max` | Bytes ($\ge 0$) | Maximum packet length observed from server response. |
| **2** | `Flow Bytes/s` | Bytes/second | Byte transmission velocity across window duration. |
| **3** | `Fwd IAT Total` | Microseconds | Total inter-arrival time between forward packets. |
| **4** | `Bwd IAT Total` | Microseconds | Total inter-arrival time between backward response packets. |
| **5** | `Fwd PSH Flags` | Count ($\ge 0$) | Number of packets with Push flag enabled (interactive data). |
| **6** | `Fwd Packets/s` | Packets/second | Forward packet frequency (key volumetric indicator). |
| **7** | `FIN Flag Count` | Count ($\ge 0$) | Number of connection termination packets. |
| **8** | `Fwd Avg Bytes/Bulk` | Bytes | Average packet size during forward bulk transmission. |
| **9** | `Bwd Avg Bulk Rate` | Rate | Backward bulk data transfer rate. |
| **10** | `Subflow Fwd Packets` | Count ($\ge 0$) | Number of packets in forward subflow. |
| **11** | `Init_Win_bytes_forward` | Bytes ($0-65535$) | TCP Initial Window size for forward traffic. |
| **12** | `Active Mean` | Microseconds | Mean duration the flow remained active before going idle. |
| **13** | `Idle Mean` | Microseconds | Mean duration the flow remained idle between transmissions. |

---

## 3. Model Architecture & Selection

### 3.1 Primary Classifier: Regularized Random Forest Pipeline (`rf-1.0.0`)
- **Pipeline Architecture:** `scikit-learn.pipeline.Pipeline` with an internal `ColumnTransformer` feature selector feeding a regularized `RandomForestClassifier`.
- **Feature Selection:** Focuses on 6 invariant physical flow dynamics (`Total Length of Fwd Packets`, `Flow Bytes/s`, `Fwd IAT Total`, `Fwd Packets/s`, `Subflow Fwd Packets`, `Idle Mean`). Shielding the trees from dataset-specific shortcut artifacts (`Bwd Packet Length Max` being 0 in unidirectional reflection captures) prevents shortcut learning and guarantees high generalization on bidirectional multi-vector traffic.
- **Estimators (`n_estimators`):** 100 decision trees.
- **Max Depth (`max_depth`):** 8 levels (prevents tree memorization of noise).
- **Minimum Samples Leaf (`min_samples_leaf`):** 2 samples.
- **Minimum Samples Split (`min_samples_split`):** 4 samples.
- **Class Balancing (`class_weight`):** `"balanced_subsample"` (recomputes inverse class weights per bootstrap tree).
- **Max Features (`max_features`):** `"sqrt"`.
- **Random Seed (`random_state`):** 42 (ensures deterministic reproducibility).
- **Output:** Calibrated threat probability score $[0.0, 1.0]$ with `score_type = "random_forest_probability"`.

### 3.2 Unsupervised Baseline: Isolation Forest (`iforest-1.0.0` — Rejected)
- **Contamination:** 0.10.
- **Estimators:** 100 trees.
- **Score:** Continuous anomaly score where values $< 0.2664$ indicate anomalous outliers.
- **Evaluation Status:** **Rejected** due to a high $53.31\%$ false positive rate on validation traffic (misclassifies normal bursty user browsing as malicious).

---

## 4. Benchmark Performance & Evaluation Metrics

Evaluated across held-out test splits from CIC-DDoS2019 (`test.csv`, 40,000 flows), validation split (`val.csv`, 40,000 flows), and the multi-vector synthetic stream benchmark ([`notebooks/test.ipynb`](../notebooks/test.ipynb)):

| Metric | Optimized Random Forest (`rf-1.0.0`) | Isolation Forest (`iforest-1.0.0`) | Target Threshold |
| :--- | :---: | :---: | :---: |
| **Held-out Test Accuracy (`test.csv`)** | **99.68%** | 89.42% | $\ge 90.0\%$ |
| **Validation Accuracy (`val.csv`)** | **99.67%** | 89.15% | $\ge 90.0\%$ |
| **Multi-Vector Benchmark Accuracy** | **95.58%** | 48.20% | $\ge 90.0\%$ |
| **DDoS Catch Rate (Recall)** | **92.52%** | 89.42% | $\ge 90.0\%$ |
| **DDoS Precision** | **98.55%** | 89.15% | $\ge 90.0\%$ |
| **DDoS F1 Score** | **95.44%** | 89.28% | $\ge 90.0\%$ |
| **False Positive Rate (FPR)** | **1.36%** (Synth) / **1.44%** (Val) | 10.58% (Held-out) / 53.31% (Val) | $\le 5.0\%$ |
| **ROC-AUC** | **0.9947** | 0.5210 | $\ge 0.90$ |
| **P95 Inference Latency** | **19.26 ms** | 4.81 ms | $\le 100\text{ ms}$ |

Detailed overfitting audit, root cause analysis, and 5-iteration progression logs are documented in [`docs/model_evaluation_report.md`](model_evaluation_report.md).

---

## 5. Model Retraining and Evaluation Commands

To retrain the model, evaluate generalization, and export the approved runtime artifact, execute the following commands in order:

```bash
# 1. Activate Python virtual environment
# Windows: .\.venv\Scripts\Activate.ps1
# Linux:   source .venv/bin/activate

# 2. Extract and preprocess features from raw dataset (if updating raw data)
python ml/prepare_data.py \
  --config ml/configs/training.yaml

# 3. Train and regularize Random Forest pipeline
python ml/train_rf.py \
  --config ml/configs/training.yaml

# 4. Evaluate against validation and held-out test datasets
python ml/evaluate.py \
  --config ml/configs/training.yaml

# 5. Export verified runtime artifact to production path
python ml/export_model.py \
  --source-model models/rf-1.0.0/model.joblib \
  --approved-path models/approved_model.joblib

# 6. Execute multi-vector synthetic benchmark
# Open notebooks/test.ipynb in VS Code / Jupyter, or run via Python:
python -c "import nbformat; from nbconvert.preprocessors import ExecutePreprocessor; ep = ExecutePreprocessor(timeout=600); nb = nbformat.read('notebooks/test.ipynb', as_version=4); ep.preprocess(nb, {'metadata': {'path': 'notebooks/'}}); print('Benchmark completed successfully')"
```
