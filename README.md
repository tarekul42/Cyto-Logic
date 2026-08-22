# Cyto Logic

A compiler that turns boolean logic expressions into genetic circuit designs. Write `IF (aTc AND NOT AraC) -> GFP`, get back a list of BioBrick parts, SBOL XML, a FASTA sequence, or a time-series simulation.

Built as a senior capstone / research project exploring how compiler design patterns (lexer → parser → IR → codegen) map onto synthetic biology workflows.

---

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py              # starts Flask on :5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                # Vite on :5173
```

Open `http://localhost:5173`, drag some gates onto the canvas, hit Compile.

Or from Python directly:
```python
from compiler.pipeline import CompilerPipeline
pipeline = CompilerPipeline()
cir, messages = pipeline.run("IF (aTc AND AraC) -> GFP")
print(cir.all_parts)  # [promoter, RBS, GFP, terminator]
```

---

## How It Works

```
"IF (NOT aTc) -> GFP"
        │
    ┌───┴──────────────────────────┐
    │  Client (React + ReactFlow)  │
    └───┬──────────────────────────┘
        │
    ┌───┴──────────────────────────┐
    │  API Gateway (Flask routes)  │
    └───┬──────────────────────────┘
        │
    ┌───┴──────────────────────────┐
    │  Compiler Frontend           │
    │  Lexer → Parser → Semantic   │
    └───┬──────────────────────────┘
        │
    ┌───┴──────────────────────────┐
    │  Circuit IR (CIR)            │
    │  Graph of parts in 5'→3'     │
    └───┬──────────────────────────┘
        │
    ┌───┴──────────────────────────┐
    │  Simulation / Optimization   │
    │  Hill-ODE · GA · NSGA-II    │
    └───┬──────────────────────────┘
        │
    ┌───┴──────────────────────────┐
    │  Code Generators (Backends)  │
    │  SBOL2 · DNA FASTA · GenBank│
    │  SVG topology · ODE solver   │
    └───┬──────────────────────────┘
        │
    ┌───┴──────────────────────┐
    │  Compiled Artifacts      │
    │  .xml · .fa · .gb · .svg│
    │  + time-series plots     │
    └──────────────────────────┘

Knowledge Base (parts.json) feeds into the Lexer/Semantic/IR stages.
Circuit Persistence (localStorage) manages saved designs.
```

Each backend gets the same intermediate representation (CIR) — a list of parts in 5'→3' order. No backend-specific logic in the compiler core.

---

## What I Built

**Compiler core** (`backend/compiler/`):
- `lexer.py` / `parser.py` — simple recursive-descent, supports `IF`, `AND`, `OR`, `NOT`, parens
- `semantic.py` — checks that input molecules and reporters are defined in the parts DB, warns about unknowns
- `ir_builder.py` — walks the AST, selects BioBrick parts per gate type from `parts_db.py`
- `cir.py` — graph-based intermediate representation (nodes = gates/inputs, edges = signal flow, parts = DNA assembly list)
- `pipeline.py` — orchestrates the full compile chain

**Parts database** (`parts_db.py`):
- ~30 iGEM BioBrick parts mapped to roles: promoters (pTet, pLac, pBad, etc.), RBS (strong/medium), CDS (TetR, LacI, cI, LuxR, GFP, RFP, BFP, YFP, mCherry), terminators
- Regulatory map for repression/induction relationships

**Backends**:
- `dna_backend.py` — FASTA output, concatenates sequences in order; reverse-complements `-` strand parts
- `genbank_backend.py` — GenBank format with `complement()` for reverse-strand features
- `sbol_backend.py` — SBOL2 XML with unique component IDs and strand orientation per part
- `svg_backend.py` — circuit topology diagram with auto-layout
- `simulation_backend.py` — Hill kinetics ODE solver (RK4) with tunable parameters (n, Kd, α, γ)

**Frontend** (`frontend/`):
- React 19 + @xyflow/react circuit editor
- Drag-and-drop from parts palette
- Undo/redo, keyboard shortcuts
- Simulation panel with parameter sliders and debounced auto-simulation
- Export to SBOL / DNA / GenBank / SVG
- Strand orientation toggle per gate (+/-)
- Theme toggle (dark/light)

