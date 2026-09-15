const activeOutbreaksSeed = [
  {
    diseaseName: 'Dengue Serotype 2',
    regionCode: 'REG-NORTH',
    regionName: 'Northern Metro District',
    reproductionNumberR0: 2.15,
    confidenceScore: 0.91,
    status: 'outbreak_alert',
    incidentRatePer100k: 84.3,
    predictedCasesNext30Days: 1420,
    forecastTrajectory: 'increasing',
    aiRecommendations: [
      'Vector control fogging within 5km radius of detected larval sites',
      'Stockpile platelet concentrates and IV fluids at Regional Hospital North',
      'Issue community advisory regarding morning and dusk repellent usage'
    ],
    generatedAt: new Date().toISOString()
  },
  {
    diseaseName: 'Influenza A (H3N2)',
    regionCode: 'REG-EAST',
    regionName: 'Eastern Coastal Valley',
    reproductionNumberR0: 1.42,
    confidenceScore: 0.88,
    status: 'warning',
    incidentRatePer100k: 52.8,
    predictedCasesNext30Days: 860,
    forecastTrajectory: 'plateau',
    aiRecommendations: [
      'Expedite seasonal influenza vaccination camps for seniors >65',
      'Reinforce mask protocols in outpatient clinics and public transit'
    ],
    generatedAt: new Date().toISOString()
  },
  {
    diseaseName: 'Norovirus GII',
    regionCode: 'REG-CENTRAL',
    regionName: 'Central Urban Core',
    reproductionNumberR0: 1.10,
    confidenceScore: 0.84,
    status: 'surveillance',
    incidentRatePer100k: 23.4,
    predictedCasesNext30Days: 290,
    forecastTrajectory: 'decreasing',
    aiRecommendations: [
      'Conduct municipal water supply chlorination audits',
      'School hygiene inspection protocols activated'
    ],
    generatedAt: new Date().toISOString()
  }
];

const geographicHotspots = [
  {
    hotspotId: 'HOTSPOT-001',
    regionName: 'Northern Metro Sector 4',
    coordinates: { lat: 28.6517, lng: 77.2219 },
    radiusKm: 8.5,
    severityIndex: 88,
    primaryPathogen: 'Dengue Serotype 2',
    activeCases: 432,
    vulnerablePopulationCount: 18400,
    containmentStatus: 'advisory_issued'
  },
  {
    hotspotId: 'HOTSPOT-002',
    regionName: 'Eastern Port Terminal District',
    coordinates: { lat: 28.5921, lng: 77.3054 },
    radiusKm: 12.0,
    severityIndex: 67,
    primaryPathogen: 'Influenza A (H3N2)',
    activeCases: 290,
    vulnerablePopulationCount: 31000,
    containmentStatus: 'monitoring'
  },
  {
    hotspotId: 'HOTSPOT-003',
    regionName: 'South Industrial Corridor',
    coordinates: { lat: 28.5244, lng: 77.2066 },
    radiusKm: 6.2,
    severityIndex: 45,
    primaryPathogen: 'Respiratory Syncytial Virus (RSV)',
    activeCases: 115,
    vulnerablePopulationCount: 9200,
    containmentStatus: 'monitoring'
  }
];

const regionalData = [
  {
    regionCode: 'REG-NORTH',
    regionName: 'Northern Metro District',
    populationTotal: 2450000,
    vaccinationCoverage: {
      covidBoosterPct: 82.4,
      influenzaPct: 67.1,
      mmrPct: 96.0,
      hpvPct: 74.8
    },
    chronicDiseasePrevalence: {
      diabetesType2Pct: 15.3,
      hypertensionPct: 31.2,
      copdPct: 9.1,
      ckdPct: 6.8
    },
    bedCapacityStrainRatio: 0.74
  },
  {
    regionCode: 'REG-EAST',
    regionName: 'Eastern Coastal Valley',
    populationTotal: 1890000,
    vaccinationCoverage: {
      covidBoosterPct: 76.8,
      influenzaPct: 59.4,
      mmrPct: 93.5,
      hpvPct: 68.2
    },
    chronicDiseasePrevalence: {
      diabetesType2Pct: 13.9,
      hypertensionPct: 27.5,
      copdPct: 7.8,
      ckdPct: 5.4
    },
    bedCapacityStrainRatio: 0.61
  },
  {
    regionCode: 'REG-CENTRAL',
    regionName: 'Central Urban Core',
    populationTotal: 3120000,
    vaccinationCoverage: {
      covidBoosterPct: 85.1,
      influenzaPct: 71.3,
      mmrPct: 97.2,
      hpvPct: 80.5
    },
    chronicDiseasePrevalence: {
      diabetesType2Pct: 16.8,
      hypertensionPct: 33.4,
      copdPct: 8.9,
      ckdPct: 7.2
    },
    bedCapacityStrainRatio: 0.81
  }
];

