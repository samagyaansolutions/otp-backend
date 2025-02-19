require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP
app.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const verification = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
            .verifications.create({ to: phoneNumber, channel: 'sms' });

        res.json({ message: 'OTP sent!', sid: verification.sid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    try {
        const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks.create({ to: phoneNumber, code: otp });

        if (verificationCheck.status === 'approved') {
            res.json({ message: 'OTP Verified!' });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
