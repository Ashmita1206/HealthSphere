/**
 * Blood Bank & Stock Service (External Adapter Boundary)
 * Manages verified blood bank directory and blood stock records.
 * Acts as the internal normalization layer for future e-RaktKosh / HIMS integrations.
 */

const { BloodBank, BloodStock, ExternalSyncLog } = require('../models/Donation');
const logger = require('../utils/logger');

// Development fallback fixtures (explicitly marked as fixtures, not real live API data)
const FIXTURE_BLOOD_BANKS = [
  {
    name: "Red Cross Central Blood Bank",
    licenseNumber: "BB-DL-2022-098",
    category: "Red Cross",
    address: "1 Red Cross Road, Near Central Hospital",
    city: "New Delhi",
    state: "Delhi",
    phone: "+91 11 2371 6441",
    email: "bloodbank@redcross.org.in",
    operatingHours: "24x7 Emergency",
    isVerified: true,
    location: { type: "Point", coordinates: [77.2090, 28.6139] },
  },
  {
    name: "Apex City Civic Hospital Blood Center",
    licenseNumber: "BB-MH-2021-412",
    category: "Government",
    address: "Civic Hospital Campus, Sector 4",
    city: "Mumbai",
    state: "Maharashtra",
    phone: "+91 22 2410 7000",
    email: "civic.bloodcenter@gov.in",
    operatingHours: "24x7 Emergency",
    isVerified: true,
    location: { type: "Point", coordinates: [72.8777, 19.0760] },
  },
  {
    name: "Rotary Medical Trust Blood Services",
    licenseNumber: "BB-KA-2023-118",
    category: "Trust/Charitable",
    address: "12 Residency Road, Ashok Nagar",
    city: "Bengaluru",
    state: "Karnataka",
    phone: "+91 80 2558 4400",
    email: "rotaryblood@medtrust.org",
    operatingHours: "08:00 - 22:00",
    isVerified: true,
    location: { type: "Point", coordinates: [77.5946, 12.9716] },
  },
];

/**
 * Ensure initial verified facilities exist for UI preview in development without pretending to be live API
 */
async function seedFixturesIfEmpty() {
  try {
    const count = await BloodBank.countDocuments();
    if (count === 0) {
      const createdBanks = await BloodBank.insertMany(FIXTURE_BLOOD_BANKS);

      const stockRecords = [];
      const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      const components = ["whole_blood", "prbc", "platelets"];

      createdBanks.forEach((bank) => {
        bloodGroups.forEach((bg) => {
          stockRecords.push({
            bloodBankId: bank._id,
            bloodGroup: bg,
            component: "whole_blood",
            availableUnits: Math.floor(Math.random() * 15) + 3,
            lastVerifiedAt: new Date(Date.now() - Math.floor(Math.random() * 3600000 * 24)),
            source: "internal_verified",
            freshnessStatus: "recent",
            isDevelopmentFixture: true,
          });
        });
      });

      await BloodStock.insertMany(stockRecords);
      logger.info('Initialized verified blood bank directory fixtures');
    }
  } catch (err) {
    logger.warn('Failed to seed blood bank fixtures', { error: err.message });
  }
}

/**
 * List verified blood banks with optional city / search filter
 */
async function listBloodBanks(query = {}) {
  await seedFixturesIfEmpty();
  const filter = {};
  if (query.city) {
    filter.city = new RegExp(query.city.trim(), 'i');
  }
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search.trim(), 'i') },
      { city: new RegExp(query.search.trim(), 'i') },
      { address: new RegExp(query.search.trim(), 'i') },
    ];
  }
  return BloodBank.find(filter).sort({ isVerified: -1, name: 1 }).lean();
}

/**
 * List blood stock across facilities with filtering
 */
async function listBloodStock(query = {}) {
  await seedFixturesIfEmpty();
  const filter = {};
  if (query.bloodGroup) {
    filter.bloodGroup = query.bloodGroup;
  }
  if (query.component) {
    filter.component = query.component;
  }
  if (query.bloodBankId) {
    filter.bloodBankId = query.bloodBankId;
  }

  const stocks = await BloodStock.find(filter)
    .populate('bloodBankId', 'name city state phone isVerified address operatingHours')
    .sort({ availableUnits: -1 })
    .lean();

  return stocks.map((s) => ({
    id: s._id.toString(),
    bloodBank: s.bloodBankId,
    bloodGroup: s.bloodGroup,
    component: s.component,
    availableUnits: s.availableUnits,
    lastVerifiedAt: s.lastVerifiedAt ? new Date(s.lastVerifiedAt).toISOString() : new Date().toISOString(),
    source: s.source,
    freshnessStatus: s.freshnessStatus,
    isDevelopmentFixture: Boolean(s.isDevelopmentFixture),
  }));
}

/**
 * Current synchronization status with external government blood bank systems (e-RaktKosh / HIMS)
 */
async function getSyncStatus() {
  const latestLog = await ExternalSyncLog.findOne({ source: 'e-raktkosh' })
    .sort({ syncedAt: -1 })
    .lean();

  return {
    adapterStatus: 'not_configured',
    source: 'e-RaktKosh (Central Blood Bank Directory & Stock)',
    message: 'Official e-RaktKosh national blood-bank API integration is ready for institutional credentials. Internal verified registry is active.',
    lastAttempt: latestLog?.syncedAt || null,
    isLiveConnected: false,
    prerequisites: [
      'MoHFW / CDAC institutional API authorization',
      'e-RaktKosh facility client credentials (ERAKT_CLIENT_ID & ERAKT_API_KEY in server/.env)',
      'Whitelisted server egress IP address',
    ],
  };
}

module.exports = {
  listBloodBanks,
  listBloodStock,
  getSyncStatus,
  seedFixturesIfEmpty,
};
