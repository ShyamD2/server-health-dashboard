import type { ProcessInfo } from "../types";

export function ProcessTable({ processes }: { processes: ProcessInfo[] }) {
  if (processes.length === 0) {
    return <div className="empty-state">No process data available.</div>;
  }
  return (
    <table className="proc-table">
      <thead>
        <tr>
          <th>PID</th>
          <th>Process</th>
          <th>CPU</th>
          <th>Mem</th>
        </tr>
      </thead>
      <tbody>
        {processes.map((p) => (
          <tr key={p.pid}>
            <td className="proc-table__pid">{p.pid}</td>
            <td className="proc-table__name">{p.name}</td>
            <td className="proc-table__num">{p.cpu.toFixed(1)}%</td>
            <td className="proc-table__num">{p.mem.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
