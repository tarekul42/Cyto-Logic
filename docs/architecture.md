# Architecture

## Overview

Cyto Logic is a layered compiler for synthetic biology. Each stage transforms a
biological logic expression through progressively lower-level representations.

```
Expression  →  Lexer  →  Parser  →  Semantic Analyzer  →  CircuitIR  →  Backends
```

## Compiler Pipeline

### 1. Lexer (`compiler/lexer.py`)
Tokenizes raw source text into `Token` objects. Recognizes keywords (`IF`, `NOT`,
`AND`, `OR`), identifiers (protein names), symbols (`(`, `)`, `->`).

### 2. Parser (`compiler/parser.py`)
Consumes tokens and produces an Abstract Syntax Tree (AST) using recursive descent.
AST node types: `Circuit`, `NotGate`, `AndGate`, `OrGate`, `ProteinNode`.

### 3. Semantic Analyzer (`compiler/semantic.py`)
Walks the AST to validate biological rules:
- Undefined proteins and outputs
- Null inputs to gates
- Deeply nested circuits (depth limit)
- Duplicate warnings

Returns a list of `SemanticMessage` objects (severity: error/warning/info).

### 4. IR Builder (`compiler/ir_builder.py`)
Transforms the AST into a `CircuitIR` — a graph-based intermediate representation.
Each node has a unique ID, label, type, and metadata. Edges represent regulatory
connections. Parts (DNA sequences) are attached to gates.

## Intermediate Representation

### CircuitIR (`compiler/cir.py`)
The core data structure. Fields:
- `logic_statement`: Original source
- `output_protein`: Target reporter
- `_nodes`: dict of `node_id → {label, type, ...}`
- `_edges`: list of `(source_id, target_id)`
- `_parts`: list of `{id, role, info}`

## Simulation Engine

### Models (`compiler/simulation/models.py`)
Hill kinetics functions:
- `hill_activator(c, vmax, kd, n)`: Activator Hill equation
- `hill_repressor(c, vmax, kd, n)`: Repressor Hill equation
- `or_combine(a, b)`: Logical OR of two activation levels
- `and_combine(a, b)`: Logical AND of two activation levels
- `degradation(c, delta)`: Linear degradation

### ODE System (`compiler/simulation/ode_system.py`)
Builds a system of ODEs from a CircuitIR. Each gate node maps to a production
term based on its kinetics type. Inputs are constant. Supports per-species
parameter overrides.

### Solver (`compiler/simulation/solver.py`)
RK4 integrator with configurable step size. No external dependencies.

## Optimization Engine

### NSGA-II (`compiler/optimization/nsga2.py`)
Multi-objective genetic algorithm:
- Fast non-dominated sorting
- Crowding distance
- Crowded tournament selection
- Uniform crossover
- Gaussian mutation

### Objectives (`compiler/optimization/objectives.py`)
Three objectives minimized simultaneously:
1. **Expression accuracy**: `|final_output - target|`
2. **Metabolic burden**: sum of average protein concentrations
3. **Noise robustness**: trajectory sensitivity to perturbations

## Plugin System

### Plugin Manager (`compiler/plugin/manager.py`)
Singleton that discovers and loads plugins. Hooks fire at pipeline stages:
`before_compile`, `after_compile`, `before_simulate`, `after_simulate`,
`before_optimize`, `after_optimize`, `before_export`, `after_export`.

Plugins can be loaded via the `CYTOLOGIC_PLUGINS` environment variable
(comma-separated Python module paths).

### Built-in Plugins
- **TimingPlugin**: Records elapsed time for compile/simulate/optimize stages.

## Backend Abstraction

### Backend Base (`compiler/backends/base.py`)
Abstract base class. Subclasses implement `generate(cir, **kwargs)`.

### Registry (`compiler/backends/registry.py`)
Global registry of named backends. Currently registered:
- **SBOL**: SBOL XML export
- **Simulation**: Time-series simulation
- **DNA**: FASTA sequence export

## Data Flow

```
User Input
    │
    ▼
app.py (Flask API)
    │
    ├── /api/compile  → CompilerPipeline → CircuitIR → JSON
    ├── /api/simulate → CompilerPipeline → SimulationBackend → JSON
    ├── /api/optimize → CompilerPipeline → OptimizationRunner → JSON
    ├── /api/export/sbol → SBOLBackend → XML
    ├── /api/export/dna  → DNABackend → FASTA
    ├── /api/parts   → Parts Database → JSON
    └── /api/health  → OK → JSON
```
