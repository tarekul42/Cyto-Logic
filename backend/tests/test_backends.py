import pytest
from compiler.cir import CircuitIR
from compiler.backends.base import Backend
from compiler.backends.registry import get, list_backends
from compiler.backends.simulation_stub import SimulationBackend


class TestBackendAbstraction:
    def test_base_class_cannot_be_instantiated(self):
        with pytest.raises(TypeError):
            Backend()

    def test_simulation_stub_has_name(self):
        b = SimulationBackend()
        assert b.name == "Simulation"

    def test_simulation_stub_returns_summary(self):
        ir = CircuitIR()
        ir.add_node("n1", "aTc", "input")
        ir.add_part("BBa_E0040", "CDS", "GFP")
        b = SimulationBackend()
        result = b.generate(ir)
        assert result["status"] == "not_implemented"
        assert result["node_count"] == 1
        assert result["part_count"] == 1

    def test_registry_has_expected_backends(self):
        names = list_backends()
        assert "SBOL" in names
        assert "Simulation" in names

    def test_registry_get_returns_backend(self):
        b = get("SBOL")
        assert b is not None
        assert b.name == "SBOL"

    def test_registry_get_unknown_returns_none(self):
        assert get("NonExistent") is None
