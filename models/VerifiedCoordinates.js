const mongoose = require('mongoose');

const verifiedCoordinatesSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number
});

const VerifiedCoordinates = mongoose.model('VerifiedCoordinates', verifiedCoordinatesSchema);
module.exports = VerifiedCoordinates;