const hospitalResourceService = require('../services/hospitalResourceService');

exports.getOverview = async (req, res) => {
  try {
    const overview = await hospitalResourceService.getOverview();
    return res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBeds = async (req, res) => {
  try {
    const beds = await hospitalResourceService.getBeds(req.query);
    return res.status(200).json({
      success: true,
      count: beds.length,
      data: beds
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.allocateBed = async (req, res) => {
  try {
    const result = await hospitalResourceService.allocateBed(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.dischargeBed = async (req, res) => {
  try {
    const result = await hospitalResourceService.dischargeBed(req.params.bedId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getIcuStatus = async (req, res) => {
  try {
    const icu = await hospitalResourceService.getIcuStatus();
    return res.status(200).json({
      success: true,
      data: icu
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOperatingTheaters = async (req, res) => {
  try {
    const ots = await hospitalResourceService.getOperatingTheaters();
    return res.status(200).json({
      success: true,
      count: ots.length,
      data: ots
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.scheduleSurgery = async (req, res) => {
  try {
    const scheduled = await hospitalResourceService.scheduleSurgery(req.body);
    return res.status(201).json({
      success: true,
      data: scheduled
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await hospitalResourceService.getStaff(req.query);
    return res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAmbulances = async (req, res) => {
  try {
    const ambulances = await hospitalResourceService.getAmbulances();
    return res.status(200).json({
      success: true,
      count: ambulances.length,
      data: ambulances
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.dispatchAmbulance = async (req, res) => {
  try {
    const result = await hospitalResourceService.dispatchAmbulance(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getQueues = async (req, res) => {
  try {
    const queues = await hospitalResourceService.getQueues();
    return res.status(200).json({
      success: true,
      data: queues
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEquipment = async (req, res) => {
  try {
    const equipment = await hospitalResourceService.getEquipment(req.query);
    return res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
