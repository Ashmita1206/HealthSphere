const EmergencyAlert = require("../models/EmergencyAlert");
const EmergencyNotification = require("../models/EmergencyNotification");
const EmergencyContact = require("../models/EmergencyContact");
const logger = require("../utils/logger");

const hospitals = [
  "City General Hospital",
  "Mercy Medical Center",
  "Sunrise Emergency Clinic"
];

function getNearestHospital(latitude, longitude) {
  const index = Math.abs(Math.round((latitude + longitude) * 1000)) % hospitals.length;
  return hospitals[index];
}

async function triggerSos(req, res, next) {
  try {
    const nearestHelp = getNearestHospital(req.body.latitude, req.body.longitude);
    const row = await EmergencyAlert.findOneAndUpdate(
      { userId: req.user._id, status: "active" },
      {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        status: "active",
        nearestHelp,
        contactAlerted: true
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await EmergencyNotification.create({
      userId: req.user._id,
      alertId: row._id,
      type: "contact_alert",
      message: `Emergency triggered near ${nearestHelp}`
    });
    logger.warn("Emergency SOS triggered", {
      userId: String(req.user._id),
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      nearestHelp
    });
    res.json({
      status: "triggered",
      location: { latitude: row.latitude, longitude: row.longitude },
      nearestHelp,
      message: "Emergency services alerted"
    });
  } catch (error) {
    next(error);
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3; // meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchOverpassResponse(url, query) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: query,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Overpass request failed: ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function nearbyHospitals(req, res, next) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 5000);

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        relation["amenity"="hospital"](around:${radius},${lat},${lng});
      );
      out center tags;
    `;

    const endpoints = [
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.openstreetmap.fr/api/interpreter",
    ];

    let data = null;
    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        data = await fetchOverpassResponse(endpoint, query);
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!data || !data.elements) {
      throw new Error(lastError?.message || "Unable to fetch nearby hospitals");
    }

    const locations = data.elements
      .map((el) => {
        const latitude = el.lat ?? el.center?.lat;
        const longitude = el.lon ?? el.center?.lon;
        if (!latitude || !longitude) return null;
        return {
          id: String(el.id),
          name: el.tags?.name || "Unnamed Hospital",
          type: "hospital",
          address:
            el.tags?.["addr:full"] ||
            el.tags?.["addr:street"] ||
            el.tags?.address ||
            "",
          phone: el.tags?.phone || "",
          latitude,
          longitude,
          distance: getDistance(lat, lng, latitude, longitude),
        };
      })
      .filter(Boolean);

    res.json({ locations, error: null });
  } catch (error) {
    next(error);
  }
}

async function resolveSos(req, res, next) {
  try {
    await EmergencyAlert.updateMany({ userId: req.user._id, status: "active" }, { status: "resolved" });
    logger.info("Emergency SOS resolved", { userId: String(req.user._id) });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function listContacts(req, res, next) {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
}

async function createContact(req, res, next) {
  try {
    const { name, phone, relation } = req.body;
    const contact = await EmergencyContact.create({
      userId: req.user._id,
      name,
      phone,
      relation,
    });
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  try {
    const { name, phone, relation } = req.body;
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, phone, relation },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Emergency contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
}

async function deleteContact(req, res, next) {
  try {
    const deleted = await EmergencyContact.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Emergency contact not found" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  triggerSos,
  resolveSos,
  nearbyHospitals,
  listContacts,
  createContact,
  updateContact,
  deleteContact,
};
