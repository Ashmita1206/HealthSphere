const monitoringService = require('../services/monitoringService');

function getHealth(req, res) {
  const liveness = monitoringService.getLiveness();
  const readiness = monitoringService.getReadiness();

  return res.status(200).json({
    status: readiness.status === 'READY' ? 'HEALTHY' : 'DEGRADED',
    service: 'HealthSphere Enterprise Healthcare OS',
    version: '3.0.0-production',
    uptimeSeconds: liveness.uptimeSeconds,
    timestamp: new Date().toISOString(),
  });
}

function getLiveness(req, res) {
  const result = monitoringService.getLiveness();
  return res.status(200).json(result);
}

function getReadiness(req, res) {
  const result = monitoringService.getReadiness();
  const statusCode = result.status === 'READY' ? 200 : 503;
  return res.status(statusCode).json(result);
}

function getPrometheusMetrics(req, res) {
  const metrics = monitoringService.getPrometheusMetrics();
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  return res.status(200).send(metrics);
}

function getDiagnostics(req, res) {
  const diag = monitoringService.getDiagnostics();
  return res.status(200).json({
    success: true,
    ...diag,
  });
}

function getCrashLogs(req, res) {
  const diag = monitoringService.getDiagnostics();
  return res.status(200).json({
    success: true,
    crashes: diag.system.crashes,
  });
}

module.exports = {
  getHealth,
  getLiveness,
  getReadiness,
  getPrometheusMetrics,
  getDiagnostics,
  getCrashLogs,
};
