from .sbol_backend import SBOLBackend
from .simulation_stub import SimulationBackend


_BACKENDS = {}


def register(backend):
    _BACKENDS[backend.name] = backend


def get(name):
    return _BACKENDS.get(name)


def list_backends():
    return list(_BACKENDS.keys())


register(SBOLBackend())
register(SimulationBackend())
