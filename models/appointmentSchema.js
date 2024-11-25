const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    time:{type:String},
    patientName: { type: String, required: true },
    patientPhone: { type: String },
    attenderPhone:{type:String},
    patientAge:{type:String},
    centerEmail: { type: String, required: true },
    patientEmail: { type: String, required: true },
    appointmentDate: { type: String },
    appointmentSession: { type: String, required: true },
    centerName:{type:String, required:true},
    patientBloodGroup :{type:String},
    patientAddiction: { type: [String], required: true },
    status:{type:String},
    reschedule:{type: Number, default: 0 }
},{
    timestamps : true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
