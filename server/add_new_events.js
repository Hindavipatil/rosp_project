const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://0.0.0.0:27017/galleryAchievementsDB';

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

const Event = mongoose.model('Event', eventSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB...");

    const additionalEvents = [
      {
        title: "Beach Cleanup Drive",
        description: "Massive morning cleanup to clear plastic waste across Juhu shore.",
        date: new Date("2026-05-15"),
        venue: "Juhu Beach",
        organizers: "Loksetu Earth",
        status: "Open",
        volunteerCap: 5, // We will trigger the "hit maximum capacity" AI warning!
        participants: [
            { name: "John Doe", phone: "9876543000", email: "john@example.com", age: 30, role: "Volunteer" },
            { name: "Jane Doe", phone: "9876543001", email: "jane@example.com", age: 29, role: "Volunteer" },
            { name: "Max Payne", phone: "9876543002", email: "max@example.com", age: 25, role: "Volunteer" },
            { name: "Alan Wake", phone: "9876543003", email: "alan@example.com", age: 35, role: "Volunteer" },
            { name: "Tom Nook", phone: "9876543004", email: "tom@example.com", age: 40, role: "Volunteer" }
        ]
      },
      {
        title: "Tech Literacy Workshop",
        description: "Providing fundamental laptop and typing skills to elder citizens.",
        date: new Date("2026-08-10"),
        venue: "City Hall Library",
        organizers: "Loksetu Education",
        status: "Open",
        volunteerCap: 20, // Huge capacity but barely any assigned -> Triggers "Struggled to attract volunteers!"
        participants: [
            { name: "Aarav Sharma", phone: "9223344551", email: "aarav@example.com", age: 22, role: "Volunteer" },
            { name: "Elder Citizen 1", phone: "9988776651", email: "elder1@example.com", age: 65, role: "Participant" },
            { name: "Elder Citizen 2", phone: "9988776652", email: "elder2@example.com", age: 70, role: "Participant" },
            { name: "Elder Citizen 3", phone: "9988776653", email: "elder3@example.com", age: 68, role: "Participant" },
            { name: "Elder Citizen 4", phone: "9988776654", email: "elder4@example.com", age: 60, role: "Participant" },
            { name: "Elder Citizen 5", phone: "9988776655", email: "elder5@example.com", age: 72, role: "Participant" },
            { name: "Elder Citizen 6", phone: "9988776656", email: "elder6@example.com", age: 69, role: "Participant" },
            { name: "Elder Citizen 7", phone: "9988776657", email: "elder7@example.com", age: 63, role: "Participant" }
            // 7 participants to 1 volunteer -> Triggers "Volunteer Shortage" AI warning!
        ]
      },
      {
        title: "Women Empowerment Seminar",
        description: "A guest speaker series discussing entrepreneurship and micro-loans for women.",
        date: new Date("2026-11-20"),
        venue: "Loksetu Head Office",
        organizers: "Loksetu Society",
        status: "Open",
        volunteerCap: 10,
        participants: [
            { name: "Sara Khan", phone: "9112233445", email: "sara@example.com", age: 31, role: "Volunteer" },
            { name: "Kirti Verma", phone: "9112233446", email: "kirti@example.com", age: 28, role: "Volunteer" },
            { name: "Mona Das", phone: "9112233447", email: "mona@example.com", age: 24, role: "Volunteer" },
            { name: "Ayesha S", phone: "9112233448", email: "ayesha@example.com", age: 26, role: "Volunteer" },
            { name: "Participant A", phone: "9112233449", email: "partA@example.com", age: 22, role: "Participant" },
            { name: "Participant B", phone: "9112233450", email: "partB@example.com", age: 43, role: "Participant" }
        ]
      },
      {
        title: "City Blood Donation Drive",
        description: "Partnering with Local Hospital to aggregate 500 liters of O+ blood.",
        date: new Date("2026-09-01"),
        venue: "Apollo Hospital Ground",
        organizers: "Loksetu Medical",
        status: "Open",
        volunteerCap: 15,
        participants: []
      }
    ];

    await Event.insertMany(additionalEvents);
    console.log(`✅ Successfully injected ${additionalEvents.length} new events designed to test ML Analytical insights!`);
    process.exit(0);

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
