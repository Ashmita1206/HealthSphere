/**
 * HealthSphere Performance Metrics Service
 * Request telemetry, latency percentiles, and memory/CPU diagnostics
 */

class MetricsService {
  constructor() {
    this.startTime = Date.now();
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.clientErrors = 0; // 4xx
    this.serverErrors = 0; // 5xx
    this.latencies = []; // Rolling buffer of last 1000 response times in ms
    this.maxLatencyBuffer = 1000;
  }

  recordRequest(statusCode, durationMs) {
    this.totalRequests += 1;

    if (statusCode >= 200 && statusCode < 400) {
      this.successfulRequests += 1;
    } else if (statusCode >= 400 && statusCode < 500) {
      this.clientErrors += 1;
    } else if (statusCode >= 500) {
      this.serverErrors += 1;
    }

    if (typeof durationMs === 'number' && !isNaN(durationMs)) {
      this.latencies.push(durationMs);
      if (this.latencies.length > this.maxLatencyBuffer) {
        this.latencies.shift();
      }
    }
  }

  getPercentile(p) {
    if (this.latencies.length === 0) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return Number(sorted[Math.max(0, index)].toFixed(2));
  }

  getAverageLatency() {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / this.latencies.length).toFixed(2));
  }

  getMetrics() {
    const memory = process.memoryUsage();
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      uptimeSeconds: uptimeSec,
      requests: {
        total: this.totalRequests,
        success: this.successfulRequests,
        clientErrors: this.clientErrors,
        serverErrors: this.serverErrors,
        errorRatePct: this.totalRequests > 0
          ? Number(((this.serverErrors / this.totalRequests) * 100).toFixed(2))
          : 0,
      },
      latencyMs: {
        avg: this.getAverageLatency(),
        p50: this.getPercentile(50),
        p95: this.getPercentile(95),
        p99: this.getPercentile(99),
      },
      memory: {
        rssMB: Number((memory.rss / (1024 * 1024)).toFixed(2)),
        heapUsedMB: Number((memory.heapUsed / (1024 * 1024)).toFixed(2)),
        heapTotalMB: Number((memory.heapTotal / (1024 * 1024)).toFixed(2)),
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  }

  reset() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.clientErrors = 0;
    this.serverErrors = 0;
    this.latencies = [];
  }
}

const metricsService = new MetricsService();

module.exports = metricsService;
