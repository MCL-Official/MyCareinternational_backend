const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const Booking = require('../../models/bookingSchema');
const axios = require('axios');

// Utility function to decrypt data
const decryptData = (encryptedData) => {
    const secretKey = 'your-secret-key'; // Must match the frontend key
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Utility function to mask sensitive data
const maskSensitiveData = (data) => {
    return {
        ...data,
        phone: data.phone ? data.phone.replace(/.(?=.{4})/g, '*') : '', // Mask phone except last 4 digits
        email: data.email ? data.email.replace(/(?<=.).(?=.*@)/g, '*') : '' // Mask email except first and domain parts
    };
};

// GET route to fetch bookings based on refId and filter by date
router.get("/:id", async (req, res) => {
    try {
        const refId = parseInt(req.params.id);
        const today = new Date();

        const timedetails = await Booking.find({
            refId: refId,
            date: { $gte: today } // Filter bookings where the date is greater than or equal to today's date
        });

        res.json({
            success: true,
            timedetails: timedetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error: error.message
        });
    }
});

// POST route to create a new booking
router.post("/", async (req, res) => {
    try {
        const encryptedData = req.body.data;
        const bookingsdata = decryptData(encryptedData);

        const newBooking = new Booking({
            refId: bookingsdata.refId,
            firstName: bookingsdata.firstName,
            lastName: bookingsdata.lastName,
            email: bookingsdata.email || "",
            phone: bookingsdata.phone,
            Age: bookingsdata.Age || 0,
            Gender: bookingsdata.Gender || "",
            Lab: bookingsdata.Lab || "",
            foundVia: bookingsdata.foundVia || "",
            date: bookingsdata.date,
            time: bookingsdata.time
        });

        await newBooking.save();

        const maskedBooking = maskSensitiveData(bookingsdata);

        res.json({
            success: true,
            booking: maskedBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating booking",
            error: error.message
        });
    }
});

// Proxy API to forward data to another API
router.post('/api/proxy', async (req, res) => {
    try {
        const response = await axios.post(
            'https://us.crelio.solutions/LHRegisterBillAPI/1e4d8ba0-3df9-11ee-8877-c143107133f9/',
            req.body,
            { headers: { 'Content-Type': 'application/json' } }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            message: 'Error',
            error: error.message
        });
    }
});

module.exports = router;























// // Create a new appointment
// router.post('/', async (req, res) => {
//   try {
//     const appointment = new Appointment(req.body);
//     await appointment.save();
//     res.status(201).json(appointment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Get all appointments
// router.get('/', async (req, res) => {
//   try {
//     const appointments = await Appointment.find();
//     res.status(200).json(appointments);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Get an appointment by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const appointment = await Appointment.findById(req.params.id);
//     if (!appointment) {
//       return res.status(404).json({ error: 'Appointment not found' });
//     }
//     res.status(200).json(appointment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Update an appointment by ID
// router.put('/:id', async (req, res) => {
//   try {
//     const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!appointment) {
//       return res.status(404).json({ error: 'Appointment not found' });
//     }
//     res.status(200).json(appointment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Delete an appointment by ID
// router.delete('/:id', async (req, res) => {
//   try {
//     const appointment = await Appointment.findByIdAndDelete(req.params.id);
//     if (!appointment) {
//       return res.status(404).json({ error: 'Appointment not found' });
//     }
//     res.status(200).json({ message: 'Appointment deleted successfully' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// module.exports = router;
