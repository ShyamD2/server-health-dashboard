export interface SystemInfo {
  hostname: string;
  os: string;
  arch: string;
  cpuModel: string;
  cpuCores: number;
  cpuThreads: number;
  bootTime: string;
  loadAvg: { "1m": number | null; "5m": number | null; "15m": number | null };
}

export interface DiskInfo {
  device: string;
  mountpoint: string;
  fstype: string;
  total: number;
  used: number;
  percent: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
}

export interface TempReading {
  label: string;
  current: number;
}

export interface LiveMetrics {
  timestamp: number;
  cpu: { total: number; perCore: number[] };
  memory: { total: number; used: number; available: number; percent: number };
  swap: { total: number; used: number; percent: number };
  disks: DiskInfo[];
  network: {
    bytesSent: number;
    bytesRecv: number;
    packetsSent: number;
    packetsRecv: number;
  };
  temps: TempReading[];
  uptimeSeconds: number;
  processes: ProcessInfo[];
}

export type ConnectionState = "connecting" | "open" | "closed" | "error";
