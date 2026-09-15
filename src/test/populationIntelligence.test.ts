import { describe, it, expect } from 'vitest';

const populationService = require('../../server/services/populationIntelligenceService');

describe('F49 — AI Population Intelligence Service Suite', () => {
  it('should retrieve high-level population epidemiology overview', async () => {
    const overview = await populationService.getOverview();

    expect(overview).toBeDefined();
    expect(overview.summary.monitoredPopulationTotal).toBeGreaterThan(5000000);
    expect(overview.summary.activeOutbreakAlerts).toBeGreaterThanOrEqual(1);
    expect(overview.summary.averageVaccinationCoveragePct.covidBooster).toBeGreaterThan(70);
    expect(overview.topHotspots.length).toBeGreaterThan(0);
    expect(overview.recentForecasts.length).toBeGreaterThan(0);
  });

  it('should predict disease outbreak trajectory using epidemiological SIR R0 modeling', async () => {
    // High transmission scenario (Beta = 0.45, Gamma = 0.15 => R0 = 3.0)
    const outbreakHigh = await populationService.predictOutbreak({
      diseaseName: 'Novel Avian Strain H5N1',
      regionCode: 'REG-NORTH',
      currentCases: 200,
      transmissionRateBeta: 0.45,
      recoveryRateGamma: 0.15
    });

    expect(outbreakHigh.reproductionNumberR0).toBe(3.0);
    expect(outbreakHigh.status).toBe('outbreak_alert');
    expect(outbreakHigh.forecastTrajectory).toBe('increasing');
    expect(outbreakHigh.predictedCasesNext30Days).toBeGreaterThan(200);
    expect(outbreakHigh.herdImmunityThresholdPct).toBe(67); // 1 - 1/3 = 66.7% => 67%
    expect(outbreakHigh.aiRecommendations.length).toBeGreaterThan(0);
    expect(outbreakHigh.projectionsOverTime.length).toBe(4);

    // Contained scenario (Beta = 0.08, Gamma = 0.16 => R0 = 0.5)
    const outbreakContained = await populationService.predictOutbreak({
      diseaseName: 'Seasonal Adenovirus',
      regionCode: 'REG-CENTRAL',
      currentCases: 100,
      transmissionRateBeta: 0.08,
      recoveryRateGamma: 0.16
    });

    expect(outbreakContained.reproductionNumberR0).toBe(0.5);
    expect(outbreakContained.status).toBe('contained');
    expect(outbreakContained.forecastTrajectory).toBe('decreasing');
    expect(outbreakContained.herdImmunityThresholdPct).toBe(0);
  });

  it('should retrieve geographic hotspots with coordinate boundaries and severity indexes', async () => {
    const hotspots = await populationService.getHotspots();

    expect(hotspots.length).toBeGreaterThanOrEqual(3);
    const top = hotspots[0];
    expect(top.hotspotId).toBeDefined();
    expect(top.coordinates.lat).toBeDefined();
    expect(top.coordinates.lng).toBeDefined();
    expect(top.severityIndex).toBeGreaterThan(0);
    expect(top.severityIndex).toBeLessThanOrEqual(100);
    expect(top.activeCases).toBeGreaterThan(0);
  });

  it('should get regional analytics and handle specific region query', async () => {
    const regions = await populationService.getRegionalAnalytics();
    expect(regions.length).toBeGreaterThanOrEqual(3);

    const north = await populationService.getRegionalAnalytics('REG-NORTH');
    expect(north.regionCode).toBe('REG-NORTH');
    expect(north.populationTotal).toBeGreaterThan(2000000);
    expect(north.chronicDiseasePrevalence.diabetesType2Pct).toBeDefined();
    expect(north.bedCapacityStrainRatio).toBeGreaterThan(0);
  });

  it('should provide comprehensive vaccination coverage statistics', async () => {
    const vax = await populationService.getVaccinationCoverage();

    expect(vax.regions.length).toBeGreaterThanOrEqual(3);
    expect(vax.targetNationalBenchmarkPct.covidBoosterPct).toBe(85.0);
    expect(vax.regions[0].coverage.childhoodMMRPct || vax.regions[0].coverage.mmrPct).toBeGreaterThan(90);
  });

  it('should return longitudinal chronic disease trends including AI forecasts', async () => {
    const trends = await populationService.getChronicDiseaseTrends();

    expect(trends.conditions.length).toBeGreaterThanOrEqual(3);
    const diabetes = trends.conditions.find((c: any) => c.name.includes('Diabetes'));
    expect(diabetes).toBeDefined();
    expect(diabetes.yearlyTrend.length).toBe(6);
    expect(diabetes.yearlyTrend.some((y: any) => y.isForecast)).toBe(true);
    expect(diabetes.primaryRiskFactors.length).toBeGreaterThan(0);
  });

  it('should return geospatial heatmap data points with intensity weights', async () => {
    const heatmap = await populationService.getHeatmapData();

    expect(heatmap.length).toBeGreaterThanOrEqual(4);
    expect(heatmap[0].lat).toBeDefined();
    expect(heatmap[0].lng).toBeDefined();
    expect(heatmap[0].weight).toBeGreaterThan(0);
    expect(heatmap[0].weight).toBeLessThanOrEqual(1.0);
  });
});
