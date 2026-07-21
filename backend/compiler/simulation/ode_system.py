from .models import (
    hill_activator,
    hill_repressor,
    or_combine,
    and_combine,
    degradation,
    DEFAULT_VMAX,
    DEFAULT_KD,
    DEFAULT_HILL_N,
    DEFAULT_DELTA,
)


class ODESystem:
    def __init__(self, cir, inputs=None):
        self._cir = cir
        self._inputs = inputs or {}
        self._species, self._rates = self._build()

    def _build(self):
        species = []
        rates = {}
        nodes = dict(self._cir.nodes)

        gate_map = {}
        input_map = {}

        for nid, data in nodes.items():
            if data.get("type") == "input":
                input_map[nid] = data["label"]
            elif data.get("type") == "gate":
                gate_map[nid] = data["label"]

        edges = list(self._cir.edges)

        for nid, data in nodes.items():
            label = data["label"]
            ntype = data.get("type", "input")

            if ntype == "input":
                species.append(label)
                rates[label] = _InputRate(label, self._inputs.get(label, 1.0))
            elif ntype == "gate":
                gate_inputs = [s for s, t in edges if t == nid]
                input_labels = [
                    nodes[gi]["label"] for gi in gate_inputs if gi in nodes
                ]
                species.append(label)
                rates[label] = _GateRate(
                    label, data["label"], input_labels
                )
            elif ntype == "output":
                output_inputs = [s for s, t in edges if t == nid]
                input_labels = [
                    nodes[gi]["label"] for gi in output_inputs if gi in nodes
                ]
                species.append(label)
                rates[label] = _GateRate(
                    label, data["label"], input_labels
                )

        return species, rates

    @property
    def species(self):
        return list(self._species)

    @property
    def num_species(self):
        return len(self._species)

    def _idx(self, name):
        return self._species.index(name)

    def __call__(self, t, y):
        return self.eval(t, y)

    def eval(self, t, y):
        concentrations = dict(zip(self._species, y))
        dydt = [0.0] * self.num_species
        for name, rate in self._rates.items():
            dydt[self._idx(name)] = rate(t, concentrations)
        return dydt


class _InputRate:
    def __init__(self, name, value):
        self._name = name
        self._value = value

    def __call__(self, t, conc):
        return 0.0


class _GateRate:
    def __init__(self, name, gate_type, input_labels):
        self._name = name
        self._gate_type = gate_type
        self._input_labels = input_labels

    def __call__(self, t, conc):
        if self._gate_type in ("NOT", "not"):
            input_conc = (
                conc.get(self._input_labels[0], 0.0)
                if self._input_labels
                else 0.0
            )
            prod = hill_repressor(input_conc)
        elif self._gate_type in ("AND", "and"):
            c1 = conc.get(self._input_labels[0], 0.0) if len(self._input_labels) > 0 else 0.0
            c2 = conc.get(self._input_labels[1], 0.0) if len(self._input_labels) > 1 else 0.0
            a1 = hill_activator(c1)
            a2 = hill_activator(c2)
            prod = and_combine(a1, a2)
        elif self._gate_type in ("OR", "or"):
            c1 = conc.get(self._input_labels[0], 0.0) if len(self._input_labels) > 0 else 0.0
            c2 = conc.get(self._input_labels[1], 0.0) if len(self._input_labels) > 1 else 0.0
            a1 = hill_activator(c1)
            a2 = hill_activator(c2)
            prod = or_combine(a1, a2)
        elif self._gate_type == "output":
            input_conc = (
                conc.get(self._input_labels[0], 0.0)
                if self._input_labels
                else 0.0
            )
            prod = hill_activator(input_conc)
        else:
            prod = 0.0

        current_conc = conc.get(self._name, 0.0)
        deg = degradation(current_conc, DEFAULT_DELTA)
        return prod - deg
