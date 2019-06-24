const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const UserSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        trim: true
    },

    password:{
        type: String,
        required: true,
        trim: true
    },

    email:{
        type: String,
        required: true,
        trim: true
    },
    
    ReservedCar: {
        type: String
    }
});


UserSchema.plugin(timestamp);

const User = mongoose.model('Users', UserSchema);

module.exports = User;