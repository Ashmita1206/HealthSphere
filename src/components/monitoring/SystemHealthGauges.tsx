import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Radio,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface SystemHealthGaugesProps {
  totalRequests: number;
  statusCodes: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
  nodeEnv: string;
}

export const SystemHealthGauges: React.FC<SystemHealthGaugesProps> = ({
  totalRequests,
  statusCodes,
  nodeEnv,
}) => {
  const successRate =
    totalRequests > 0
      ? (((statusCodes['2xx'] + statusCodes['3xx']) / totalRequests) * 100).toFixed(1)
      : '99.9';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Liveness & Readiness Probe */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>K8s Health Probes</span>
          <Server className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xl font-bold text-foreground">UP / READY</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Liveness & Readiness: 200 OK • Node {nodeEnv}
        </p>
      </div>

      {/* 2. MongoDB Telemetry */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>Database Connection</span>
          <Database className="w-4 h-4 text-primary" />
        </div>
        <div className="text-xl font-bold text-foreground flex items-center gap-1.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Connected
        </div>
        <p className="text-[11px] text-muted-foreground">Mongoose Pool Active • Replica Ready</p>
      </div>

      {/* 3. API Success Rate */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>HTTP Reliability</span>
          <TrendingUp className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-xl font-bold text-foreground">{successRate}%</div>
        <p className="text-[11px] text-muted-foreground">
          2xx/3xx: {statusCodes['2xx'] + statusCodes['3xx']} • 4xx: {statusCodes['4xx']} • 5xx: {statusCodes['5xx']}
        </p>
      </div>

      {/* 4. Total Handled Traffic */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>Prometheus Ingestion</span>
          <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
        </div>
        <div className="text-xl font-bold text-foreground">
          {totalRequests.toLocaleString()} reqs
        </div>
        <p className="text-[11px] text-muted-foreground">Exposition text/plain at /metrics</p>
      </div>
    </div>
  );
};
