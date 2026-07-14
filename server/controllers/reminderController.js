const Reminder = require("../models/Reminder");

const mapReminder = (r) => ({
  id: r._id,
  title: r.medicineName,
  description: r.description || "",
  reminder_type: r.reminderType,
  time: r.time,
  frequency: r.frequency,
  is_active: r.isActive,
  created_at: r.createdAt
});

async function list(req, res, next) { try { res.json((await Reminder.find({ userId: req.user._id }).sort({ time: 1 })).map(mapReminder)); } catch (e) { next(e); } }
async function create(req, res, next) { try { const row = await Reminder.create({ userId: req.user._id, medicineName: req.body.title || req.body.medicineName, dosage: req.body.dosage, time: req.body.reminder_time || req.body.time, frequency: req.body.frequency, reminderType: req.body.reminder_type, description: req.body.description, isActive: true }); res.status(201).json(mapReminder(row)); } catch (e) { next(e); } }
async function update(req, res, next) { try { const row = await Reminder.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: req.body.is_active }, { new: true }); res.json(mapReminder(row)); } catch (e) { next(e); } }
async function remove(req, res, next) { try { await Reminder.deleteOne({ _id: req.params.id, userId: req.user._id }); res.status(204).end(); } catch (e) { next(e); } }

module.exports = { list, create, update, remove };
