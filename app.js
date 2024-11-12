const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');



// import models
const Coordinates = require('./models/Coordinates');
const PoliceStations = require('./models/PoliceStations');
const VerifiedCoordinates = require('./models/VerifiedCoordinates');


const app = express();

require("dotenv").config();
const port = 3000;

app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.use(express.static('public')); // Serve static files from 'public' folder
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('map');
});

app.get('/api/coordinates', async (req, res) => {
    try {
        const coordinates = await VerifiedCoordinates.find({});
        res.json(coordinates);
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
});


app.post("/addPoliceStation", async (req, res) => {
    const { latitude, longitude, email, phone } = req.body;
    const policeStation = new PoliceStations({
        latitude,
        longitude,
        email,
        phone
    });
    await policeStation.save();
    res.send('Police Station added successfully');
});

app.post('/coordinates', async (req, res) => {
    // console.log("hello");
    const { latitude, longitude } = req.body;
    const coordinates = new Coordinates({
        latitude,
        longitude
    });
    await coordinates.save();
    //now we calculate the nearest police station to the coordinates and send an email to the police station
    const policeStations = await PoliceStations.find({});
    let minDistance = Number.MAX_VALUE;
    let nearestPoliceStation = null;
    for (let i = 0; i < policeStations.length; i++) {
        const policeStation = policeStations[i];
        const distance = Math.sqrt(Math.pow(policeStation.latitude - latitude, 2) + Math.pow(policeStation.longitude - longitude, 2));
        if (distance < minDistance) {
            minDistance = distance;
            nearestPoliceStation = policeStation;
        }
    }
    //send email to the police station
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    // the mail should contain the coordinates of the incident and google map link to the coordinates, also there must be a button to verify the coordinates when the user clicks on the button the coordinates should be saved in the verified coordinates collection
    const mailOptions = {
      from: process.env.EMAIL,
      to: nearestPoliceStation.email,
      subject: "Incident Report",
      text: `Incident at coordinates: ${latitude}, ${longitude}`,
      html: `<p>Incident at coordinates: ${latitude}, ${longitude}</p><a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}">Google Maps</a><br/><br/><p>If Coordinates are valid Click here : </p><a href="https://${process.env.IP}/verify-coordinates?latitude=${latitude}&longitude=${longitude}">Verify</a>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
});

app.get('/verify-coordinates', async (req, res) => {
    const { latitude, longitude } = req.query;
    const verifiedCoordinates = new VerifiedCoordinates({
        latitude,
        longitude
    });
    await verifiedCoordinates.save();
    res.send('Coordinates verified successfully');
});



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

const dbConnect = require("./config/database");
dbConnect();