# Cyto Logic

A compiler framework for synthetic biology that transforms high-level biological logic into genetic circuit representations.

**Documentation:**
- [API Reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [Development Guide](docs/development.md)

> **Current Status:** All 5 phases completed. DNA export, Plugin system, Cloud compiler, SVG visualization, Frontend UI, and Security hardening all implemented. 316 tests passing (245 backend + 71 frontend).

---

## Overview

Cyto Logic is an experimental compiler infrastructure designed for synthetic biology. The project explores a compiler-oriented approach to genetic circuit engineering, where biological logic is treated similarly to source code in a traditional programming language.

Instead of directly generating DNA sequences from user input, Cyto Logic separates the compilation process into independent stages. A logic expression is parsed into an Abstract Syntax Tree (AST), transformed into a Circuit Intermediate Representation (CIR), and later consumed by different backend systems such as simulation, optimization, and biological exporters.

The long-term goal is to build a reusable compiler platform that can support multiple biological programming languages and multiple output targets without redesigning the entire system.

---

## Motivation

Most synthetic biology software combines circuit design, simulation, and exporting into tightly coupled workflows. While this approach works for specific applications, it becomes difficult to extend as projects grow.

Cyto Logic follows a different philosophy.

The compiler frontend is responsible only for understanding biological logic. Every later stage works on a common intermediate representation rather than the original source code. This separation allows simulation, optimization, validation, and export systems to evolve independently.

The architecture is inspired by modern compiler infrastructures such as LLVM, adapted for synthetic biology.

---

## Current Development Status

| Area | Status |
|------|--------|
| Compiler Frontend (Lexer, Parser, Semantic Analysis) | ✅ Complete |
| Circuit Intermediate Representation (CIR) | ✅ Complete |
| Simulation Engine (Hill kinetics, ODE, RK4) | ✅ Complete |
| Optimization Engine (GA, NSGA-II) | ✅ Complete |
| Validation & Benchmarks (Repressilator, SBOL, Golden IR) | ✅ Complete |
| Backends (SBOL, DNA, SVG, Simulation) | ✅ Complete |
| Plugin System | ✅ Complete |
| Cloud Compiler (Docker, Health endpoint) | ✅ Complete |
| Frontend UI (React + ReactFlow + Recharts) | ✅ Complete |
| Security (Rate limiter, Input validation, CORS, Logging) | ✅ Complete |
| Documentation (API, Architecture, Development) | ✅ Complete |
| CI Pipeline (Backend tests, Frontend build/test/lint, Docker) | ✅ Complete |

---

## Completed Features

### Compiler Frontend
- Lexer with token position tracking
- Recursive-descent parser
- AST node definitions
- Semantic analyzer (undefined proteins, invalid arity, depth limits)
- Input validation, cycle detection, size limits

### Circuit IR
- Graph-based intermediate representation
- IR Builder (AST to CircuitIR)
- Gate mapper integration
- Compiler pipeline (Lexer → Parser → Semantic → IR)

### Simulation Engine
- Hill kinetics models (activation, repression)
- ODE system builder from CircuitIR
- RK4 numerical solver
- `simulate_circuit()` with configurable t_span, dt, initial conditions

### Optimization Engine
- Genetic Algorithm (tournament selection, crossover, mutation)
- NSGA-II (fast non-dominated sort, crowding distance)
- Multi-objective optimization (expression accuracy, metabolic burden, noise robustness)
- Simulation → NSGA-II pipeline integration

### Backends
- **SBOL:** Full XML export with SBOL 2.x compliance
- **DNA:** FASTA sequences with 13 reference BioBrick parts
- **SVG:** Circuit diagram with topological layout, colored nodes, bezier edges, DNA parts table
- **Simulation:** Time-series trajectory data

### Plugin System
- `PluginBase` with hooks: before/after compile, simulate, optimize, export
- `PluginManager` (singleton, env-var auto-discovery)
- Built-in `TimingPlugin` for performance measurement
- Integrated into CompilerPipeline and SimulationBackend

### Security
- Per-IP sliding-window rate limiter (60 req/min)
- Input validation: type checks, character limits (10k), array limits (500)
- JSON structured logging
- Restricted CORS origins

### Frontend
- React 19 + Vite + ReactFlow circuit editor
- Drag-and-drop gate palette (INPUT, AND, OR, NOT, OUTPUT)
- Inline node label editing
- Circuit compilation with status feedback
- Simulation panel with configurable parameters and Recharts line chart
- Export dropdown (SBOL / DNA / SVG)
- Parts list with role badges
- Keyboard shortcuts (Ctrl+Enter compile, Ctrl+Z undo, Ctrl+Shift+Z redo)
- Undo/redo history stack for circuit edits
- Toast notification system (success/error/warning/info)
- Save/load circuits to localStorage
- Template gallery with pre-built circuits (AND, OR, NOT gates)
- Loading spinners and inline error display
- Centralized design token system

---

## How Cyto Logic Works

```
User
 │
 ▼
Logic Expression
 │
 ▼
Client Layer
 │
 ▼
API Gateway
 │
 ▼
Lexer
 │
 ▼
Parser
 │
 ▼
Semantic Analyzer
 │
 ▼
Circuit Intermediate Representation (Graph)
 │
 ├──────────────┬──────────────┐
 ▼              ▼              ▼
Simulation  Optimization  Code Generators
 │              │              │
 ▼              ▼              ▼
Time-Series  Optimized    SBOL / FASTA / SVG
              Circuit
```

---

## Architecture

Cyto Logic follows a layered compiler architecture.

```
                    Client Layer
                         │
                         ▼
                    API Gateway
                         │
                         ▼
                 Compiler Frontend
                         │
                         ▼
        Circuit Intermediate Representation (CIR)
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
      Simulation   Optimization   Code Generators
              │          │          │
              └──────────┼──────────┘
                         │
                         ▼
                   Persistence
```

Every major subsystem has a single responsibility. The frontend never communicates directly with simulation or exporters. All downstream systems consume the Circuit Intermediate Representation.

---

## Testing

| Suite | Count | Coverage |
|-------|-------|----------|
| Backend (pytest) | 245 | Lexer, parser, AST, IR, simulation, optimization, backends, validation, middleware, plugins, health |
| Frontend (Vitest) | 71 | All components, theme tokens, API module, toast system, circuits |

---

## Tech Stack

- **Backend:** Python 3.14, Flask, SBOL2
- **Frontend:** React 19, Vite 8, @xyflow/react, Recharts, Axios
- **Infrastructure:** Docker, GitHub Actions CI
- **Runtime:** Bun (frontend), Python pip (backend)
- **Testing:** pytest (backend), Vitest + Testing Library (frontend)

---

## Project Philosophy

Cyto Logic is designed as reusable compiler infrastructure rather than a single-purpose application. The architecture follows several principles:

- Stateless compiler stages
- Modular components
- Layer separation
- Replaceable backends
- Shared intermediate representation
- Independent simulation
- Independent optimization
- Extensible export system

---

## References

- LLVM Compiler Infrastructure
- SBOL (Synthetic Biology Open Language)
- iGEM Registry of Standard Biological Parts
- Hill Function Models
- NSGA-II Multi-objective Optimization

---

## Disclaimer

Cyto Logic is an active research project intended for research, experimentation, and learning in compiler design and synthetic biology.
