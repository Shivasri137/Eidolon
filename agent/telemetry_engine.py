"""
telemetry_engine.py
Instruments a Python source string using sys.settrace and streams
Spatial-Telemetry-Protocol (STP) packets via a callback.
"""

import sys
import asyncio
import time
import traceback
from dataclasses import dataclass, field, asdict
from typing import Callable, Any


# ── STP Packet types ─────────────────────────────────────────────────────────

@dataclass
class TracePacket:
    type: str = "trace"
    event: str = ""          # call | line | return | exception
    function: str = ""
    lineno: int = 0
    filename: str = ""
    locals: dict = field(default_factory=dict)
    frame_id: int = 0
    arg: str | None = None
    timestamp_ms: float = 0.0


@dataclass
class ExceptionPacket:
    type: str = "exception"
    exc_type: str = ""
    message: str = ""
    lineno: int = 0
    function: str = ""
    traceback_str: str = ""
    frame_id: int = 0


@dataclass
class RunEndPacket:
    type: str = "run_end"
    total_frames: int = 0
    duration_ms: float = 0.0


# ── Safety limits ─────────────────────────────────────────────────────────────

MAX_FRAMES      = 10_000    # hard cap to prevent runaway scripts
MAX_LOCAL_REPR  = 80        # chars per local variable repr
MAX_STR_ITER    = 200       # max loop iterations before warning flag


def _safe_locals(f_locals: dict) -> dict:
    """Produce a JSON-serialisable snapshot of frame locals."""
    result = {}
    for k, v in f_locals.items():
        if k.startswith("__"):
            continue
        try:
            r = repr(v)
            result[k] = r[:MAX_LOCAL_REPR] + ("…" if len(r) > MAX_LOCAL_REPR else "")
        except Exception:
            result[k] = "<repr-error>"
    return result


# ── Core tracer ───────────────────────────────────────────────────────────────

class TelemetryEngine:
    """
    Usage:
        engine = TelemetryEngine(on_packet=my_callback)
        engine.run(source_code)

    `on_packet` is called synchronously with a dict for every STP packet.
    Wrap it in asyncio.run_coroutine_threadsafe for async usage.
    """

    def __init__(self, on_packet: Callable[[dict], None]):
        self.on_packet = on_packet
        self._frame_counter = 0
        self._start_time: float = 0.0
        self.execution_log: list[dict] = []        # full history for scrubbing

    # ── Internal ──────────────────────────────────────────────────────────

    def _emit(self, packet_obj) -> None:
        d = asdict(packet_obj)
        self.execution_log.append(d)
        self.on_packet(d)

    def _make_tracer(self, target_filename: str):
        """Returns a sys.settrace-compatible trace function."""
        engine = self                              # closure ref

        def tracer(frame, event, arg):
            # Only trace the user's script, not our own infra
            if frame.f_code.co_filename != target_filename:
                return tracer

            engine._frame_counter += 1
            if engine._frame_counter > MAX_FRAMES:
                sys.settrace(None)
                return None

            arg_repr: str | None = None
            if arg is not None:
                try:
                    r = repr(arg)
                    arg_repr = r[:MAX_LOCAL_REPR]
                except Exception:
                    arg_repr = "<repr-error>"

            packet = TracePacket(
                event=event,
                function=frame.f_code.co_name,
                lineno=frame.f_lineno,
                filename=frame.f_code.co_filename,
                locals=_safe_locals(frame.f_locals),
                frame_id=engine._frame_counter,
                arg=arg_repr,
                timestamp_ms=(time.perf_counter() - engine._start_time) * 1000,
            )
            engine._emit(packet)
            return tracer

        return tracer

    # ── Public API ────────────────────────────────────────────────────────

    def run(self, source: str, filename: str = "<spatial_twin>") -> None:
        """
        Compile and exec *source* under sys.settrace.
        Blocks until the script finishes or raises.
        """
        self._frame_counter = 0
        self.execution_log.clear()
        self._start_time = time.perf_counter()

        try:
            code = compile(source, filename, "exec")
        except SyntaxError as exc:
            self._emit(ExceptionPacket(
                exc_type="SyntaxError",
                message=str(exc),
                lineno=exc.lineno or 0,
                function="<compile>",
            ))
            return

        namespace: dict[str, Any] = {"__name__": "__spatial_twin__"}
        sys.settrace(self._make_tracer(filename))
        try:
            exec(code, namespace)
        except Exception as exc:
            tb = exc.__traceback__
            lineno = 0
            fn_name = "<unknown>"
            while tb is not None:
                if tb.tb_frame.f_code.co_filename == filename:
                    lineno  = tb.tb_lineno
                    fn_name = tb.tb_frame.f_code.co_name
                tb = tb.tb_next

            self._emit(ExceptionPacket(
                exc_type=type(exc).__name__,
                message=str(exc),
                lineno=lineno,
                function=fn_name,
                traceback_str=traceback.format_exc()[:400],
                frame_id=self._frame_counter,
            ))
        finally:
            sys.settrace(None)
            duration = (time.perf_counter() - self._start_time) * 1000
            self._emit(RunEndPacket(
                total_frames=self._frame_counter,
                duration_ms=round(duration, 2),
            ))

    def get_frame(self, frame_id: int) -> dict | None:
        """Return a historical frame by ID (for time-scrubbing)."""
        if 0 <= frame_id < len(self.execution_log):
            return self.execution_log[frame_id]
        return None
