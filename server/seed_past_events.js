const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://0.0.0.0:27017/galleryAchievementsDB';

const eventSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  date: Date,
  venue: String,
  organizers: String,
  status: String,
  volunteerCap: Number,
  registered: Number,
  actual_participants: Number,
});

const Event = mongoose.model('Event', eventSchema);

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB for Seeding');

    const pastEvents = [
      {
        title: "Historical Cleanup 1",
        category: "Environment",
        description: "Past beach cleanup",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        venue: "Beach",
        organizers: "NGO",
        status: "Closed",
        volunteerCap: 100,
        registered: 80,
        actual_participants: 65
      },
      {
        title: "Historical Health Camp",
        category: "Health",
        description: "Past health checkup",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        venue: "Hospital",
        organizers: "NGO",
        status: "Closed",
        volunteerCap: 50,
        registered: 50,
        actual_participants: 40
      },
      {
        title: "Historical Education Drive",
        category: "Education",
        description: "Past book distribution",
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        venue: "School",
        organizers: "NGO",
        status: "Closed",
        volunteerCap: 120,
        registered: 100,
        actual_participants: 90
      },
      {
        title: "Recent Cleanup 2",
        category: "Environment",
        description: "Another past beach cleanup",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        venue: "Beach",
        organizers: "NGO",
        status: "Closed",
        volunteerCap: 80,
        registered: 75,
        actual_participants: 60
      }
    ];

    await Event.insertMany(pastEvents);
    console.log(`✅ Successfully seeded ${pastEvents.length} historical events for ML Prediction!`);
    
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
