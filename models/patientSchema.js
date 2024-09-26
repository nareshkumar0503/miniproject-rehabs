const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    userId: String,
    username: String,
    password: String,
    name: String,
    age: Number,
    bloodGroup: String,
    gender: String,
    height: Number,
    weight: Number,
    address: String,
    contactNumber: String,
    email: String,
    addictionType: String,
    addictionDuration: String,
    frequencyOfUse: String,
    previousTreatmentHistory: String,
    currentPhysicalHealth: String,
    currentMentalHealth: String,
    addictionQuestion1: String, // Store first unique question
    addictionQuestion2: String, // Store second unique question
    addictionQuestion3: String, // Store third unique question
    role: String // New field for role (Patient/Attender)
});

module.exports = mongoose.model('Patient', patientSchema);
