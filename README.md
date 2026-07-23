# Cyto Logic

A compiler that turns boolean logic expressions into genetic circuit designs. Write `IF (aTc AND NOT AraC) -> GFP`, get back a list of BioBrick parts, SBOL XML, or a FASTA sequence.

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
    ┌───┴───┐
    Lexer   (character scan → tokens)
    Parser  (recursive descent → AST)
    Semantic (check proteins exist in DB)
    IR Builder (AST → graph of parts)
    ────
    Backends:
    SBOL  →  .xml (SBOL2 compliant)
    DNA   →  .fa  (FASTA with sequences)
    SVG   →  .svg (topology diagram)
    Sim   →  time-series plots
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
- `dna_backend.py` — FASTA output, concatenates sequences in order
- `sbol_backend.py` — SBOL2 XML with unique component IDs per part instance
- `svg_backend.py` — circuit topology diagram with auto-layout
- `simulation_stub.py` — Hill kinetics ODE solver (RK4)
- `optimization/` — GA + NSGA-II for tuning RBS strengths

**Frontend** (`frontend/`):
- React 19 + @xyflow/react circuit editor
- Drag-and-drop from parts palette
- Undo/redo, keyboard shortcuts
- Simulation panel with Recharts
- Export to SBOL / DNA / SVG

**Tests**: 245 backend (pytest) + 71 frontend (Vitest).

---

## Tricky Parts / Notes

- **Part order in XML was breaking early on.** The `parts_deduplicated()` method collapsed duplicate BioBricks (e.g., same RBS used in two places) into one entry, which meant the SBOL output had missing components and wrong sequence ordering. Fixed by keeping a separate `all_parts` list that preserves every instance — dedup only for complexity scoring.
- **VisBOL parsing assumes strict 5'→3'.**
  If the CDS index shifts during traversal the whole annotation is off. Made sure IR builder appends parts in traversal order and backends never re-sort.
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

- The parts database should come from an external file (CSV/JSON) instead of being hardcoded in Python. Loading from iGEM's API would be better long-term.
- AND/OR gate parts are placeholder hybrid promoters — real combinatorial logic needs layered repressor cascades or split-T7 systems.
- The SBOL exporter doesn't set sequence constraints on component definitions. Not strictly required for SBOL2 but tools like Cello expect them.
- Frontend could use Zustand or Jotai instead of prop-drilling through ReactFlow callbacks.
- Simulation parameters should be discoverable from the CIR instead of hardcoded in the backend.

---

## References

- iGEM Registry: https://parts.igem.org
- SBOL Standard: https://sbolstandard.org
- Nielsen et al., "Genetic circuit design automation" (Science, 2016)
- LLVM compiler architecture (for the IR design inspiration)
