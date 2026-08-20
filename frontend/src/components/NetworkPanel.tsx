import { formatBytes, formatRate } from "../lib/format";

interface NetworkPanelProps {
  bytesSent: number;
  bytesRecv: number;
  rateSent: number;
  rateRecv: number;
}

export function NetworkPanel({ bytesSent, bytesRecv, rateSent, rateRecv }: NetworkPanelProps) {
  return (
    <div className="net-panel">
      <div className="net-panel__row">
        <div className="net-panel__dir">
          <span className="net-panel__arrow net-panel__arrow--up">&uarr;</span>
          <span>Sent</span>
        </div>
        <span className="net-panel__rate">{formatRate(rateSent)}</span>
        <span className="net-panel__total">{formatBytes(bytesSent)} total</span>
      </div>
      <div className="net-panel__row">
        <div className="net-panel__dir">
          <span className="net-panel__arrow net-panel__arrow--down">&darr;</span>
          <span>Received</span>
        </div>
        <span className="net-panel__rate">{formatRate(rateRecv)}</span>
        <span className="net-panel__total">{formatBytes(bytesRecv)} total</span>
      </div>
    </div>
  );
}
