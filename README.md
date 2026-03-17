# 🧠 Neuro-DS: AI-Driven Data Structure Oracle

A full-stack developer tool that uses Machine Learning to predict the optimal data structure for your workload, then **proves it** by benchmarking hand-coded C++ implementations in microseconds.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Stack](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi) ![Stack](https://img.shields.io/badge/C++-17-00599C?logo=cplusplus) ![Stack](https://img.shields.io/badge/scikit--learn-1.5-F7931E?logo=scikitlearn)

---

## ⚡ How It Works

```
React UI  →  FastAPI (Python)  →  C++ Engine  →  React Dashboard
 (config)    (ML prediction)     (benchmark)     (visualization)
```

1. **Configure** your workload (read/write ratio, sortedness, dataset size)
2. **AI predicts** the best data structure using a trained Random Forest
3. **C++ engine** benchmarks AVL, Red-Black, Splay, and Skip List trees
4. **Dashboard** shows AI prediction vs ground truth with interactive charts

## 🗂 Project Structure

```
DS project/
├── engine/          # C++17 benchmark engine
│   ├── src/         # AVL, Red-Black, Splay, Skip List implementations
│   └── CMakeLists.txt
├── backend/         # Python FastAPI + ML
│   ├── app/         # API routes, services, ML predictor
│   ├── scripts/     # Model training pipeline
│   └── requirements.txt
└── frontend/        # React + Vite + TailwindCSS
    └── src/         # Components, pages, styles
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **C++ compiler** (g++ or MSVC with C++17 support)
- **CMake** 3.16+

### 1. Build the C++ Engine

```bash
cd engine
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

### 2. Set Up Python Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
```

### 3. Train the ML Model (requires compiled C++ engine)

```bash
cd backend
python scripts/train_model.py
```

### 4. Start the API Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🎛 Workload Configurator | Interactive sliders for read/write ratio, sortedness, temporal locality |
| 🧠 AI Prediction | Random Forest ML model with explainable AI (XAI) |
| ⚡ C++ Benchmarks | Microsecond-precision timing of all 4 data structures |
| 📊 Interactive Dashboard | Bar charts, Pareto scatter plots, confidence rings |
| 💡 Explainable AI Panel | Natural language explanation + feature importance bars |
| 📝 Code Export | Download optimized C++ boilerplate for the winning DS |
| 📜 Experiment History | SQLite-backed log of all past simulation runs |
| 🌙 Dark Theme | Premium glassmorphism UI with Inter font |

## 🔧 Data Structures Implemented

- **AVL Tree** — Strict height-balancing, O(log N) worst-case
- **Red-Black Tree** — Relaxed balancing, fewer rotations
- **Splay Tree** — Self-adjusting, amortized O(log N)
- **Skip List** — Probabilistic, cache-friendly

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulate` | Run full Oracle pipeline |
| GET | `/api/history` | Get past simulation runs |
| GET | `/api/health` | Health check |

---

Built with ❤️ for Advanced Data Structures (Semester 4)
