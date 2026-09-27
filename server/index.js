const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // ⭐ NEW

const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://0.0.0.0:27017/galleryAchievementsDB';

// ----------------- Ensure uploads directory exists -----------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ----------------- MongoDB Connection -----------------
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ----------------- Middleware -----------------
app.use(cors());
app.use('/uploads', express.static(uploadDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------- Extra Routers -----------------
const chatbotRouter = require('./routes/chatbot');
app.use('/api', chatbotRouter);

const analyticsRouter = require('./routes/analytics');
app.use('/api', analyticsRouter);

// ----------------- Multer Setup -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ----------------- Schemas -----------------
const gallerySchema = new mongoose.Schema({
  type: { type: String, enum: ['photo', 'video'], required: true },
  url: String,
  caption: String,
  year: Number,
  eventType: String,
});

const achievementSchema = new mongoose.Schema({
  title: String,
  year: Number,
  issuer: String,
  certificate: String,
});

const initiativeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  short_description: String,
  impact_metrics: { people_helped: { type: Number, default: 0 } },
  photos: [String],
  tags: { type: [String], default: [] } // ⭐ Auto Tagging Output
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: "General" }, // ⭐ Auto Classification Output
  description: String,
  date: { type: Date, required: true },
  venue: String,
  organizers: String,
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  poster: String,
  photos: [String],
  volunteerCap: { type: Number, default: null },
  registered: { type: Number, default: 0 },
  capacity: { type: Number, default: 0 },
  low_capacity_alert_participants: { type: Boolean, default: false },
  low_capacity_alert_volunteers: { type: Boolean, default: false },
  full_alert_participants: { type: Boolean, default: false },
  full_alert_volunteers: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  actual_participants: { type: Number, default: null },
  duplicatesPrevented: { type: Number, default: 0 },
  participants: [
    {
      name: String,
      phone: String,
      email: String,
      age: Number,
      role: { type: String, enum: ['Volunteer', 'Participant'], default: 'Participant' },
      attended: { type: Boolean, default: false }
    }
  ],
  feedbacks: [
    {
      participantEmail: String,
      text: String,
      sentiment: String,
      created_at: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Initiative = mongoose.model('Initiative', initiativeSchema);
const Event = mongoose.model('Event', eventSchema);

const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  trackingId: { type: String, required: true, unique: true }
}, { timestamps: true });
const Complaint = mongoose.model('Complaint', complaintSchema);

const settingsSchema = new mongoose.Schema({
  password: { type: String, default: "admin123" },
  contactEmail: String,
  phone: String,
  logo: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  }
});
const Settings = mongoose.model('Settings', settingsSchema);

// ----------------- Events Routes -----------------

