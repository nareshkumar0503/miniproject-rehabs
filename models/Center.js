const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
  centerName: { type: String, required: true },
  password:{type: String, required: true},
  address: { type: String, required: true },
  contactNo: { type: String, required: true },
  email: { type: String, required: true },
  websiteURL: { type: String },
  servicesOffered: { type: [String], required: true },
  programsAvailable: { type: [String], required: true },
  addictions: { type: [String], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  emergencyServices: { type: String, required: true },
  description: { type: String },
  priceRange: {type: [String], required: true},
  geolocation: {
    latitude: { type: String, required: true },
    longitude: { type: String, required: true }
  },
  centerImages: { type: [String] }
});

module.exports = mongoose.model('rehabcenters', centerSchema);
