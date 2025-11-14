"""
E2E Tests control endpoints.
"""
import asyncio
import json
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4
from datetime import datetime
from fastapi import Path

from fastapi import APIRouter, HTTPException

router = APIRouter()

# In-memory job store (works for single-process dev usage)
JOBS: Dict[str, Dict[str, Any]] = {}


def _repo_root() -> Path:
    # __file__ -> backend/app/api/v1/tests.py
    # parents[0]=v1, [1]=api, [2]=app, [3]=backend, [4]=repo root
    return Path(__file__).resolve().parents[4]


import os

def _e2e_dir() -> Path:
    # Prefer explicit configuration
    env_path = os.getenv("E2E_TESTS_DIR")
    if env_path:
        p = Path(env_path).resolve()
        if p.exists():
            return p
    # Try repo root
    candidate = _repo_root() / "tests" / "e2e"
    if candidate.exists():
        return candidate
    # Try a few relative fallbacks from current working directory
    cwd = Path.cwd()
    for up in [cwd, cwd.parent, cwd.parent.parent, cwd.parent.parent.parent]:
        candidate = up / "tests" / "e2e"
        if candidate.exists():
            return candidate
    # Return non-existing path; caller will handle
    return _repo_root() / "tests" / "e2e"


import os as _os

async def _run_command(cmd: str, cwd: Path, env: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    proc = await asyncio.create_subprocess_shell(
        cmd,
        cwd=str(cwd),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        env={**_os.environ, **(env or {})},
    )
    stdout_b, stderr_b = await proc.communicate()
    return {
        "exit_code": proc.returncode,
        "stdout": stdout_b.decode(errors="ignore"),
        "stderr": stderr_b.decode(errors="ignore"),
    }


def _read_results_json(results_path: Path) -> Optional[Dict[str, Any]]:
    try:
        with results_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


async def _run_job(job_id: str):
    job = JOBS[job_id]
    job["status"] = "running"
    job["started_at"] = datetime.utcnow().isoformat()
    try:
        e2e_dir = _e2e_dir()
        results_dir = e2e_dir / "test-results"
        results_dir.mkdir(parents=True, exist_ok=True)
        results_json_path = results_dir / "results.json"
        if results_json_path.exists():
            try:
                results_json_path.unlink()
            except Exception:
                pass

        node_modules = e2e_dir / "node_modules"
        if not node_modules.exists():
            await _run_command("npm ci || npm install", cwd=e2e_dir)
            await _run_command("npx playwright install --with-deps || npx playwright install", cwd=e2e_dir)

        env = {
            "CI": "1",
            "API_BASE_URL": _os.getenv("API_BASE_URL", "http://backend:8000" if Path("/.dockerenv").exists() else "http://localhost:8000"),
        }
        run = await _run_command("npm test", cwd=e2e_dir, env=env)

        results_json = _read_results_json(results_json_path)
        job.update({
            "status": "succeeded" if run["exit_code"] == 0 else "failed",
            "exit_code": run["exit_code"],
            "stdout": run["stdout"],
            "stderr": run["stderr"],
            "results": results_json,
            "finished_at": datetime.utcnow().isoformat(),
        })
    except Exception as e:
        job.update({
            "status": "failed",
            "error": str(e),
            "finished_at": datetime.utcnow().isoformat(),
        })


@router.post("/e2e-tests/start")
async def start_e2e_tests():
    e2e_dir = _e2e_dir()
    in_container = Path("/.dockerenv").exists()
    if not e2e_dir.exists():
        detail = (
            "E2E tests directory not found. "
            + ("Detected container environment. " if in_container else "")
            + "Set E2E_TESTS_DIR or ensure tests/e2e is available to the backend process. "
              "In Docker, mount the tests/e2e directory and provide Node/Playwright."
        )
        raise HTTPException(status_code=501 if in_container else 500, detail=detail)

    job_id = uuid4().hex
    JOBS[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat(),
    }
    try:
        # Start running job concurrently
        asyncio.create_task(_run_job(job_id))
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = f"Failed to start job: {e}"
        raise HTTPException(status_code=500, detail=JOBS[job_id]["error"]) from e
    return {"job_id": job_id, "status": "queued"}


@router.get("/e2e-tests/status/{job_id}")
async def get_e2e_status(job_id: str = Path(...)):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/e2e-tests/run")
async def run_e2e_tests():
    """Run Playwright E2E tests and return JSON results.

    Expects Playwright to be installed and configured in tests/e2e.
    If running inside the backend Docker container, ensure tests are mounted
    and Node/Playwright are available or run tests externally.
    """
    e2e_dir = _e2e_dir()
    in_container = Path("/.dockerenv").exists()
    if not e2e_dir.exists():
        detail = (
            "E2E tests directory not found. "
            + ("Detected container environment. " if in_container else "")
            + "Set E2E_TESTS_DIR or ensure tests/e2e is available to the backend process. "
              "In Docker, mount the tests/e2e directory and provide Node/Playwright, or expose a host-side runner."
        )
        raise HTTPException(status_code=501 if in_container else 500, detail=detail)

    # Ensure test-results directory exists
    results_dir = e2e_dir / "test-results"
    results_dir.mkdir(parents=True, exist_ok=True)
    results_json_path = results_dir / "results.json"

    # Remove previous JSON to avoid stale reads
    try:
        if results_json_path.exists():
            results_json_path.unlink()
    except Exception:
        pass

    # Ensure dependencies are installed if missing
    node_modules = e2e_dir / "node_modules"
    if not node_modules.exists():
        await _run_command("npm ci || npm install", cwd=e2e_dir)
        # Ensure Playwright browsers are installed
        await _run_command("npx playwright install --with-deps || npx playwright install", cwd=e2e_dir)

    # Run tests in CI mode (disables webServer hook from config)
    env = {
        "CI": "1",
        # Point tests to backend inside docker network if available; fallback to localhost
        "API_BASE_URL": _os.getenv("API_BASE_URL", "http://backend:8000" if Path("/.dockerenv").exists() else "http://localhost:8000"),
    }
    run = await _run_command("npm test", cwd=e2e_dir, env=env)

    # Attempt to read results
    results_json = _read_results_json(results_json_path)

    return {
        "success": run["exit_code"] == 0,
        "exit_code": run["exit_code"],
        "stdout": run["stdout"],
        "stderr": run["stderr"],
        "results": results_json,
    }


@router.get("/e2e-tests/last")
async def get_last_e2e_results():
    """Return last E2E results if available."""
    e2e_dir = _e2e_dir()
    results_json_path = e2e_dir / "test-results" / "results.json"
    results_json = _read_results_json(results_json_path)
    if results_json is None:
        raise HTTPException(status_code=404, detail="No results found")
    return {"results": results_json}