**Key features**:
- **Strand orientation** — every gate can be `+` (forward) or `-` (reverse); `-` output triggers reverse-complement of the DNA sequence and `complement()` wrapping in GenBank
- **Knowledge Base** (`backend/data/parts.json`) — parts are defined in an external JSON file with expanded schema (sequence, chassis_compatibility, parameters), loaded at startup by `knowledge_base.py`
- **ODE parameter sweeps** — the simulation panel exposes Hill coefficient (n), dissociation constant (Kd), maximal production rate (α), and degradation rate (γ) as sliders; changes trigger a 300ms debounced re-simulation

**Tests**: 298 backend (pytest) + 68 frontend (Vitest).

---

## Tricky Parts / Notes

- **Part deduplication broke SBOL order.** The `parts_deduplicated()` method collapsed duplicate BioBricks (e.g., same RBS used in two places) into one entry, which meant the SBOL output had missing components and wrong sequence ordering. Fixed by keeping a separate `all_parts` list that preserves every instance — dedup only for complexity scoring.
- **VisBOL parsing assumes strict 5'→3'.**
  If the CDS index shifts during traversal the whole annotation is off. Made sure IR builder appends parts in traversal order and backends never re-sort.
- **Strand orientation required non-local changes.** Adding a `strand` property to gates meant touching every layer: AST nodes → CircuitIR (add_part) → IR builder (strand propagation) → DNA/GenBank/SBOL backends (reverse-complement logic). The GenBank backend needed special handling to emit `complement(start..end)` instead of plain coordinates for `-` strand features.
- **Knowledge Base decoupling from hardcoded dicts.** The original `parts_db.py` had 5 Python dictionaries with BioBrick data. Extracting this into `backend/data/parts.json` required a `knowledge_base.py` module that caches JSON at startup, plus careful backward-compatible re-exports so existing code using `from parts_db import GATES_DB` still works.
- **ODE parameters needed flat-vs-nested detection.** When passing global parameters (hill_n, kd, vmax, delta) through the simulation API, the `ode_system.py` must distinguish flat key-value pairs from per-species nested parameter dicts. A `_is_flat()` helper solves this by checking if all values are numeric scalars.
- **Hill function parameters are approximated** from literature — not tuned for any specific chassis. The simulation is qualitative, not quantitative.
- **Gate definitions only have promoter + RBS**, the CDS is selected dynamically based on the input molecule (e.g., aTc → TetR, AraC → LacI). This keeps the gate DB small but means AND/OR gates don't have repressor CDS yet — they just have the hybrid promoter.
- **Frontend graph → logic conversion** uses topological backtracking from output node. Cycle detection prevents infinite loops but complex nested circuits get verbose string output.

---

## Project Layout

```
backend/
  app.py                   # Flask API routes
  compiler/
    lexer.py, parser.py    # frontend stages
    semantic.py            # protein validation
    ir_builder.py          # AST → CIR
    cir.py                 # intermediate representation
    parts_db.py            # BioBrick reference data
    pipeline.py            # compile orchestrator
    gate_mapper.py         # thin wrapper around IR builder
    backends/              # sbol, dna, svg, simulation
    optimization/          # GA, NSGA-II
    plugin/                # hook system
  tests/                   # pytest suite
frontend/
  src/
    components/            # ReactFlow canvas, panels
    api/                   # REST client
    hooks/                 # undo/redo history
    test/                  # Vitest suite
docs/
  api.md, architecture.md, development.md
```

---

## Things I'd Do Differently

- AND/OR gate parts are placeholder hybrid promoters — real combinatorial logic needs layered repressor cascades or split-T7 systems.
- The SBOL exporter doesn't set sequence constraints on component definitions. Not strictly required for SBOL2 but tools like Cello expect them.
- Frontend could use Zustand or Jotai instead of prop-drilling through ReactFlow callbacks.
- Simulation parameters should be discoverable from the CIR instead of hardcoded in the backend.
- The knowledge base could load directly from iGEM's API instead of a static JSON file.

---

## References

- iGEM Registry: https://parts.igem.org
- SBOL Standard: https://sbolstandard.org
- Nielsen et al., "Genetic circuit design automation" (Science, 2016)
- LLVM compiler architecture (for the IR design inspiration)
