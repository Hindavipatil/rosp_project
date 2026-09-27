const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://0.0.0.0:27017/galleryAchievementsDB';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: "General" },
  date: { type: Date, required: true },
  status: { type: String }, 
  volunteerCap: { type: Number, default: null },
  registered: { type: Number, default: 0 },
  capacity: { type: Number, default: 0 },
  actual_participants: { type: Number, default: null },
  registrations: { type: Number, default: 0 },
  attendance: { type: Number, default: null },
  maxRegistrations: { type: Number, default: null }
}, { timestamps: true, strict: false });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

const seedEvents = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const data = [
      // Health
      { title: "Health Screening Camp", category: "Health", date: new Date("2025-11-15"), registered: 35, registrations: 35, actual_participants: 31, attendance: 31, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Blood Donation Drive", category: "Health", date: new Date("2025-12-15"), registered: 30, registrations: 30, actual_participants: 27, attendance: 27, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Mental Health Awareness", category: "Health", date: new Date("2026-01-15"), registered: 38, registrations: 38, actual_participants: 33, attendance: 33, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Eye Checkup Camp", category: "Health", date: new Date("2026-02-15"), registered: 32, registrations: 32, actual_participants: 29, attendance: 29, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Dental Health Drive", category: "Health", date: new Date("2026-03-15"), registered: 36, registrations: 36, actual_participants: 30, attendance: 30, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      
      // Education
      { title: "Digital Literacy Basics", category: "Education", date: new Date("2025-11-20"), registered: 30, registrations: 30, actual_participants: 25, attendance: 25, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Career Guidance Session", category: "Education", date: new Date("2025-12-20"), registered: 34, registrations: 34, actual_participants: 28, attendance: 28, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Scholarship Awareness Drive", category: "Education", date: new Date("2026-01-20"), registered: 38, registrations: 38, actual_participants: 34, attendance: 34, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Women in STEM Talk", category: "Education", date: new Date("2026-02-20"), registered: 40, registrations: 40, actual_participants: 37, attendance: 37, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Government Exam Prep Camp", category: "Education", date: new Date("2026-03-20"), registered: 40, registrations: 40, actual_participants: 38, attendance: 38, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      
      // Environment
      { title: "Clean City Drive", category: "Environment", date: new Date("2025-11-25"), registered: 32, registrations: 32, actual_participants: 24, attendance: 24, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Plastic Free Campaign", category: "Environment", date: new Date("2025-12-25"), registered: 28, registrations: 28, actual_participants: 18, attendance: 18, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Tree Plantation Drive", category: "Environment", date: new Date("2026-01-25"), registered: 35, registrations: 35, actual_participants: 28, attendance: 28, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Water Conservation Talk", category: "Environment", date: new Date("2026-02-25"), registered: 30, registrations: 30, actual_participants: 21, attendance: 21, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Waste Segregation Workshop", category: "Environment", date: new Date("2026-03-25"), registered: 33, registrations: 33, actual_participants: 25, attendance: 25, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      
      // Welfare
      { title: "Women Safety Awareness", category: "Welfare", date: new Date("2025-11-10"), registered: 25, registrations: 25, actual_participants: 10, attendance: 10, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Senior Citizen Support Camp", category: "Welfare", date: new Date("2025-12-10"), registered: 28, registrations: 28, actual_participants: 13, attendance: 13, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Child Rights Workshop", category: "Welfare", date: new Date("2026-01-10"), registered: 30, registrations: 30, actual_participants: 15, attendance: 15, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Widow Welfare Scheme Info", category: "Welfare", date: new Date("2026-02-10"), registered: 32, registrations: 32, actual_participants: 17, attendance: 17, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Disability Support Drive", category: "Welfare", date: new Date("2026-03-10"), registered: 30, registrations: 30, actual_participants: 17, attendance: 17, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      
      // General
      { title: "Town Hall Meeting", category: "General", date: new Date("2025-11-05"), registered: 28, registrations: 28, actual_participants: 11, attendance: 11, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Ward Committee Session", category: "General", date: new Date("2025-12-05"), registered: 25, registrations: 25, actual_participants: 9, attendance: 9, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Public Grievance Meet", category: "General", date: new Date("2026-01-05"), registered: 30, registrations: 30, actual_participants: 13, attendance: 13, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Citizen Feedback Forum", category: "General", date: new Date("2026-02-05"), registered: 27, registrations: 27, actual_participants: 11, attendance: 11, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Budget Review Meeting", category: "General", date: new Date("2026-03-05"), registered: 29, registrations: 29, actual_participants: 13, attendance: 13, status: "completed", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      
      // UPCOMING
      { title: "Health Awareness Week", category: "Health", date: new Date("2026-05-10"), registered: 0, registrations: 0, actual_participants: 0, attendance: 0, status: "upcoming", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Digital Skills Bootcamp", category: "Education", date: new Date("2026-05-15"), registered: 0, registrations: 0, actual_participants: 0, attendance: 0, status: "upcoming", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Environment Clean Drive", category: "Environment", date: new Date("2026-05-20"), registered: 0, registrations: 0, actual_participants: 0, attendance: 0, status: "upcoming", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "Women Welfare Summit", category: "Welfare", date: new Date("2026-06-05"), registered: 0, registrations: 0, actual_participants: 0, attendance: 0, status: "upcoming", capacity: 50, volunteerCap: 50, maxRegistrations: 50 },
      { title: "General Public Forum", category: "General", date: new Date("2026-06-15"), registered: 0, registrations: 0, actual_participants: 0, attendance: 0, status: "upcoming", capacity: 50, volunteerCap: 50, maxRegistrations: 50 }
    ];

    await Event.insertMany(data);
    console.log("✅ 30 historical + upcoming events seeded for prediction analysis");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedEvents();