class PopulationIntelligenceService {
  /**
   * High-Level Population Intelligence Overview
   */
  async getOverview() {
    const activeAlerts = activeOutbreaksSeed.filter(o => o.status === 'outbreak_alert').length;
    const warningAlerts = activeOutbreaksSeed.filter(o => o.status === 'warning').length;
    
    // Average vaccination coverage across regions
    const avgCovidBooster = Math.round(
      regionalData.reduce((acc, r) => acc + r.vaccinationCoverage.covidBoosterPct, 0) / regionalData.length
    );
    const avgFlu = Math.round(
      regionalData.reduce((acc, r) => acc + r.vaccinationCoverage.influenzaPct, 0) / regionalData.length
    );

    return {
      timestamp: new Date().toISOString(),
      summary: {
        monitoredPopulationTotal: regionalData.reduce((acc, r) => acc + r.populationTotal, 0),
        activeOutbreakAlerts: activeAlerts,
        advisoryWarnings: warningAlerts,
        identifiedHotspots: geographicHotspots.length,
        averageVaccinationCoveragePct: {
          covidBooster: avgCovidBooster,
          seasonalFlu: avgFlu,
          childhoodMMR: 95.6
        },
        primaryEpidemicThreat: activeOutbreaksSeed[0].diseaseName,
        epidemicRiskIndex: 72 // 0-100 scale
      },
      topHotspots: geographicHotspots.slice(0, 3),
      recentForecasts: activeOutbreaksSeed
    };
  }

  /**
   * Outbreaks List
   */
  async getOutbreaks() {
    return activeOutbreaksSeed;
  }

  /**
   * AI Outbreak Forecasting Engine (SIR approximation & R0 modeling)
   */
  async predictOutbreak({ diseaseName, regionCode, currentCases, transmissionRateBeta, recoveryRateGamma }) {
    if (!diseaseName || !regionCode) {
      throw new Error('Missing diseaseName or regionCode');
    }

    const beta = Number(transmissionRateBeta) || 0.35;
    const gamma = Number(recoveryRateGamma) || 0.18;
    const R0 = Number((beta / gamma).toFixed(2));

    const cases = Number(currentCases) || 150;
    const herdImmunityThresholdPct = R0 > 1 ? Math.round((1 - (1 / R0)) * 100) : 0;

    let trajectory = 'plateau';
    let alertStatus = 'surveillance';
    if (R0 > 1.8) {
      trajectory = 'increasing';
      alertStatus = 'outbreak_alert';
    } else if (R0 > 1.2) {
      trajectory = 'increasing';
      alertStatus = 'warning';
    } else if (R0 < 0.9) {
      trajectory = 'decreasing';
      alertStatus = 'contained';
    }

    // 30-day forecast projection
    const projectedCases = Math.round(cases * Math.pow(Math.max(0.5, R0), 1.6));
    const incidentRatePer100k = Number(((projectedCases / 500000) * 100000).toFixed(1));

    const recommendations = [];
    if (R0 > 1.5) {
      recommendations.push(`Urgent public health notification: R0 of ${R0} exceeds regional epidemic threshold.`);
      recommendations.push('Mobilize secondary isolation wards and reinforce personal protective equipment stocks.');
      recommendations.push('Initiate rapid ring vaccination or prophylactic treatment in affected postal zones.');
    } else {
      recommendations.push(`Standard monitoring: R0 is currently stabilized at ${R0}.`);
      recommendations.push('Continue wastewater genomic surveillance and sentinel clinic sampling.');
    }

    const forecast = {
      diseaseName,
      regionCode,
      reproductionNumberR0: R0,
      confidenceScore: 0.89,
      status: alertStatus,
      incidentRatePer100k,
      predictedCasesNext30Days: projectedCases,
      herdImmunityThresholdPct,
      forecastTrajectory: trajectory,
      aiRecommendations: recommendations,
      projectionsOverTime: [
        { day: 7, projectedActiveCases: Math.round(cases * Math.pow(R0, 0.4)) },
        { day: 14, projectedActiveCases: Math.round(cases * Math.pow(R0, 0.8)) },
        { day: 21, projectedActiveCases: Math.round(cases * Math.pow(R0, 1.2)) },
        { day: 30, projectedActiveCases: projectedCases }
      ],
      generatedAt: new Date().toISOString()
    };

    return forecast;
  }

