const mongoose = require('mongoose');

const initSchema = new mongoose.Schema({ title: String, category: String, date: Date, location: String, short_description: String, impact_metrics: Object, tags: [String] }, { strict: false });
const evSchema = new mongoose.Schema({ title: String, category: String, description: String, date: Date, venue: String, organizers: String, status: String, volunteerCap: Number, capacity: Number, photos: [String], poster: String }, { strict: false });
const achSchema = new mongoose.Schema({ title: String, year: Number, issuer: String, certificate: String }, { strict: false });
const galSchema = new mongoose.Schema({ type: String, url: String, caption: String, year: Number, eventType: String }, { strict: false });
const compSchema = new mongoose.Schema({ name: String, email: String, subject: String, description: String, status: String, trackingId: String }, { strict: false });

mongoose.connect('mongodb://0.0.0.0:27017/galleryAchievementsDB').then(async () => {
  const Event = mongoose.model('Event', evSchema);
  const Initiative = mongoose.model('Initiative', initSchema);
  const Achievement = mongoose.model('Achievement', achSchema);
  const Gallery = mongoose.model('Gallery', galSchema);
  const Complaint = mongoose.model('Complaint', compSchema);

  await Event.insertMany([
    {
      title: 'Digital Literacy for Seniors', category: 'Education',
      description: 'A 2-day workshop teaching senior citizens basic smartphone and internet navigation skills.',
      date: new Date('2026-11-20T10:00:00Z'), venue: 'Andheri Community Hall, Mumbai', organizers: 'Loksetu Volunteers',
      status: 'Open', capacity: 50, volunteerCap: 10
    },
    {
      title: 'Annual Blood Donation Camp', category: 'Health & Safety',
      description: 'Join us to save lives. Blood donation drive in partnership with local hospitals.',
      date: new Date('2026-12-05T08:00:00Z'), venue: 'Loksetu Main Center, Thane', organizers: 'Health Dept & Loksetu',
      status: 'Open', capacity: 200, volunteerCap: 15
    },
    {
      title: 'Beach Cleanup Drive', category: 'Environment',
      description: 'Cleaning up Versova beach early morning to restore marine ecosystem balance.',
      date: new Date('2026-01-10T06:30:00Z'), venue: 'Versova Beach, Mumbai', organizers: 'Eco Warriors',
      status: 'Closed', capacity: 100, volunteerCap: 0
    }
  ]);

  await Initiative.insertMany([
    {
      title: 'Green Earth Plantation', category: 'Tree Plantation',
      date: new Date('2025-06-15T00:00:00Z'), location: 'Aarey Forest, Mumbai',
      short_description: 'Successfully planted over 2,000 indigenous trees to combat urban deforestation.',
      impact_metrics: { people_helped: 0, projects_completed: 1 }, tags: ['Environment', 'Green']
    },
    {
      title: 'Monthly Ration Card Camp', category: 'Ration Card Drives',
      date: new Date('2026-05-12T00:00:00Z'), location: 'Dharavi, Mumbai',
      short_description: 'Helping underprivileged families successfully apply for and receive food provision cards.',
      impact_metrics: { people_helped: 350 }, tags: ['Welfare', 'Food']
    },
    {
      title: 'Slum Medical Outreach', category: 'Health/Hygiene',
      date: new Date('2026-08-20T00:00:00Z'), location: 'Malad East Slums',
      short_description: 'Providing free health checkups and sanitary products to women and children.',
      impact_metrics: { people_helped: 1200 }, tags: ['Health', 'Medical']
    }
  ]);

  await Achievement.insertMany([
    { title: 'Best NGO of the Year (Mumbai District)', year: 2025, issuer: 'State Welfare Board' },
    { title: 'Excellence in Community Service Award', year: 2024, issuer: 'National Rotary Club' },
    { title: 'Environmental Champions Gold Trophy', year: 2026, issuer: 'EcoIndia Foundation' }
  ]);

  await Gallery.insertMany([
    { type: 'photo', caption: 'Volunteers distributing food packets during the flood relief.', year: 2025, eventType: 'Relief Work' },
    { type: 'photo', caption: 'Happy faces from our children education program.', year: 2026, eventType: 'Education' },
    { type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Short documentary on Loksetu 5 year journey.', year: 2026, eventType: 'Milestone' }
  ]);

  await Complaint.insertMany([
    { name: 'Rahul Sharma', email: 'rahul@example.com', subject: 'Road repair needed', description: 'The main road near the station has severe potholes causing accidents.', status: 'Pending', trackingId: 'CMP-10023' },
    { name: 'Priya Desai', email: 'priya@example.com', subject: 'Water supply irregularity', description: 'We have not received municipal water for 3 days in building B.', status: 'In Progress', trackingId: 'CMP-10024' }
  ]);

  console.log('Successfully seeded data to all collections!');
  process.exit();
});
