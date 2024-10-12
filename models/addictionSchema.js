const mongoose = require('mongoose')

const addictionSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',  // Reference to the Patient model
        required: true
    },
    addictionType: {
        type: String,
        required: true,  // e.g., 'smoking', 'alcohol', etc.
    },
    entries: [{
        date: {
            type: Date,
            required: true
        },
        value: {
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model('Addiction', addictionSchema);