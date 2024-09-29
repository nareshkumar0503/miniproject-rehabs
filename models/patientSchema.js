const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientname: String,
    attendername: String,
    patientage: Number,
    bloodgroup: String,
    gender: String,
    height: Number,
    weight: Number,
    address: String,
    password:String,
    patientcontactnumber: String,
    attendercontactnumber: String,
    email: { type: String},
    addictionType: [String],
    addictionDuration: String,
    frequencyOfUse: String,
    previousTreatmentHistory: String
});

module.exports = mongoose.model('Patient', patientSchema);
