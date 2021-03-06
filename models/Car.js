const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const CarSchema = new mongoose.Schema({
    Maker: {
        type: String,
        required: true,
        trim: true
    },

    Model: {
        type: String,
        required: true,
        trim: true
    },

    FuelType: {
        type: String,
        required: true,
        trim: true
    },

    Volume: {
        type: Number,
        required: true,
    },

    Seats: {
        type: Number,
        required: true,
        default: 0
    },
    
    Transmision: {
        type: String,
        required: true,
        trim: true,
    },

    Color: {
        type: String,
        required: true,
        trim: true,
    },

    Reserved: {
        type: Boolean,
        default: false
    },

    ReservedUser: {
        type: String
    },

    selectedEndDate: {
        type: String
    },

    selectedStartDate: {
        type: String
    },

    Ncoordonate: {
        type: String
    },

    Ecoordonate: {
        type: String
    },
    
    Price: {
        type: Number,
        default: 0
    }
});

CarSchema.plugin(timestamp);

const Car = mongoose.model('Car', CarSchema);

module.exports = Car;