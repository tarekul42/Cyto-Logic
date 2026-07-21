from .base import Backend
from ..simulation import simulate_circuit


class SimulationBackend(Backend):
    def __init__(self, t_span=(0, 100), dt=0.01):
        self._t_span = t_span
        self._dt = dt

    @property
    def name(self):
        return "Simulation"

    def generate(self, cir, inputs=None):
        result = simulate_circuit(cir, inputs=inputs,
                                  t_span=self._t_span, dt=self._dt)
        return result.to_dict()
