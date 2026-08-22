import math
import pytest
from compiler.cir import CircuitIR
from compiler.simulation.models import (
    hill_activator,
    hill_repressor,
    or_combine,
    and_combine,
    degradation,
    DEFAULT_VMAX,
    DEFAULT_KD,
    DEFAULT_HILL_N,
)
from compiler.simulation.ode_system import ODESystem
from compiler.simulation.solver import Solver
from compiler.simulation.simulation import simulate_circuit, SimulationResult


class TestHillModels:
    def test_hill_activator_zero(self):
        assert hill_activator(0, 10, 1, 2) == 0.0

    def test_hill_activator_at_kd(self):
        result = hill_activator(1.0, 10, 1, 2)
        assert result == pytest.approx(5.0, rel=1e-3)

    def test_hill_activator_saturates(self):
        result = hill_activator(1000, 10, 1, 2)
        assert result == pytest.approx(10.0, rel=1e-3)

    def test_hill_repressor_zero(self):
        result = hill_repressor(0, 10, 1, 2)
        assert result == pytest.approx(10.0, rel=1e-3)

    def test_hill_repressor_at_kd(self):
        result = hill_repressor(1.0, 10, 1, 2)
        assert result == pytest.approx(5.0, rel=1e-3)

    def test_hill_repressor_saturates(self):
        result = hill_repressor(1000, 10, 1, 2)
        assert result == pytest.approx(0.0, abs=1e-3)

    def test_hill_activator_default_params(self):
        result = hill_activator(1.0)
        assert result == pytest.approx(5.0, rel=1e-3)

    def test_negative_concentration_clamps(self):
        assert hill_activator(-1, 10, 1, 2) == 0.0

    def test_invalid_kd_returns_zero(self):
        assert hill_activator(5, 10, 0, 2) == 0.0

    def test_invalid_n_returns_zero(self):
        assert hill_activator(5, 10, 1, 0) == 0.0


class TestGateCombiners:
    def test_or_both_zero(self):
        assert or_combine(0, 0) == 0.0

    def test_or_one_active(self):
        assert or_combine(10, 0) == 10.0
        assert or_combine(0, 10) == 10.0

    def test_or_both_active(self):
        result = or_combine(0.5, 0.5)
        assert result == pytest.approx(0.75, rel=1e-3)

    def test_or_never_negative(self):
        for vmax in [1, 5, 10, 20, 100]:
            for a1 in [0, vmax/2, vmax, vmax*2]:
                for a2 in [0, vmax/2, vmax, vmax*2]:
                    assert or_combine(a1, a2) >= 0.0

    def test_and_both_zero(self):
        assert and_combine(0, 0) == 0.0

    def test_and_one_zero(self):
        assert and_combine(10, 0) == 0.0

    def test_and_both_active(self):
        assert and_combine(5, 3) == 15.0


class TestDegradation:
    def test_degradation_zero(self):
        assert degradation(0, 0.5) == 0.0

    def test_degradation_linear(self):
        assert degradation(10, 0.5) == 5.0

    def test_negative_concentration_clamps(self):
        assert degradation(-5, 0.5) == 0.0

    def test_negative_delta_clamps(self):
        assert degradation(10, -1) == 0.0


