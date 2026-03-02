const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Lost'], default: 'New' },
  value: { type: Number, default: 0 },
  followUpDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);