const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://0.0.0.0:27017/galleryAchievementsDB';

// Connecting to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB for Seeding');
    seedDatabase();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

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
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  venue: String,
  organizers: String,
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  poster: String,
  photos: [String],
  volunteerCap: { type: Number, default: null },
  participants: [
    {
      name: String,
      phone: String,
      email: String,
      age: Number,
      role: { type: String, enum: ['Volunteer', 'Participant'], default: 'Participant' }
    }
  ]
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Initiative = mongoose.model('Initiative', initiativeSchema);
const Event = mongoose.model('Event', eventSchema);

async function seedDatabase() {
  try {
    console.log('Clearing old data...');
    await Gallery.deleteMany({});
    await Achievement.deleteMany({});
    await Initiative.deleteMany({});
    await Event.deleteMany({});

    console.log('Inserting dummy Initiatives...');
    const initiatives = await Initiative.insertMany([
      {
        title: "Clean River Campaign",
        category: "Environment",
        date: new Date("2025-06-15"),
        location: "Pune Riverside",
        short_description: "A community drive to clean up plastic waste along the riverbanks.",
        impact_metrics: { people_helped: 1200 },
        photos: []
      },
      {
        title: "Winter Clothes Donation",
        category: "Social Welfare",
        date: new Date("2025-11-20"),
        location: "Mumbai Suburbs",
        short_description: "Distributing warm clothes to the underprivileged before winter hits.",
        impact_metrics: { people_helped: 3500 },
        photos: []
      },
      {
        title: "Tech Education for Kids",
        category: "Education",
        date: new Date("2026-01-10"),
        location: "Local Public Schools",
        short_description: "Providing basic coding workshops for school children.",
        impact_metrics: { people_helped: 450 },
        photos: []
      }
    ]);

    console.log('Inserting dummy Events...');
    const events = await Event.insertMany([
      {
        title: "Annual Health Camp 2026",
        description: "Free medical checkups including vision, dental, and general health screenings.",
        date: new Date("2026-04-10"),
        venue: "Community Hall, Main Square",
        organizers: "Loksetu Foundation",
        status: "Open",
        volunteerCap: 15,
        poster: "",
        photos: [],
        participants: [
          { name: "Amit Kumar", phone: "9876543210", email: "amit@example.com", age: 28, role: "Volunteer" },
          { name: "Priya Sharma", phone: "9876543211", email: "priya@example.com", age: 34, role: "Participant" },
          { name: "Rohan Das", phone: "9876543212", email: "rohan@example.com", age: 41, role: "Participant" }
        ]
      },
      {
        title: "Tree Plantation Drive",
        description: "Planting 10,000 saplings across the city to improve air quality.",
        date: new Date("2026-07-05"),
        venue: "City Outskirts",
        organizers: "Green Earth NGOs",
        status: "Open",
        volunteerCap: 30,
        poster: "",
        photos: [],
        participants: [
          { name: "Sneha Patil", phone: "9123456780", email: "sneha@example.com", age: 24, role: "Volunteer" },
          { name: "Vikram Singh", phone: "9123456781", email: "vikram@example.com", age: 30, role: "Volunteer" }
        ]
      },
      {
        title: "Webinar on Python Machine Learning",
        description: "Introductory session teaching basic regression and classification Models.",
        date: new Date("2025-10-12"),
        venue: "Online (Zoom)",
        organizers: "Loksetu Tech Team",
        status: "Closed",
        volunteerCap: 5,
        poster: "",
        photos: [],
        participants: [
          { name: "Aditi Rao", phone: "9988776655", email: "aditi@example.com", age: 21, role: "Participant" },
          { name: "Kabir Mehta", phone: "9988776656", email: "kabir@example.com", age: 25, role: "Participant" },
          { name: "Anjali Verma", phone: "9988776657", email: "anjali@example.com", age: 29, role: "Volunteer" }
        ]
      }
    ]);

    console.log('Inserting dummy Achievements...');
    await Achievement.insertMany([
      { title: "Best NGO Initiative 2025", year: 2025, issuer: "State Government", certificate: "" },
      { title: "Excellence in Community Service", year: 2024, issuer: "Social Welfare Board", certificate: "" }
    ]);

    console.log('Inserting dummy Gallery Items...');
    await Gallery.insertMany([
      { type: "photo", url: "", caption: "Volunteers distributing food.", year: 2024, eventType: "Welfare" },
      { type: "photo", url: "", caption: "Students learning to code.", year: 2025, eventType: "Education" },
      { type: "photo", url: "", caption: "Mega Tree Plantation kickoff.", year: 2026, eventType: "Environment" }
    ]);

    console.log('✨ Dummy Data successfully seeded into the database!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}
