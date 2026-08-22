RK4_REAL_AXIS_LIMIT = 2.785
STABILITY_SAFETY_FACTOR = 0.8

_DP54_C = [0.0, 1.0 / 5.0, 3.0 / 10.0, 4.0 / 5.0, 8.0 / 9.0, 1.0, 1.0]
_DP54_A = [
    [],
    [1.0 / 5.0],
    [3.0 / 40.0, 9.0 / 40.0],
    [44.0 / 45.0, -56.0 / 15.0, 32.0 / 9.0],
    [19372.0 / 6561.0, -25360.0 / 2187.0, 64448.0 / 6561.0, -212.0 / 729.0],
    [9017.0 / 3168.0, -355.0 / 33.0, 46732.0 / 5247.0,
     49.0 / 176.0, -5103.0 / 18656.0],
    [35.0 / 384.0, 0.0, 500.0 / 1113.0, 125.0 / 192.0,
     -2187.0 / 6784.0, 11.0 / 84.0],
]
_DP54_B5 = [35.0 / 384.0, 0.0, 500.0 / 1113.0, 125.0 / 192.0,
            -2187.0 / 6784.0, 11.0 / 84.0, 0.0]
_DP54_B4 = [5179.0 / 57600.0, 0.0, 7571.0 / 16695.0, 393.0 / 640.0,
            -92097.0 / 339200.0, 187.0 / 2100.0, 1.0 / 40.0]

_ADAPTIVE_MIN_H = 1e-12
_ADAPTIVE_MAX_STEPS_PER_INTERVAL = 10000
_STEP_SCALE_MAX = 5.0
_STEP_SCALE_MIN = 0.2


class Solver:
    def __init__(self, dt=0.01, method="rk45", rtol=1e-6, atol=1e-9):
        if dt <= 0:
            raise ValueError("dt must be positive")
        if method not in ("rk45", "rk4"):
            raise ValueError(f"Unknown solver method: {method}")
        self.dt = dt
        self.method = method
        self.rtol = rtol
        self.atol = atol
        self.stable_step_limit = None

    def run(self, ode_system, y0, t_span):
        t0, t1 = t_span
        if t1 <= t0:
            raise ValueError("t_span[1] must be greater than t_span[0]")
        times = []
        values = []
        t = t0
        y = list(y0)
        times.append(t)
        values.append(list(y))
        h_max = self._stable_step(ode_system) if self.method == "rk4" else None
        while t < t1 - 1e-12:
            t_next = min(t + self.dt, t1)
            if self.method == "rk45":
                t, y = self._integrate_interval_adaptive(
                    ode_system, t, y, t_next,
                )
            else:
                t, y = self._integrate_interval(
                    ode_system, t, y, t_next, h_max,
                )
            times.append(t)
            values.append(list(y))
        return times, values

    def _stable_step(self, ode_system):
        rate = getattr(ode_system, "max_decay_rate", None)
        if not isinstance(rate, (int, float)) or rate <= 0:
            return self.dt
        limit = STABILITY_SAFETY_FACTOR * RK4_REAL_AXIS_LIMIT / rate
        self.stable_step_limit = limit
        return min(self.dt, limit)

    @staticmethod
    def _integrate_interval(ode_system, t, y, t_next, h_max):
        while t < t_next - 1e-12:
            h = min(h_max, t_next - t)
            y = Solver._rk4(ode_system, t, y, h)
            y = [max(0.0, v) for v in y]
            t += h
        return t, y

    def _integrate_interval_adaptive(self, ode_system, t, y, t_next):
        h = min(self.dt, t_next - t)
        steps = 0
        while t < t_next - 1e-12:
            steps += 1
            if steps > _ADAPTIVE_MAX_STEPS_PER_INTERVAL:
                raise RuntimeError(
                    f"Adaptive solver exceeded "
                    f"{_ADAPTIVE_MAX_STEPS_PER_INTERVAL} internal steps; "
                    "the system may be too stiff to integrate."
                )
            h = min(h, t_next - t)
            scale = max(abs(v) for v in y) if y else 0.0
            tol = self.atol + self.rtol * scale
            y_new, err = self._dp54_step(ode_system, t, y, h)

            if err <= tol or h <= _ADAPTIVE_MIN_H:
                y = [max(0.0, v) for v in y_new]
                t += h
                if err > 0.0:
                    h *= min(_STEP_SCALE_MAX,
                             max(_STEP_SCALE_MIN, 0.9 * (tol / err) ** 0.2))
                else:
                    h *= _STEP_SCALE_MAX
            else:
                h *= max(_STEP_SCALE_MIN, 0.9 * (tol / err) ** 0.2)
        return t, y

    @staticmethod
    def _dp54_step(ode_system, t, y, h):
        n = len(y)
        k = []
        for stage in range(7):
            a_row = _DP54_A[stage]
            yi = [
                y[i] + h * sum(
                    a * ks[i] for a, ks in zip(a_row, k)
                )
                for i in range(n)
            ]
            k.append(ode_system(t + _DP54_C[stage] * h, yi))
        y_new = list(y)
        err = 0.0
        for i in range(n):
            b5 = sum(b * ks[i] for b, ks in zip(_DP54_B5, k))
            b4 = sum(b * ks[i] for b, ks in zip(_DP54_B4, k))
            y_new[i] += h * b5
            err = max(err, abs(h * (b5 - b4)))
        return y_new, err

    def _step(self, ode_system, t, y):
        y = self._rk4(ode_system, t, y, self.dt)
        return [max(0.0, v) for v in y]

    @staticmethod
    def _rk4(f, t, y, dt):
        k1 = f(t, y)
        k2 = f(t + 0.5 * dt, [yi + 0.5 * dt * k1i for yi, k1i in zip(y, k1)])
        k3 = f(t + 0.5 * dt, [yi + 0.5 * dt * k2i for yi, k2i in zip(y, k2)])
        k4 = f(t + dt, [yi + dt * k3i for yi, k3i in zip(y, k3)])
        return [
            yi + (dt / 6.0) * (k1i + 2.0 * k2i + 2.0 * k3i + k4i)
            for yi, k1i, k2i, k3i, k4i in zip(y, k1, k2, k3, k4)
        ]