class TestODESystem:
    def test_build_simple_not(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        ode = ODESystem(ir)
        assert ode.num_species == 3
        assert "aTc" in ode.species
        assert "NOT" in ode.species
        assert "GFP" in ode.species

    def test_simple_not_eval(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        ode = ODESystem(ir, inputs={"aTc": 10.0})
        y0 = [0.0] * ode.num_species
        dydt = ode.eval(0, y0)
        assert len(dydt) == 3

    def test_build_and_gate(self):
        ir = CircuitIR(logic_statement="IF (aTc AND AraC) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "AraC", "input")
        ir.add_node("n3", "AND", "gate")
        ir.add_node("n4", "GFP", "output")
        ir.add_edge("n1", "n3")
        ir.add_edge("n2", "n3")
        ir.add_edge("n3", "n4")
        ode = ODESystem(ir)
        assert ode.num_species == 4

    def test_build_or_gate(self):
        ir = CircuitIR(logic_statement="IF (aTc OR AraC) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "AraC", "input")
        ir.add_node("n3", "OR", "gate")
        ir.add_node("n4", "GFP", "output")
        ir.add_edge("n1", "n3")
        ir.add_edge("n2", "n3")
        ir.add_edge("n3", "n4")
        ode = ODESystem(ir)
        assert ode.num_species == 4


class TestSolver:
    def test_rk4_simple(self):
        def ode(t, y):
            return [-y[0]]
        solver = Solver(dt=0.01)
        t, y = solver.run(ode, [1.0], (0, 1))
        assert len(t) == 101
        assert abs(y[-1][0] - math.exp(-1)) < 0.01

    def test_dt_must_be_positive(self):
        with pytest.raises(ValueError):
            Solver(dt=0)

    def test_t_span_must_be_valid(self):
        solver = Solver(dt=0.01)
        with pytest.raises(ValueError):
            solver.run(lambda t, y: [0], [0], (5, 0))

    def test_large_dt_never_negative(self):
        ir = CircuitIR(logic_statement="IF (NOT aTc) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        for dt in [6, 8, 10, 20, 50]:
            result = simulate_circuit(ir, inputs={"aTc": 1.0},
                                      t_span=(0, 100), dt=dt)
            for sp in result.species:
                traj = result.trajectory(sp)
                assert min(traj) >= 0.0, f"negative at dt={dt}, {sp}"

    def test_large_dt_matches_small_dt_reference(self):
        ir = CircuitIR(logic_statement="IF (NOT aTc) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        ref = simulate_circuit(ir, inputs={"aTc": 1.0},
                               t_span=(0, 100), dt=0.05)
        coarse = simulate_circuit(ir, inputs={"aTc": 1.0},
                                  t_span=(0, 100), dt=10.0)
        assert coarse.final_concentration("GFP") == \
            pytest.approx(ref.final_concentration("GFP"), rel=0.25)

    def test_solver_records_stable_step_limit(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        ode = ODESystem(ir, params={"delta": 0.5})
        solver = Solver(dt=8.0, method="rk4")
        solver.run(ode, [0.0, 0.0, 0.0], (0, 10))
        assert solver.stable_step_limit is not None
        assert solver.stable_step_limit == pytest.approx(
            0.8 * 2.785 / 0.5, rel=1e-3
        )

    def test_substepping_uses_decay_rate_info(self):
        class Decay:
            max_decay_rate = 1.0

            def __call__(self, t, y):
                return [-y[0]]

        ode = Decay()
        solver = Solver(dt=5.0, method="rk4")
        t, y = solver.run(ode, [1.0], (0, 20))
        assert solver.stable_step_limit == pytest.approx(0.8 * 2.785)
        assert len(t) == 5
        assert 0.0 <= y[-1][0] < 1e-2

    def test_final_point_lands_on_t_end(self):
        def ode(t, y):
            return [-y[0]]
        solver = Solver(dt=0.3)
        t, _ = solver.run(ode, [1.0], (0, 1))
        assert t[-1] == pytest.approx(1.0)

    def test_stability_warning_emitted_for_coarse_dt(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        result = simulate_circuit(ir, inputs={"aTc": 1.0},
                                  t_span=(0, 50), dt=8.0, method="rk4")
        assert len(result.warnings) == 1
        d = result.to_dict()
        assert d["warnings"] == result.warnings

    def test_no_warning_for_fine_dt(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        result = simulate_circuit(ir, inputs={"aTc": 1.0},
                                  t_span=(0, 50), dt=0.1)
        assert result.warnings == []

    @pytest.mark.parametrize("gate", ["NOT", "AND", "OR", "NAND", "NOR"])
    def test_all_gate_types_stay_nonnegative_any_dt(self, gate):
        ir = CircuitIR(logic_statement=f"IF (aTc {gate} AraC) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "AraC", "input")
        ir.add_node("n3", gate, "gate")
        ir.add_node("n4", "GFP", "output")
        ir.add_edge("n1", "n3")
        ir.add_edge("n2", "n3")
        ir.add_edge("n3", "n4")
        for dt in [0.01, 0.5, 2, 7, 15, 40]:
            result = simulate_circuit(ir, inputs={"aTc": 1.0},
                                      t_span=(0, 60), dt=dt)
            assert result.warnings == [] or dt > 5
            for sp in result.species:
                traj = result.trajectory(sp)
                assert min(traj) >= 0.0, f"negative {sp} at dt={dt}, {gate}"

    def test_input_species_converges_to_target(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        target = 5.0
        result = simulate_circuit(ir, inputs={"aTc": target},
                                  t_span=(0, 50), dt=0.1)
        traj = result.trajectory("aTc")
        assert traj[-1] == pytest.approx(target, rel=1e-3)
        assert max(traj) <= target + 1e-6

    def test_input_respects_per_species_delta(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        result = simulate_circuit(
            ir, inputs={"aTc": 10.0}, params={"aTc": {"delta": 1.0}},
            t_span=(0, 20), dt=0.1,
        )
        # faster delta converges quicker than default 0.5
        halfway = result.times.index(next(
            t for t in result.times if t >= 3))
        expected = 10.0 * (1 - math.exp(-3))
        assert abs(result.trajectory("aTc")[halfway] - expected) / expected \
            < 0.1


class TestAdaptiveSolver:
    def test_unknown_method_rejected(self):
        with pytest.raises(ValueError):
            Solver(dt=0.1, method="euler")

    def test_rk45_matches_analytic_decay_tightly(self):
        class Decay:
            def __call__(self, t, y):
                return [-y[0]]

        solver = Solver(dt=1.0, method="rk45", rtol=1e-8, atol=1e-12)
        _, y = solver.run(Decay(), [1.0], (0, 10))
        assert abs(y[-1][0] - math.exp(-10)) / math.exp(-10) < 1e-6

    def test_rk45_beats_fixed_rk4_on_coarse_grid(self):
        class Decay:
            max_decay_rate = 1.0

            def __call__(self, t, y):
                return [-y[0]]

        ode = Decay()
        _, y_fixed = Solver(dt=2.5, method="rk4").run(ode, [1.0], (0, 10))
        _, y_adapt = Solver(dt=2.5, method="rk45").run(ode, [1.0], (0, 10))
        true = math.exp(-10)
        err_fixed = abs(y_fixed[-1][0] - true)
        err_adapt = abs(y_adapt[-1][0] - true)
        assert err_adapt < err_fixed

    def test_rk45_output_grid_preserved(self):
        class Decay:
            def __call__(self, t, y):
                return [-y[0]]

        t, _ = Solver(dt=3.7, method="rk45").run(Decay(), [1.0], (0, 20))
        assert len(t) == 7
        assert t[-1] == pytest.approx(20.0)

    def test_rk45_nonnegative_on_circuit(self):
        ir = CircuitIR(logic_statement="IF (NOT aTc) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        result = simulate_circuit(ir, inputs={"aTc": 1.0},
                                  t_span=(0, 100), dt=10.0, method="rk45")
        assert result.warnings == []
        for sp in result.species:
            assert min(result.trajectory(sp)) >= 0.0

    def test_rk45_and_rk4_agree_on_circuit(self):
        ir = CircuitIR(logic_statement="IF (aTc OR AraC) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "AraC", "input")
        ir.add_node("n3", "OR", "gate")
        ir.add_node("n4", "GFP", "output")
        ir.add_edge("n1", "n3")
        ir.add_edge("n2", "n3")
        ir.add_edge("n3", "n4")
        fine = simulate_circuit(ir, inputs={"aTc": 1.0}, t_span=(0, 60),
                                dt=0.05, method="rk45",
                                rtol=1e-9, atol=1e-12)
        coarse = simulate_circuit(ir, inputs={"aTc": 1.0}, t_span=(0, 60),
                                  dt=20.0, method="rk45")
        assert coarse.final_concentration("GFP") == \
            pytest.approx(fine.final_concentration("GFP"), rel=0.01)


class TestSimulation:
    def test_simulate_simple_not(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        result = simulate_circuit(ir, inputs={"aTc": 10.0},
                                  t_span=(0, 10), dt=0.1)
        assert result.num_points == 101
        assert result.num_species == 3

    def test_simulation_result_to_dict(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        result = simulate_circuit(ir, inputs={"aTc": 10.0},
                                  t_span=(0, 5), dt=0.5)
        d = result.to_dict()
        assert "times" in d
        assert "species" in d
        assert "trajectories" in d
        assert len(d["times"]) == 11

    def test_trajectory_access(self):
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        result = simulate_circuit(ir, inputs={"aTc": 10.0},
                                  t_span=(0, 1), dt=0.5)
        traj = result.trajectory("GFP")
        assert len(traj) == 3

    def test_trajectory_unknown_species(self):
        result = SimulationResult([0], [[0]], ["X"])
        with pytest.raises(ValueError):
            result.trajectory("Y")

    def test_final_concentration(self):
        result = SimulationResult([0, 1], [[0, 0], [0, 5]], ["X", "Y"])
        assert result.final_concentration("Y") == 5.0

    def test_simulate_with_and_gate(self):
        ir = CircuitIR(logic_statement="IF (aTc AND AraC) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "AraC", "input")
        ir.add_node("n3", "AND", "gate")
        ir.add_node("n4", "GFP", "output")
        ir.add_edge("n1", "n3")
        ir.add_edge("n2", "n3")
        ir.add_edge("n3", "n4")
        result = simulate_circuit(ir, inputs={"aTc": 10.0, "AraC": 10.0},
                                  t_span=(0, 10), dt=0.1)
        assert result.num_points == 101

    def test_simulate_with_or_gate(self):
        ir = CircuitIR(logic_statement="IF (aTc OR AraC) -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "AraC", "input")
        ir.add_node("n3", "OR", "gate")
        ir.add_node("n4", "GFP", "output")
        ir.add_edge("n1", "n3")
        ir.add_edge("n2", "n3")
        ir.add_edge("n3", "n4")
        result = simulate_circuit(ir, inputs={"aTc": 0.0, "AraC": 10.0},
                                  t_span=(0, 10), dt=0.1)
        assert result.num_points == 101

    def test_simulation_backend_now_returns_data(self):
        from compiler.backends.simulation_backend import SimulationBackend
        ir = CircuitIR(logic_statement="IF aTc -> GFP")
        ir.add_node("n1", "aTc", "input")
        ir.add_node("n2", "NOT", "gate")
        ir.add_node("n3", "GFP", "output")
        ir.add_edge("n1", "n2")
        ir.add_edge("n2", "n3")
        backend = SimulationBackend(t_span=(0, 5), dt=0.5)
        result = backend.generate(ir, inputs={"aTc": 10.0})
        assert "times" in result
        assert "trajectories" in result
        assert "GFP" in result["trajectories"]
