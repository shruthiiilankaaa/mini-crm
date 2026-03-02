
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {type:String, required:true},
  email: {type:String},
  phone: {type:String},
  company: {type:String},
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
