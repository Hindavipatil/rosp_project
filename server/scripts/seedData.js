const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://0.0.0.0:27017/galleryAchievementsDB';

// Define the exact same schema structure used natively by the application
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: "General" },
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
  tags: { type: [String], default: [] },
  actual_participants: { type: Number, default: null },
  participants: [
    {
      name: String,
      phone: String,
      email: String,
      age: Number,
      role: { type: String, enum: ['Volunteer', 'Participant'], default: 'Participant' },
      attended: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true });

// Prevent mongoose overwrite crashes if the model happens to exist
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

const generateParticipants = (count, role, attendanceRate) => {
  const firstNames = ['Amit', 'Riya', 'Suresh', 'Neha', 'Rohan', 'Priya', 'Kavita', 'Vikram', 'Anjali', 'Arjun', 'Smriti', 'Rahul'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kapoor', 'Das', 'Reddy', 'Yadav', 'Joshi'];
  
  const generated = [];
  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`;
    // Decide if attended based on requested probability rate
    const attended = Math.random() < attendanceRate;

    generated.push({
      name,
      email,
      phone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
      age: Math.floor(18 + Math.random() * 40),
      role,
      attended
    });
  }
  return generated;
};

const seedDatabase = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    console.log("🗑️ Deleting all existing events...");
    await Event.deleteMany({});
    console.log("✅ Flushed previous event data.");

    console.log("🌱 Injecting new sample data...");

    // Event 1: High participation, most people attended
    const event1Participants = [
      ...generateParticipants(12, 'Participant', 0.85), // 85% attendance
      ...generateParticipants(4, 'Volunteer', 1.0)       // 100% attendance
    ];
    
    // Event 2: Low participation, huge drop in retention
    const event2Participants = [
      ...generateParticipants(5, 'Participant', 0.3),  // 30% attendance
      ...generateParticipants(1, 'Volunteer', 1.0)
    ];

    // Event 3: Medium participation, balanced
    const event3Participants = [
      ...generateParticipants(8, 'Participant', 0.6),  // 60% attendance
      ...generateParticipants(3, 'Volunteer', 0.8)
    ];
    
    // Event 4: Large scale public event
    const event4Participants = [
        ...generateParticipants(25, 'Participant', 0.75), 
        ...generateParticipants(8, 'Volunteer', 0.9)
    ];

    const eventsData = [
      {
        title: "Tree Plantation Drive",
        date: new Date("2026-03-10"),
        venue: "Sanjay Gandhi National Park, Mumbai",
        organizers: "NGO Green Earth",
        category: "Environment",
        status: "Closed",
        participants: event1Participants,
        registered: event1Participants.filter(p => p.role === 'Participant').length
      },
      {
        title: "Coastal Beach Clean-up",
        date: new Date("2026-04-05"),
        venue: "Juhu Beach, Mumbai",
        organizers: "Ocean Protectors India",
        category: "Environment",
        status: "Closed",
        participants: event2Participants,
        registered: event2Participants.filter(p => p.role === 'Participant').length
      },
      {
        title: "Slum Education Workshop",
        date: new Date("2026-04-15"),
        venue: "Dharavi Community Hall",
        organizers: "Teach for All",
        category: "Education",
        status: "Open",
        participants: event3Participants,
        registered: event3Participants.filter(p => p.role === 'Participant').length
      },
      {
        title: "Blood Donation Camp",
        date: new Date("2026-05-01"),
        venue: "Tata Memorial District Hospital",
        organizers: "Red Cross Society",
        category: "Health",
        status: "Open",
        participants: event4Participants,
        registered: event4Participants.filter(p => p.role === 'Participant').length
      }
    ];

    await Event.insertMany(eventsData);
    console.log("✅ Inserted 4 rich sample events successfully!");

    // Final checks
    const count = await Event.countDocuments();
    console.log(`📊 Total Events in database: ${count}`);

    console.log("👋 Run complete. Closing connection.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
