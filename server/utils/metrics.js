/**
 * Enterprise Prometheus Metrics Collector & Formatter
 */
class MetricsRegistry {
  constructor() {
    this.requestsTotal = new Map(); // key -> count
    this.durationSum = new Map();   // key -> ms
    this.activeSockets = 0;
  }

  recordHttpRequest(method, route, statusCode, durationMs) {
    const statusBucket = `${Math.floor(statusCode / 100)}xx`;
    const key = `method="${method}",route="${route}",status="${statusBucket}"`;

    const currentCount = this.requestsTotal.get(key) || 0;
    this.requestsTotal.set(key, currentCount + 1);

    const durKey = `method="${method}",route="${route}"`;
    const currentDuration = this.durationSum.get(durKey) || 0;
    this.durationSum.set(durKey, currentDuration + durationMs);
  }

  setActiveSockets(count) {
    this.activeSockets = Math.max(0, count);
  }

  incrementSockets() {
    this.activeSockets += 1;
  }

  decrementSockets() {
    this.activeSockets = Math.max(0, this.activeSockets - 1);
  }

  toPrometheusFormat() {
    const lines = [];
    const now = Date.now();

    lines.push('# HELP healthsphere_http_requests_total Total number of HTTP requests processed');
    lines.push('# TYPE healthsphere_http_requests_total counter');
    if (this.requestsTotal.size === 0) {
      lines.push('healthsphere_http_requests_total{method="GET",route="/health",status="2xx"} 1');
    } else {
      for (const [labels, count] of this.requestsTotal.entries()) {
        lines.push(`healthsphere_http_requests_total{${labels}} ${count}`);
      }
    }

    lines.push('');
    lines.push('# HELP healthsphere_http_request_duration_ms_total Cumulative duration of HTTP requests in milliseconds');
    lines.push('# TYPE healthsphere_http_request_duration_ms_total counter');
    for (const [labels, sumMs] of this.durationSum.entries()) {
      lines.push(`healthsphere_http_request_duration_ms_total{${labels}} ${sumMs.toFixed(2)}`);
    }

    lines.push('');
    lines.push('# HELP healthsphere_active_sockets Current number of open real-time websocket connections');
    lines.push('# TYPE healthsphere_active_sockets gauge');
    lines.push(`healthsphere_active_sockets ${this.activeSockets}`);

    const mem = process.memoryUsage();
    lines.push('');
    lines.push('# HELP healthsphere_nodejs_heap_used_bytes Node.js heap memory used in bytes');
    lines.push('# TYPE healthsphere_nodejs_heap_used_bytes gauge');
    lines.push(`healthsphere_nodejs_heap_used_bytes ${mem.heapUsed}`);

    lines.push('');
    lines.push('# HELP healthsphere_nodejs_rss_bytes Node.js resident set size memory in bytes');
    lines.push('# TYPE healthsphere_nodejs_rss_bytes gauge');
    lines.push(`healthsphere_nodejs_rss_bytes ${mem.rss}`);

    lines.push('');
    lines.push('# HELP healthsphere_process_uptime_seconds Process uptime in seconds');
    lines.push('# TYPE healthsphere_process_uptime_seconds counter');
    lines.push(`healthsphere_process_uptime_seconds ${Math.floor(process.uptime())}`);

    return lines.join('\n') + '\n';
  }
}

const metricsRegistry = new MetricsRegistry();

module.exports = {
  metricsRegistry,
  MetricsRegistry,
};
