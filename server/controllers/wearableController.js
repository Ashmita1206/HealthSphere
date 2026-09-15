const wearableService = require('../services/wearableService');

/**
 * POST /api/wearables/connect
 * Register or pair a wearable device
 */
async function connectWearable(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const device = await wearableService.connectDevice(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Wearable device connected successfully',
      data: device,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/wearables/sync
 * Sync batch wearable telemetry readings with conflict resolution
 */
async function syncWearableReadings(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await wearableService.syncReadings(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Wearable readings synchronized successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/wearables/devices
 * List user's paired devices
 */
async function getWearableDevices(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const devices = await wearableService.getUserDevices(userId);

    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/wearables/readings
 * Retrieve telemetry time-series with filters
 */
async function getWearableReadings(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const readings = await wearableService.getUserReadings(userId, req.query);

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/wearables/devices/:deviceId
 * Unlink wearable device
 */
async function disconnectWearable(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { deviceId } = req.params;
    const result = await wearableService.disconnectDevice(userId, deviceId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  connectWearable,
  syncWearableReadings,
  getWearableDevices,
  getWearableReadings,
  disconnectWearable,
};