app.get('/api/events', async (req, res) => {
  try {
    const { search, category, tags, dateFrom, dateTo, availability } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    if (availability) {
      if (availability === 'available') {
        query.$expr = { $lt: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', Number.MAX_SAFE_INTEGER] }] };
      }
      else if (availability === 'filling') {
        query.$expr = {
          $and: [
            { $gte: [{ $divide: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', 1] }] }, 0.7] },
            { $lt: [{ $divide: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', 1] }] }, 1.0] }
          ]
        };
      }
      else if (availability === 'full') {
        query.$expr = { $gte: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', Number.MAX_SAFE_INTEGER] }] };
      }
    }

    const events = await Event.find(query).sort({ date: 1 }).lean();
    res.json(events);
  } catch (err) {
    console.error("GET API Error:", err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/meta', async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    const tags = await Event.distinct('tags');
    res.json({ categories, tags });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

app.post('/api/events', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {

  const { title, description, date, venue, organizers, status, volunteerCap, capacity } = req.body;

  if (!title || !date)
    return res.status(400).json({ error: 'Title and date required' });

  const poster = req.files?.poster
    ? `uploads/${req.files.poster[0].filename}`
    : '';

  const photoUrls = req.files?.photos
    ? req.files.photos.map(f => `uploads/${f.filename}`)
    : [];

  // ⭐ Auto-Tagging Interception via Python Flask Zero-Shot Model
  let mlCategory = "General";
  try {
    const mlRes = await axios.post("http://localhost:8000/classify-event", { title, description: description || "" });
    if (mlRes.data && mlRes.data.category) {
      mlCategory = mlRes.data.category;
    }
  } catch (err) {
    console.warn("ML Classification Failed via Axios. Dropping to default.");
  }

  const newEvent = new Event({
    title,
    category: mlCategory,
    description,
    date: new Date(date),
    venue,
    organizers,
    status: status || 'Open',
    poster,
    photos: photoUrls,
    volunteerCap: volunteerCap ? Number(volunteerCap) : null,
    capacity: capacity ? Number(capacity) : 0
  });

  await newEvent.save();

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log("PUT /api/events/:id - req.body:", req.body);
    const { title, description, date, venue, organizers, status, volunteerCap, capacity } = req.body;
    let updateData = { title, description, date: new Date(date), venue, organizers, status, volunteerCap: volunteerCap !== undefined && volunteerCap !== "" ? Number(volunteerCap) : null, capacity: capacity !== undefined && capacity !== "" ? Number(capacity) : 0 };
    console.log("updateData constructed:", updateData);
    
    if (req.files?.poster) updateData.poster = `uploads/${req.files.poster[0].filename}`;
    if (req.files?.photos) updateData.photos = req.files.photos.map(f => `uploads/${f.filename}`);

    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ----------------- SETTINGS ROUTES -----------------
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', upload.single('logo'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (req.body.password) settings.password = req.body.password;
    if (req.body.contactEmail !== undefined) settings.contactEmail = req.body.contactEmail;
    if (req.body.phone !== undefined) settings.phone = req.body.phone;
    
    if (!settings.socialLinks) settings.socialLinks = {};
    if (req.body.facebook !== undefined) settings.socialLinks.facebook = req.body.facebook;
    if (req.body.twitter !== undefined) settings.socialLinks.twitter = req.body.twitter;
    if (req.body.instagram !== undefined) settings.socialLinks.instagram = req.body.instagram;
    if (req.body.linkedin !== undefined) settings.socialLinks.linkedin = req.body.linkedin;
    if (req.body.youtube !== undefined) settings.socialLinks.youtube = req.body.youtube;

    if (req.file) {
      settings.logo = `uploads/${req.file.filename}`;
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

app.delete('/api/settings/logo', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (settings) {
      settings.logo = null;
      await settings.save();
    }
    res.json({ message: "Logo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});

// ----------------- GALLERY ROUTES -----------------

app.get('/api/gallery', async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({ year: -1 });
    res.json(galleryItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

app.post('/api/gallery/photo', upload.single('file'), async (req, res) => {
  try {
    const { caption, year, eventType } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const newItem = new Gallery({
      type: 'photo',
      url: `uploads/${req.file.filename}`,
      caption,
      year: Number(year),
      eventType
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save photo' });
  }
});

app.post('/api/gallery/video', async (req, res) => {
  try {
    const { url, caption, year, eventType } = req.body;
    const newItem = new Gallery({
      type: 'video',
      url,
      caption,
      year: Number(year),
      eventType
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save video' });
  }
});

app.put('/api/gallery/photo/:id', upload.single('file'), async (req, res) => {
  try {
    const { caption, year, eventType } = req.body;
    const update = { caption, year: Number(year), eventType };
    if (req.file) update.url = `uploads/${req.file.filename}`;

    const updated = await Gallery.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

app.put('/api/gallery/video/:id', async (req, res) => {
  try {
    const { url, caption, year, eventType } = req.body;
    const updated = await Gallery.findByIdAndUpdate(req.params.id, { url, caption, year: Number(year), eventType }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update video' });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ----------------- ACHIEVEMENTS ROUTES -----------------
app.get('/api/achievements', async (req, res) => {
  try {
    const items = await Achievement.find().sort({ year: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

app.post('/api/achievements', upload.single('certificate'), async (req, res) => {
  try {
    const { title, year, issuer } = req.body;
    let certPath = '';
    if (req.file) certPath = `uploads/${req.file.filename}`;
    const newAch = new Achievement({ title, year: Number(year), issuer, certificate: certPath });
    await newAch.save();
    res.status(201).json(newAch);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add achievement' });
  }
});

app.put('/api/achievements/:id', upload.single('certificate'), async (req, res) => {
  try {
    const { title, year, issuer } = req.body;
    const update = { title, year: Number(year), issuer };
    if (req.file) update.certificate = `uploads/${req.file.filename}`;
    const updated = await Achievement.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

app.delete('/api/achievements/:id', async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

// ----------------- INITIATIVES ROUTES -----------------
app.get('/api/initiatives', async (req, res) => {
  try {
    const initiatives = await Initiative.find().sort({ date: -1 });
    res.json(initiatives);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch initiatives' });
  }
});

app.post('/api/initiatives', upload.fields([
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  const { title, category, date, location, short_description, impact_metrics } = req.body;
  
  // ⭐ Auto-Tagging Interception via Python Flask Zero-Shot Model
  let tags = ["Community Support"];
  try {
    const mlRes = await axios.post("http://localhost:8000/classify-initiative", { title, description: short_description || "" });
    if (mlRes.data && mlRes.data.tags) {
      tags = mlRes.data.tags;
    }
  } catch (err) {
    console.warn("ML Classification Failed via Axios. Dropping to default tags.");
  }
  
  const impact = impact_metrics ? JSON.parse(impact_metrics) : { people_helped: 0 };
  const photoUrls = req.files?.photos ? req.files.photos.map(f => `uploads/${f.filename}`) : [];

  const newInitiative = new Initiative({
    title, category, date: new Date(date), location, short_description,
    impact_metrics: impact, photos: photoUrls, tags
  });

  await newInitiative.save();
  res.status(201).json(newInitiative);
});

app.put('/api/initiatives/:id', upload.fields([
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, category, date, location, short_description, impact_metrics } = req.body;
    const impact = impact_metrics ? JSON.parse(impact_metrics) : { people_helped: 0 };
    const update = { title, category, date: new Date(date), location, short_description, impact_metrics: impact };
    if (req.files?.photos) update.photos = req.files.photos.map(f => `uploads/${f.filename}`);
    
    const updated = await Initiative.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update initiative' });
  }
});

app.delete('/api/initiatives/:id', async (req, res) => {
  try {
    await Initiative.findByIdAndDelete(req.params.id);
    res.json({ message: 'Initiative deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete initiative' });
  }
});

// ----------------- GET SUBMISSIONS ROUTES -----------------
app.get('/api/events/submissions', async (req, res) => {
  try {
    const events = await Event.find().lean();
    const result = events.map(ev => {
      const parts = ev.participants || [];
      return {
        eventId: ev._id,
        title: ev.title,
        volunteerCap: ev.volunteerCap,
        volunteers: parts.filter(p => p.role === 'Volunteer'),
        participants: parts.filter(p => p.role === 'Participant')
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.get('/api/events/volunteers', async (req, res) => {
  try {
    const events = await Event.find().lean();
    const volunteersList = [];
    events.forEach(ev => {
      if (ev.participants) {
        ev.participants.forEach(p => {
          if (p.role === 'Volunteer') {
            volunteersList.push({
              name: p.name,
              email: p.email,
              phone: p.phone,
              age: p.age,
              eventTitle: ev.title
            });
          }
        });
      }
    });
    res.json(volunteersList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});


// ----------------- UPDATED REGISTRATION ROUTE -----------------

app.post('/api/events/:id/register', async (req, res) => {

  try {

    const { name, phone, email, age, role } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ error: 'Event not found' });

    // ⭐ CALL FLASK DUPLICATE DETECTION
    const response = await axios.post(
      "http://localhost:8000/check-duplicate",
      {
        name,
        phone,
        email,
        participants: event.participants
      }
    );
    if (response.data.duplicate) {
      event.duplicatesPrevented = (event.duplicatesPrevented || 0) + 1;
      await event.save();

      return res.status(400).json({
        error: "You already registered for this event"
      });
    }

    const normalizedRole =
      role === "Volunteer" ? "Volunteer" : "Participant";

    let triggeredAlert = null;

    if (normalizedRole === "Volunteer" && event.volunteerCap !== null) {
      const currentVolunteers = event.participants.filter(p => p.role === "Volunteer").length;
      if (currentVolunteers >= event.volunteerCap) {
        return res.status(400).json({ error: "Volunteer registration is full" });
      }
    } else if (normalizedRole === "Participant" && event.capacity > 0) {
      const currentParticipants = event.participants.filter(p => p.role === "Participant").length;
      if (currentParticipants >= event.capacity) {
        return res.status(400).json({ error: "Participant registration is full" });
      }
    }

    event.participants.push({
      name,
      phone,
      email,
      age: Number(age),
      role: normalizedRole
    });

    event.registered = event.participants.length;

    // Check for alerts AFTER pushing
    if (normalizedRole === "Volunteer" && event.volunteerCap !== null) {
      const newVols = event.participants.filter(p => p.role === "Volunteer").length;
      if (event.volunteerCap - newVols === 0 && !event.full_alert_volunteers) {
        triggeredAlert = "full_volunteers";
      } else if (event.volunteerCap - newVols <= 3 && !event.low_capacity_alert_volunteers) {
        triggeredAlert = "low_volunteers";
      }
    } else if (normalizedRole === "Participant" && event.capacity > 0) {
      const newParts = event.participants.filter(p => p.role === "Participant").length;
      if (event.capacity - newParts === 0 && !event.full_alert_participants) {
        triggeredAlert = "full_participants";
      } else if (event.capacity - newParts <= 3 && !event.low_capacity_alert_participants) {
        triggeredAlert = "low_participants";
      }
    }

    await event.save();

    res.json({
      message: "Successfully registered",
      event,
      triggeredAlert
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Registration failed"
    });

  }

});

// ----------------- ACK ALERT ROUTE -----------------
app.put('/api/events/:id/ack-alert', async (req, res) => {
  try {
    const { type } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (type === 'low_participants') event.low_capacity_alert_participants = true;
    if (type === 'low_volunteers') event.low_capacity_alert_volunteers = true;
    if (type === 'full_participants') event.full_alert_participants = true;
    if (type === 'full_volunteers') event.full_alert_volunteers = true;

    await event.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ack alert' });
  }
});


// ----------------- EVENT FEEDBACK ROUTE -----------------

app.post('/api/events/:id/feedback', async (req, res) => {
  try {
    const { email, text } = req.body;
    if (!email || !text) return res.status(400).json({ error: 'Email and feedback text are required' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Validate if the event is closed or in the past
    const now = new Date();
    const eventDate = new Date(event.date);
    if (event.status !== 'Closed' && eventDate >= now) {
      return res.status(400).json({ error: 'Feedback can only be submitted for past or closed events' });
    }

    // Verify participant
    const isParticipant = event.participants.some(p => p.email && p.email.toLowerCase() === email.toLowerCase());
    if (!isParticipant) {
      return res.status(403).json({ error: 'Only registered participants can leave feedback' });
    }

    // Check if participant already left feedback
    const alreadySubmitted = event.feedbacks?.some(f => f.participantEmail && f.participantEmail.toLowerCase() === email.toLowerCase());
    if (alreadySubmitted) {
      return res.status(400).json({ error: 'You have already submitted feedback for this event' });
    }

    // Send to Python ML API for sentiment analysis
    let sentiment = "Neutral";
    try {
      const mlRes = await axios.post("http://localhost:8000/analyze-sentiment", { text });
      if (mlRes.data && mlRes.data.sentiment) {
        sentiment = mlRes.data.sentiment;
      }
    } catch (err) {
      console.warn("Sentiment Analysis ML via Axios failed. Falling back to default.");
    }

    if (!event.feedbacks) event.feedbacks = [];
    event.feedbacks.push({ participantEmail: email.toLowerCase(), text, sentiment });
    
    await event.save();
    res.json({ message: "Feedback submitted successfully", sentiment });

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// ----------------- REPORT GENERATION (NODE -> PYTHON) --------------
app.post('/api/reports/generate', async (req, res) => {
  try {
    const events = await Event.find({}, 'title date participants volunteerCap duplicatesPrevented registered actual_participants status').lean();
    const initiatives = await Initiative.find({}, 'title impact_metrics').lean();
    const achievements = await Achievement.find({}, 'title year').lean();

    let totalParticipants = 0;
    let totalVolunteers = 0;
    let totalAttended = 0;
    let totalDuplicatesPrevented = 0;

    events.forEach(e => {
        totalDuplicatesPrevented += (e.duplicatesPrevented || 0);
        const parts = (e.participants || []).filter(p => p.role !== 'Volunteer');
        const vols = (e.participants || []).filter(p => p.role === 'Volunteer');
        
        if (parts.length > 0) {
            totalParticipants += parts.length;
            totalAttended += parts.filter(p => p.attended === true || p.attended === "true").length;
        } else {
            totalParticipants += (e.registered || 0);
            totalAttended += (e.actual_participants || 0);
        }
        totalVolunteers += vols.length;
    });

    const realDropoffRate = totalParticipants > 0 ? ((totalParticipants - totalAttended) / totalParticipants) * 100 : 0;

    // We now pass genuine dynamic duplicate intervention counts natively
    const stats = {
      totalParticipants,
      totalVolunteers,
      dropoffRate: realDropoffRate,
      duplicatesBlocked: totalDuplicatesPrevented
    };

    const payload = { events, initiatives, achievements, stats };

    // Send data to Flask ML Microservice
    const pythonResponse = await axios.post("http://localhost:8000/generate-report", payload);
    
    res.json(pythonResponse.data);
  } catch (err) {
    console.error("Report generation failed:", err);
    res.status(500).json({ error: "Failed to generate report from ML API" });
  }
});

// ----------------- EVENT PARTICIPATION PREDICTION --------------
async function predictParticipation(eventId) {
  const targetEvent = await Event.findById(eventId).lean();
  if (!targetEvent) throw new Error("Event not found");

  const now = new Date();
  const targetDate = new Date(targetEvent.date);
  const daysUntil = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));

  // Fetch past events that have actual_participants reported and are not upcoming
  const pastEventsQuery = await Event.find({
    actual_participants: { $ne: null },
    registered: { $ne: null },
    status: { $ne: 'upcoming' }
  }).lean();

  const past_events = pastEventsQuery.map(e => {
    const dDate = new Date(e.date);
    // Approximate days_until_event at the time of past registration (heuristically using 7 days if unknown, or assuming it was similar)
    // Actually the prompt doesn't specify how to derive historical days_until_event. We can use a default or 0 since it's past
    return {
      capacity: e.volunteerCap || 0, // treating capacity as volunteerCap
      days_until_event: 0,
      category: e.category || "General",
      registered: e.registered || (e.participants ? e.participants.length : 0),
      actual_participants: e.actual_participants
    };
  });

  const payload = {
    capacity: targetEvent.volunteerCap || 0,
    days_until_event: daysUntil,
    category: targetEvent.category || "General",
    past_events: past_events,
    registered_so_far: targetEvent.registered || (targetEvent.participants ? targetEvent.participants.length : 0)
  };

  const pythonResponse = await axios.post("http://localhost:8000/predict-participation", payload);
  return pythonResponse.data;
}

app.get('/api/events/:id/predict', async (req, res) => {
  try {
    const prediction = await predictParticipation(req.params.id);
    res.json(prediction);
  } catch (err) {
    console.error("Prediction failed:", err);
    res.status(503).json({ error: "Failed to predict participation via ML API" });
  }
});

// ----------------- COMPLAINTS ROUTES -----------------
app.post('/api/complaints', async (req, res) => {
  try {
    const { name, email, subject, description } = req.body;
    const trackingId = 'LKS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newComplaint = new Complaint({ name, email, subject, description, trackingId });
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (err) {
    console.error("COMPLAINT CREATION ERROR: ", err);
    res.status(500).json({ error: 'Failed to submit complaint', details: err.message });
  }
});

app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

app.get('/api/complaints/track/:trackingId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ trackingId: req.params.trackingId });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

app.put('/api/complaints/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

app.delete('/api/complaints/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

// ----------------- SERVER -----------------

app.listen(PORT, () => {

  console.log(`🚀 Server running on http://localhost:${PORT}`);

});