const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

// TODO: Protect this route with role middleware to ensure only Volunteers can access it
// const { ensureVolunteer } = require('../middleware/auth');

// Rate limiting: max 20 requests per IP per minute
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests, please try again later.' }
});

router.post('/chatbot', chatbotLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Access Event model directly from mongoose if already registered
    const Event = mongoose.model('Event');
    
    // Fetch ALL current events from MongoDB
    const events = await Event.find({}).lean();
    
    // Map each event to a clean payload object
    const mappedEvents = events.map(e => ({
      id: e._id.toString(),
      title: e.title || "Unnamed",
      category: e.category || "General",
      date: e.date ? new Date(e.date).toISOString() : "",
      capacity: e.capacity || e.volunteerCap || 0,
      registered: e.registered || (e.participants ? e.participants.length : 0),
      description: e.description || "",
      tags: e.tags || []
    }));

    // POST to Flask Microservice
    const flaskRes = await axios.post('http://localhost:8000/chatbot', {
      message: message,
      events: mappedEvents
    });

    // Forward the Flask JSON response directly back to the client
    return res.status(200).json(flaskRes.data);
    
  } catch (error) {
    console.error('Chatbot API Error:', error.message);
    // If Flask is unreachable return 503
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: "Chatbot service unavailable. Please try again." });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
