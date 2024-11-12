const mongoose = require('mongoose');

const policeStationsSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    email: String,
    phone: String,
}); 

const PoliceStations = mongoose.model('PoliceStations', policeStationsSchema);

module.exports = PoliceStations;