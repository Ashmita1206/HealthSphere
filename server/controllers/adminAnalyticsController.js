const adminAnalyticsService = require('../services/adminAnalyticsService');

/**
 * GET /api/admin/analytics
 * Enterprise hospital and clinical KPIs
 */
async function getAnalytics(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role || 'admin';

    const [kpis, emergencies, adherence, doctorProductivity] = await Promise.all([
      adminAnalyticsService.getHospitalKPIs(),
      adminAnalyticsService.getEmergencyAnalytics(),
      adminAnalyticsService.getMedicationAdherenceAnalytics(),
      adminAnalyticsService.getDoctorProductivity(),
    ]);

    await adminAnalyticsService.logAdminAction({
      userId,
      action: 'VIEW_HOSPITAL_ANALYTICS',
      resource: '/api/admin/analytics',
      role,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      data: {
        hospitalKPIs: kpis,
        emergencyAnalytics: emergencies,
        adherenceAnalytics: adherence,
        doctorProductivity,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/population
 * Demographic, disease distribution, and anonymous population statistics
 */
async function getPopulation(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role || 'admin';

    const [diseaseDistribution, anonymousStats] = await Promise.all([
      adminAnalyticsService.getDiseaseDistribution(),
      adminAnalyticsService.getAnonymousPopulationStats(),
    ]);

    await adminAnalyticsService.logAdminAction({
      userId,
      action: 'VIEW_POPULATION_DATA',
      resource: '/api/admin/population',
      role,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      data: {
        diseaseDistribution,
        anonymousPopulationStats: anonymousStats,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/risk-map
 * Population predictive risk heatmap
 */
async function getRiskMap(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role || 'admin';

    const riskMap = await adminAnalyticsService.getPredictiveRiskHeatmap();

    await adminAnalyticsService.logAdminAction({
      userId,
      action: 'VIEW_RISK_MAP',
      resource: '/api/admin/risk-map',
      role,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      data: riskMap,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/system-health
 * Infrastructure telemetry, database state, services health
 */
async function getSystemHealth(req, res, next) {
  try {
    const health = await adminAnalyticsService.getSystemHealth();

    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/charts
 * Time-series data for dashboard visualization
 */
async function getCharts(req, res, next) {
  try {
    const charts = await adminAnalyticsService.getChartsData();

    res.status(200).json({
      success: true,
      data: charts,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnalytics,
  getPopulation,
  getRiskMap,
  getSystemHealth,
  getCharts,
};