  /**
   * Geographic Hotspots
   */
  async getHotspots() {
    return geographicHotspots;
  }

  /**
   * Regional Demographics & Health Strains
   */
  async getRegionalAnalytics(regionCode) {
    if (regionCode) {
      const region = regionalData.find(r => r.regionCode.toUpperCase() === regionCode.toUpperCase());
      if (!region) throw new Error(`Region ${regionCode} not found`);
      return region;
    }
    return regionalData;
  }

  /**
   * Vaccination Coverage
   */
  async getVaccinationCoverage() {
    return {
      regions: regionalData.map(r => ({
        regionCode: r.regionCode,
        regionName: r.regionName,
        population: r.populationTotal,
        coverage: r.vaccinationCoverage
      })),
      targetNationalBenchmarkPct: {
        covidBoosterPct: 85.0,
        influenzaPct: 75.0,
        mmrPct: 95.0,
        hpvPct: 80.0
      }
    };
  }

  /**
   * Chronic Disease Longitudinal Trends (5 years history + 2-year forecast)
   */
  async getChronicDiseaseTrends() {
    return {
      conditions: [
        {
          name: 'Type 2 Diabetes Mellitus',
          nationalPrevalencePct: 15.3,
          yearlyTrend: [
            { year: 2022, rate: 13.8 },
            { year: 2023, rate: 14.3 },
            { year: 2024, rate: 14.8 },
            { year: 2025, rate: 15.3 },
            { year: 2026, rate: 15.9, isForecast: true },
            { year: 2027, rate: 16.4, isForecast: true }
          ],
          primaryRiskFactors: ['Sedentary lifestyle', 'Ultra-processed food intake', 'Genetic predisposition']
        },
        {
          name: 'Hypertension',
          nationalPrevalencePct: 30.7,
          yearlyTrend: [
            { year: 2022, rate: 28.5 },
            { year: 2023, rate: 29.2 },
            { year: 2024, rate: 30.0 },
            { year: 2025, rate: 30.7 },
            { year: 2026, rate: 31.4, isForecast: true },
            { year: 2027, rate: 32.1, isForecast: true }
          ],
          primaryRiskFactors: ['High dietary sodium', 'Chronic workplace stress', 'Tobacco use']
        },
        {
          name: 'Chronic Kidney Disease (CKD)',
          nationalPrevalencePct: 6.5,
          yearlyTrend: [
            { year: 2022, rate: 5.8 },
            { year: 2023, rate: 6.0 },
            { year: 2024, rate: 6.2 },
            { year: 2025, rate: 6.5 },
            { year: 2026, rate: 6.8, isForecast: true },
            { year: 2027, rate: 7.1, isForecast: true }
          ],
          primaryRiskFactors: ['Uncontrolled diabetes', 'Refractory hypertension', 'NSAID overuse']
        }
      ]
    };
  }

  /**
   * Heatmap Point Coordinates and Weights
   */
  async getHeatmapData() {
    return [
      { lat: 28.6517, lng: 77.2219, weight: 0.95, label: 'Dengue Outbreak Epicenter' },
      { lat: 28.6420, lng: 77.2150, weight: 0.82, label: 'Secondary Dengue Cluster' },
      { lat: 28.5921, lng: 77.3054, weight: 0.68, label: 'Influenza Concentration' },
      { lat: 28.5244, lng: 77.2066, weight: 0.45, label: 'RSV Pediatric Cluster' },
      { lat: 28.6139, lng: 77.2090, weight: 0.35, label: 'Central Hospital Monitoring Base' }
    ];
  }
}

module.exports = new PopulationIntelligenceService();
