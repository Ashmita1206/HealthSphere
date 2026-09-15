const mongoose = require('mongoose');

const GeographicHotspotSchema = new mongoose.Schema({
  hotspotId: { type: String, required: true },
  regionName: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radiusKm: { type: Number, default: 15 },
  severityIndex: { type: Number, min: 0, max: 100, required: true },
  primaryPathogen: { type: String, required: true },
  activeCases: { type: Number, required: true },
  vulnerablePopulationCount: { type: Number, default: 10000 },
  containmentStatus: { type: String, enum: ['monitoring', 'advisory_issued', 'quarantine_zone', 'controlled'], default: 'monitoring' }
}, { _id: false });

const RegionalMetricSchema = new mongoose.Schema({
  regionCode: { type: String, required: true, unique: true },
  regionName: { type: String, required: true },
  populationTotal: { type: Number, required: true },
  vaccinationCoverage: {
    covidBoosterPct: { type: Number, default: 78.5 },
    influenzaPct: { type: Number, default: 62.0 },
    mmrPct: { type: Number, default: 94.2 },
    hpvPct: { type: Number, default: 71.0 }
  },
  chronicDiseasePrevalence: {
    diabetesType2Pct: { type: Number, default: 14.2 },
    hypertensionPct: { type: Number, default: 28.6 },
    copdPct: { type: Number, default: 8.4 },
    ckdPct: { type: Number, default: 6.1 }
  },
  bedCapacityStrainRatio: { type: Number, default: 0.68 }
}, { _id: false });

const OutbreakForecastSchema = new mongoose.Schema({
  diseaseName: { type: String, required: true },
  regionCode: { type: String, required: true },
  reproductionNumberR0: { type: Number, required: true },
  confidenceScore: { type: Number, min: 0, max: 1, default: 0.85 },
  status: { type: String, enum: ['surveillance', 'warning', 'outbreak_alert', 'contained'], default: 'surveillance' },
  incidentRatePer100k: { type: Number, required: true },
  predictedCasesNext30Days: { type: Number, required: true },
  forecastTrajectory: { type: String, enum: ['increasing', 'plateau', 'decreasing'], default: 'plateau' },
  aiRecommendations: [{ type: String }],
  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  autoIndex: false,
  bufferCommands: false
});

module.exports = {
  OutbreakForecast: mongoose.model('OutbreakForecast', OutbreakForecastSchema)
};
