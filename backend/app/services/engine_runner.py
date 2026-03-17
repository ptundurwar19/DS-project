"""
C++ Engine Runner Service
=========================
Manages the subprocess call to the compiled C++ benchmark engine.
Passes the binary workload file, captures JSON stdout, handles errors.
"""
import os
import json
import subprocess
import platform
from typing import Dict, Optional


# Path to the compiled C++ engine binary
def _get_engine_path() -> str:
    """Resolve path to the C++ engine binary."""
    base = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "engine")
    )

    if platform.system() == "Windows":
        # Check common build output locations
        candidates = [
            os.path.join(base, "build", "Release", "engine.exe"),
            os.path.join(base, "build", "Debug", "engine.exe"),
            os.path.join(base, "build", "engine.exe"),
            os.path.join(base, "engine.exe"),
        ]
    else:
        candidates = [
            os.path.join(base, "build", "engine"),
            os.path.join(base, "engine"),
        ]

    for path in candidates:
        if os.path.isfile(path):
            return path

    # Default — user may need to compile first
    if platform.system() == "Windows":
        return os.path.join(base, "build", "Release", "engine.exe")
    return os.path.join(base, "build", "engine")


ENGINE_PATH = _get_engine_path()

# Timeout for C++ engine execution (seconds)
ENGINE_TIMEOUT = 60


def run_engine(workload_filepath: str) -> Dict:
    """
    Execute the C++ benchmark engine on a binary workload file.

    Args:
        workload_filepath: Path to the .bin workload file.

    Returns:
        Parsed JSON dict with benchmark results from the engine.

    Raises:
        RuntimeError: If the engine fails, times out, or returns invalid JSON.
    """
    if not os.path.isfile(ENGINE_PATH):
        raise RuntimeError(
            f"C++ engine not found at {ENGINE_PATH}. "
            "Please compile the engine first: cd engine && mkdir build && cd build && cmake .. && cmake --build ."
        )

    if not os.path.isfile(workload_filepath):
        raise RuntimeError(f"Workload file not found: {workload_filepath}")

    try:
        result = subprocess.run(
            [ENGINE_PATH, workload_filepath],
            capture_output=True,
            text=True,
            timeout=ENGINE_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError(
            f"C++ engine timed out after {ENGINE_TIMEOUT}s. "
            "Dataset may be too large."
        )
    except FileNotFoundError:
        raise RuntimeError(
            f"C++ engine binary not found: {ENGINE_PATH}. "
            "Please compile the engine."
        )

    if result.returncode != 0:
        stderr_msg = result.stderr.strip() if result.stderr else "Unknown error"
        raise RuntimeError(f"C++ engine crashed (exit code {result.returncode}): {stderr_msg}")

    # Parse JSON from stdout
    stdout = result.stdout.strip()
    if not stdout:
        raise RuntimeError("C++ engine produced no output.")

    try:
        data = json.loads(stdout)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"C++ engine output is not valid JSON: {e}\nOutput: {stdout[:500]}")

    return data


def cleanup_workload(workload_filepath: str) -> None:
    """Remove the temporary workload file and its directory."""
    try:
        if os.path.isfile(workload_filepath):
            dir_path = os.path.dirname(workload_filepath)
            os.remove(workload_filepath)
            if os.path.isdir(dir_path) and not os.listdir(dir_path):
                os.rmdir(dir_path)
    except OSError:
        pass  # Non-critical cleanup
