const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Joi = require('joi');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const {
  notifyLeadAdded,
  notifyLeadStatusChanged,
  notifyLeadDeleted,
  notifyCustomerCreated,
} = require('../services/reminderService');

const log = (customerId, userId, action, detail = '') =>
  Activity.create({ customerId, userId, action, detail }).catch(console.error);

// Stats — must be before /:id
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const result = { New: 0, Contacted: 0, Converted: 0, Lost: 0 };
    stats.forEach(s => { result[s._id] = s.count; });
    res.json(result);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Create customer
router.post('/', auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().allow(''),
    phone: Joi.string().allow(''),
    company: Joi.string().allow('')
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  try {
    const c = new Customer({ ...req.body, ownerId: req.user.id });
    await c.save();
    await log(c._id, req.user.id, 'Customer created', `${c.name} was added`);
    notifyCustomerCreated(req.user.id, c.name); // fire and forget
    res.json(c);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// List customers
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const q = req.query.q || '';
  const filter = q ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] } : {};
  try {
    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter).skip((page - 1) * limit).limit(limit);
    res.json({ customers, page, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get single customer + leads + activities
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ msg: 'Not found' });
    const leads = await Lead.find({ customerId: customer._id });
    const activities = await Activity.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ customer, leads, activities });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ msg: 'Not found' });
    await log(customer._id, req.user.id, 'Customer updated', `${customer.name}'s details were updated`);
    res.json(customer);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ msg: 'Not found' });
    await Lead.deleteMany({ customerId: customer._id });
    await Activity.deleteMany({ customerId: customer._id });
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Add lead
router.post('/:id/leads', auth, async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    status: Joi.string().valid('New', 'Contacted', 'Converted', 'Lost').default('New'),
    value: Joi.number().default(0),
    followUpDate: Joi.date().allow(null, ''),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });
  try {
    const lead = new Lead({ ...req.body, customerId: req.params.id });
    await lead.save();
    const customer = await Customer.findById(req.params.id);
    await log(req.params.id, req.user.id, 'Lead added', `New lead "${lead.title}" created with status ${lead.status}`);
    notifyLeadAdded(req.user.id, customer?.name, lead.title, lead.value, lead.status);
    res.json(lead);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Update lead
router.put('/:id/leads/:leadId', auth, async (req, res) => {
  try {
    const oldLead = await Lead.findById(req.params.leadId);
    const lead = await Lead.findByIdAndUpdate(req.params.leadId, req.body, { new: true });
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    const customer = await Customer.findById(req.params.id);
    if (oldLead.status !== lead.status) {
      await log(req.params.id, req.user.id, 'Lead status changed',
        `"${lead.title}" changed from ${oldLead.status} → ${lead.status}`);
      notifyLeadStatusChanged(req.user.id, customer?.name, lead.title, oldLead.status, lead.status);
    } else {
      await log(req.params.id, req.user.id, 'Lead updated', `"${lead.title}" was updated`);
    }
    res.json(lead);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Delete lead
router.delete('/:id/leads/:leadId', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.leadId);
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    const customer = await Customer.findById(req.params.id);
    await log(req.params.id, req.user.id, 'Lead deleted', `Lead "${lead.title}" was removed`);
    notifyLeadDeleted(req.user.id, customer?.name, lead.title);
    res.json({ msg: 'Lead deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;