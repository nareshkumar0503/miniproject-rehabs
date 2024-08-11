const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        // The password field should not be required for Google sign-in
        required: function() {
            return !this.googleId;
        }   
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    }
});

module.exports = mongoose.model('User', UserSchema);
