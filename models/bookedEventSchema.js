const mongoose = require('mongoose');

const bookedEventSchema = new mongoose.Schema({
        eventId :  {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        patientEmail : String,
        timestamp: {
            type: Date,
            default: Date.now
        }

});

module.exports = mongoose.model('BookedEvent',bookedEventSchema);