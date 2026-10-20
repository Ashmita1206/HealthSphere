const EmergencyAlert = require("../models/EmergencyAlert");
const EmergencyNotification = require("../models/EmergencyNotification");
const EmergencyContact = require("../models/EmergencyContact");
const { recordTimelineEvent } = require("../services/timelineService");
const { dispatchEmergencySmsBatch } = require("../services/twilioMessagingService");
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
    const { latitude, longitude, contactIds } = req.body;
    const nearestHelp = getNearestHospital(latitude, longitude);

    // 1. Fetch authorized emergency contacts for this user
    let contactsQuery = { userId: req.user._id };
    if (Array.isArray(contactIds) && contactIds.length > 0) {
      contactsQuery._id = { $in: contactIds };
    }
    const contacts = await EmergencyContact.find(contactsQuery);

    // 2. Dispatch SMS notifications via Twilio Programmable Messaging (handles credentials check, E.164 formatting, non-PHI template)
    const callbackUrl = process.env.TWILIO_STATUS_CALLBACK_URL || undefined;
    const smsDispatch = await dispatchEmergencySmsBatch({
      contacts,
      userName: req.user.name || req.user.email,
      latitude,
      longitude,
      callbackUrl,
    });

    // 3. Upsert / update active EmergencyAlert
    const row = await EmergencyAlert.findOneAndUpdate(
      { userId: req.user._id, status: "active" },
      {
        latitude,
        longitude,
        status: "active",
        nearestHelp,
        contactAlerted: smsDispatch.queuedCount > 0,
        dispatchRecords: smsDispatch.records,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // 4. In-app Notification
    await EmergencyNotification.create({
      userId: req.user._id,
      alertId: row._id,
      type: "contact_alert",
      message: `Emergency triggered near ${nearestHelp}`
    });

    recordTimelineEvent({
      userId: req.user._id,
      eventType: "emergency",
      category: "emergency",
      title: "Emergency SOS Triggered",
      description: `Emergency alert initiated near ${nearestHelp}`,
      relatedId: row._id,
    }).catch(() => {});

    logger.warn("Emergency SOS triggered", {
      userId: String(req.user._id),
      latitude,
      longitude,
      nearestHelp,
      totalAttempted: smsDispatch.totalAttempted,
      queuedCount: smsDispatch.queuedCount,
      failedCount: smsDispatch.failedCount,
      isConfigured: smsDispatch.isConfigured,
    });

    let messageText = "Emergency alert recorded. In-app notifications created. Please also contact local emergency services directly (911/112) for confirmed dispatch.";
    if (smsDispatch.isConfigured) {
      if (smsDispatch.queuedCount > 0) {
        messageText = `Emergency alert recorded. SMS queued for ${smsDispatch.queuedCount} contact(s). Please also contact local emergency services directly (911/112).`;
      } else {
        messageText = `Emergency alert recorded, but SMS could not be sent to contacts. Please contact local emergency services directly (911/112).`;
      }
    }

    res.json({
      status: "triggered",
      incidentId: String(row._id),
      location: { latitude: row.latitude, longitude: row.longitude },
      nearestHelp,
      isTwilioConfigured: smsDispatch.isConfigured,
      dispatchRecords: smsDispatch.records,
      queuedCount: smsDispatch.queuedCount,
      failedCount: smsDispatch.failedCount,
      unconfiguredCount: smsDispatch.unconfiguredCount,
      totalAttempted: smsDispatch.totalAttempted,
      message: messageText,
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
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "HealthSphere-Medical-OS/1.0 (contact@healthsphere.org)",
      },
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
    const rawLat = req.query.lat;
    const rawLng = req.query.lng;
    if (rawLat === undefined || rawLng === undefined || Number.isNaN(Number(rawLat)) || Number.isNaN(Number(rawLng))) {
      return res.json({
        locations: [],
        error: null,
        message: "Provide lat and lng query parameters to discover live nearby facilities",
      });
    }

    const lat = Number(rawLat);
    const lng = Number(rawLng);
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
      return res.json({
        locations: [],
        error: lastError?.message || "Live geospatial provider temporarily unreachable",
      });
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

async function twilioStatusCallback(req, res, next) {
  try {
    const { MessageSid, SmsSid, MessageStatus, ErrorCode, ErrorMessage } = req.body || {};
    const sid = MessageSid || SmsSid;

    if (!sid) {
      return res.status(400).send("MessageSid is required");
    }

    logger.info("[Twilio Webhook] Received status callback", {
      sid,
      status: MessageStatus,
      errorCode: ErrorCode,
    });

    const updateFields = {
      "dispatchRecords.$.status": MessageStatus || "unknown",
      "dispatchRecords.$.updatedAt": new Date(),
    };
    if (ErrorCode) {
      updateFields["dispatchRecords.$.errorCode"] = String(ErrorCode);
    }
    if (ErrorMessage) {
      updateFields["dispatchRecords.$.errorMessage"] = ErrorMessage;
    }

    const updated = await EmergencyAlert.findOneAndUpdate(
      { "dispatchRecords.messageSid": sid },
      { $set: updateFields },
      { new: true }
    );

    if (updated) {
      logger.info("[Twilio Webhook] Updated alert dispatch record", {
        alertId: String(updated._id),
        sid,
        status: MessageStatus,
      });
    }

    res.status(200).send("<Response></Response>");
  } catch (error) {
    logger.error("[Twilio Webhook] Processing error", { error: error.message });
    res.status(200).send("<Response></Response>");
  }
}

async function getSosStatus(req, res, next) {
  try {
    const alertId = req.params.id;
    let query = { userId: req.user._id };
    if (alertId && alertId !== "latest") {
      query._id = alertId;
    } else {
      query.status = "active";
    }

    const alert = await EmergencyAlert.findOne(query).sort({ createdAt: -1 });
    if (!alert) {
      return res.status(404).json({ message: "No emergency alert found." });
    }

    res.json({
      alertId: String(alert._id),
      status: alert.status,
      contactAlerted: alert.contactAlerted,
      nearestHelp: alert.nearestHelp,
      dispatchRecords: alert.dispatchRecords || [],
      location: { latitude: alert.latitude, longitude: alert.longitude },
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    });
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
  twilioStatusCallback,
  getSosStatus,
};

