const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: String,
    eventDesc:String,
    eventDate:String,
    eventTime:String,
    centerName:String,
    centerEmail:String
});

module.exports = mongoose.model('Event',eventSchema);