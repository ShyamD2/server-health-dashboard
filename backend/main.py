"""
Server Health Dashboard — backend
FastAPI + psutil, streaming live host metrics over WebSocket.
"""
import asyncio
import time
import platform
from datetime import datetime, timezone

import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Server Health Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only — lock this down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BOOT_TIME = psutil.boot_time()
# Prime cpu_percent's internal sample window so the first real reading isn't 0.0
psutil.cpu_percent(interval=None)
psutil.cpu_percent(interval=None, percpu=True)


def get_static_info() -> dict:
    uname = platform.uname()
    try:
        load1, load5, load15 = psutil.getloadavg()
    except (OSError, AttributeError):
        load1 = load5 = load15 = None
    return {
        "hostname": uname.node,
        "os": f"{uname.system} {uname.release}",
        "arch": uname.machine,
        "cpuModel": platform.processor() or uname.processor or "Unknown",
        "cpuCores": psutil.cpu_count(logical=False) or 0,
        "cpuThreads": psutil.cpu_count(logical=True) or 0,
        "bootTime": datetime.fromtimestamp(BOOT_TIME, tz=timezone.utc).isoformat(),
        "loadAvg": {"1m": load1, "5m": load5, "15m": load15},
    }


def get_live_metrics() -> dict:
    now = time.time()
    cpu_total = psutil.cpu_percent(interval=None)
    cpu_per_core = psutil.cpu_percent(interval=None, percpu=True)

    vm = psutil.virtual_memory()
    swap = psutil.swap_memory()

    disks = []
    for part in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(part.mountpoint)
        except (PermissionError, OSError):
            continue
        disks.append({
            "device": part.device,
            "mountpoint": part.mountpoint,
            "fstype": part.fstype,
            "total": usage.total,
            "used": usage.used,
            "percent": usage.percent,
        })

    net = psutil.net_io_counters()

    try:
        temps_raw = psutil.sensors_temperatures()
        temps = [
            {"label": f"{name} {e.label or i}", "current": e.current}
            for name, entries in temps_raw.items()
            for i, e in enumerate(entries)
        ]
    except (AttributeError, OSError):
        temps = []

    procs = []
    for p in sorted(
        psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]),
        key=lambda p: (p.info.get("cpu_percent") or 0),
        reverse=True,
    )[:6]:
        info = p.info
        procs.append({
            "pid": info["pid"],
            "name": info["name"],
            "cpu": round(info.get("cpu_percent") or 0, 1),
            "mem": round(info.get("memory_percent") or 0, 1),
        })

    return {
        "timestamp": now,
        "cpu": {"total": cpu_total, "perCore": cpu_per_core},
        "memory": {
            "total": vm.total, "used": vm.used, "available": vm.available,
            "percent": vm.percent,
        },
        "swap": {"total": swap.total, "used": swap.used, "percent": swap.percent},
        "disks": disks,
        "network": {
            "bytesSent": net.bytes_sent, "bytesRecv": net.bytes_recv,
            "packetsSent": net.packets_sent, "packetsRecv": net.packets_recv,
        },
        "temps": temps,
        "uptimeSeconds": now - BOOT_TIME,
        "processes": procs,
    }


@app.get("/api/system-info")
def system_info():
    return get_static_info()


@app.get("/api/metrics")
def metrics_snapshot():
    return get_live_metrics()


@app.websocket("/ws/metrics")
async def ws_metrics(websocket: WebSocket, interval: float = 1.5):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(get_live_metrics())
            await asyncio.sleep(max(interval, 0.5))
    except WebSocketDisconnect:
        pass
    except Exception:
        # Client likely dropped mid-send; end the loop quietly.
        pass


@app.get("/api/health")
def health():
    return {"status": "ok"}
