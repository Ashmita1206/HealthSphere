import React from 'react';
import { Activity, Clock, Zap } from 'lucide-react';

interface ApiEndpointMetric {
  route: string;
  requests: number;
  avgDurationMs: string;
  minMs: string;
  maxMs: string;
  errorRate: string;
}

interface ApiAnalyticsTableProps {
  endpoints: ApiEndpointMetric[];
}

export const ApiAnalyticsTable: React.FC<ApiAnalyticsTableProps> = ({ endpoints }) => {
  const getLatencyBadge = (avgMs: number) => {
    if (avgMs < 50) {
      return <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">Fast ({avgMs}ms)</span>;
    }
    if (avgMs < 200) {
      return <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold text-[10px]">Normal ({avgMs}ms)</span>;
    }
    return <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold text-[10px]">Slow ({avgMs}ms)</span>;
  };

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Live API Analytics & Latency Telemetry
          </h3>
          <p className="text-xs text-muted-foreground">
            Per-endpoint throughput, latency bounds, and error rate monitoring
          </p>
        </div>
      </div>

      {endpoints.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Awaiting incoming HTTP traffic to compute telemetry breakdown.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/30 text-muted-foreground">
                <th className="pb-2 font-semibold">Endpoint Route</th>
                <th className="pb-2 font-semibold">Requests</th>
                <th className="pb-2 font-semibold">Latency Profile</th>
                <th className="pb-2 font-semibold">Min / Max</th>
                <th className="pb-2 font-semibold text-right">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {endpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-muted/10">
                  <td className="py-2.5 font-mono text-[11px] text-foreground font-medium">
                    {ep.route}
                  </td>
                  <td className="py-2.5">{ep.requests.toLocaleString()}</td>
                  <td className="py-2.5">{getLatencyBadge(parseFloat(ep.avgDurationMs))}</td>
                  <td className="py-2.5 text-muted-foreground text-[11px]">
                    {ep.minMs}ms / {ep.maxMs}ms
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    <span className={parseFloat(ep.errorRate) > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {ep.errorRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
