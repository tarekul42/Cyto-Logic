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
    def __init__(self, cir, inputs=None, params=None):
        self._cir = cir
        self._inputs = inputs or {}
        self._params = params or {}
        self._species, self._rates = self._build()

    def _build(self):
        species = []
        rates = {}
        nodes = dict(self._cir.nodes)
        edges = list(self._cir.edges)

        for nid, data in nodes.items():
            label = data["label"]
            ntype = data.get("type", "input")
            sp_params = self._params.get(label, {})

            if ntype == "input":
                species.append(label)
                rates[label] = _InputRate()
            else:
                input_labels = [
                    nodes[src]["label"]
                    for src, tgt in edges
                    if tgt == nid and src in nodes
                ]
                species.append(label)
                rates[label] = _GateRate(
                    label, data["label"], input_labels, sp_params
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
    def __call__(self, t, conc):
        return 0.0


class _GateRate:
    def __init__(self, name, gate_type, input_labels, params=None):
        self._name = name
        self._gate_type = gate_type
        self._input_labels = input_labels
        self._params = params or {}

    def _v(self, name, default):
        return self._params.get(name, default)

    def __call__(self, t, conc):
        vmax = self._v("vmax", DEFAULT_VMAX)
        kd = self._v("kd", DEFAULT_KD)
        hn = self._v("hill_n", DEFAULT_HILL_N)
        delta = self._v("delta", DEFAULT_DELTA)

        if self._gate_type in ("NOT", "not"):
            input_conc = (
                conc.get(self._input_labels[0], 0.0)
                if self._input_labels
                else 0.0
            )
            prod = hill_repressor(input_conc, vmax, kd, hn)
        elif self._gate_type in ("AND", "and"):
            c1 = conc.get(self._input_labels[0], 0.0) if len(self._input_labels) > 0 else 0.0
            c2 = conc.get(self._input_labels[1], 0.0) if len(self._input_labels) > 1 else 0.0
            a1 = hill_activator(c1, vmax, kd, hn)
            a2 = hill_activator(c2, vmax, kd, hn)
            prod = and_combine(a1, a2)
        elif self._gate_type in ("OR", "or"):
            c1 = conc.get(self._input_labels[0], 0.0) if len(self._input_labels) > 0 else 0.0
            c2 = conc.get(self._input_labels[1], 0.0) if len(self._input_labels) > 1 else 0.0
            a1 = hill_activator(c1, vmax, kd, hn)
            a2 = hill_activator(c2, vmax, kd, hn)
            prod = or_combine(a1, a2)
        elif self._gate_type == "output":
            input_conc = (
                conc.get(self._input_labels[0], 0.0)
                if self._input_labels
                else 0.0
            )
            prod = hill_activator(input_conc, vmax, kd, hn)
        else:
            prod = 0.0

        current_conc = conc.get(self._name, 0.0)
        deg = degradation(current_conc, delta)
        return prod - deg
