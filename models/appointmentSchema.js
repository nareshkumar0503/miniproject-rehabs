const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    tokenNo:{type: String},
    time:{type:String},
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    centerEmail: { type: String, required: true },
    patientEmail: { type: String, required: true },
    date: { type: String },
    appointmentSession: { type: String, required: true },
    patientAddiction: { type: [String], required: true },
    status:{type:String}
},{
    timestamps : true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
