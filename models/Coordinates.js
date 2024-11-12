const mongoose = require('mongoose');

const coordinatesSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number
});

const Coordinates = mongoose.model('Coordinates', coordinatesSchema);
module.exports = Coordinates;