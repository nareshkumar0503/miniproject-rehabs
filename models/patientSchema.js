const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    userId:String,
    username: String,
    password: String,
    name: String,
    age: Number,
    bloodGroup: String, // New field for blood group
    gender: String,
    height: Number, // New field
    weight: Number, // New field
    address: String,
    contactNumber: String,
    email: String,
    addictionType: String,
    addictionDuration: String,
    frequencyOfUse: String,
    previousTreatmentHistory: String,
    currentPhysicalHealth: String,
    currentMentalHealth: String
});

module.exports = mongoose.model('Patient', patientSchema);