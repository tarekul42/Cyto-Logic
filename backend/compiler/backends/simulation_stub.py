from .base import Backend


class SimulationBackend(Backend):
    @property
    def name(self):
        return "Simulation"

    def generate(self, cir):
        return {
            "status": "not_implemented",
            "message": "Simulation engine is under development (Phase 3).",
            "node_count": len(cir.nodes),
            "part_count": cir.complexity,
        }
