const mongoose = require('mongoose');
const { parseExcelFile } = require('../utils/excelParser');
const fs = require('fs');

// Gets the list of events for the dashboard dropdown
exports.getAllEvents = async (req, res) => {
  try {
    const Event = mongoose.model('Event');
    // We only need _id and title for the dropdown
    const events = await Event.find({}, '_id title').sort({ date: -1 });
    // Normalize properties for frontend expectations
    const formatted = events.map(e => ({ _id: e._id, name: e.title }));
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching event list for analytics:", error);
    res.status(500).json({ error: "Failed to fetch event list" });
  }
};

// Gets the fully computed analytics for a single event
exports.getEventAnalytics = async (req, res) => {
  try {
    const Event = mongoose.model('Event');
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ error: "Event not found" });

    const allPeople = event.participants || [];
    const participants = allPeople.filter(p => p.role !== 'Volunteer');
    const volunteers = allPeople.filter(p => p.role === 'Volunteer');

    const registered = participants.length;
    const participated = participants.filter(p => p.attended === true).length;

    res.json({
      eventName: event.title,
      date: event.date,
      location: event.venue,
      organizer: event.organizers,
      registered,
      participated,
      participants,
      volunteers,
      totalVolunteers: volunteers.length
    });
  } catch (error) {
    console.error("Error fetching event analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Handles Excel upload, parsing, and pushing participants to the event
exports.uploadExcel = async (req, res) => {
  try {
    const Event = mongoose.model('Event');
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: "No Excel file provided" });
    }

    // Parse the file from disk
    const participants = parseExcelFile(req.file.path);
    
    // Delete file after parsing
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (participants.length === 0) {
      return res.status(400).json({ error: "Excel file was empty or contained incorrectly formatted rows" });
    }

    // Fetch the target event
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    let updatedCount = 0;
    let addedCount = 0;

    participants.forEach(excelP => {
      // 1. Try to find a match by Email (Primary) or Name (Secondary)
      const existing = event.participants.find(p => 
        (p.email && excelP.email && p.email.toLowerCase().trim() === excelP.email.toLowerCase().trim()) || 
        (p.name && excelP.name && p.name.toLowerCase().trim() === excelP.name.toLowerCase().trim())
      );

      if (existing) {
        // Update existing registration
        existing.attended = excelP.attended;
        updatedCount++;
      } else {
        // Truly a new walk-in or manual entry
        event.participants.push(excelP);
        addedCount++;
      }
    });

    // Save the fully reconciled document
    await event.save();

    res.json({
      message: "Roster reconciled successfully",
      updatedCount,
      addedCount,
      totalProcessed: participants.length
    });

  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({ error: error.message || "Failed to process Excel file" });
  }
};

exports.getGlobalKpis = async (req, res) => {
  try {
    const Event = mongoose.model('Event');
    const Initiative = mongoose.model('Initiative');

    const [events, initiatives] = await Promise.all([
      Event.find({}, 'participants'),
      Initiative.find({}, 'impact_metrics')
    ]);

    const totalEvents = events.length;
    let totalParticipants = 0;
    let totalAttended = 0;
    let totalVolunteers = 0;

    events.forEach(e => {
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

    let additionalImpact = 0;
    initiatives.forEach(init => {
      if (init.impact_metrics && init.impact_metrics.people_helped) {
        additionalImpact += Number(init.impact_metrics.people_helped);
      }
    });

    const realTotalImpact = totalParticipants + additionalImpact;

    const avgAttendanceRate = totalParticipants > 0 ? (totalAttended / totalParticipants) * 100 : 0;
    const avgRetentionRate = totalParticipants > 0 ? (totalAttended / totalParticipants) * 100 : 0;

    res.json({
      totalEvents,
      totalParticipants: realTotalImpact,
      totalVolunteers,
      avgAttendanceRate: Number(avgAttendanceRate.toFixed(2)),
      avgRetentionRate: Number(avgRetentionRate.toFixed(2))
    });
  } catch (error) {
    console.error("Error fetching global KPIs:", error);
    res.status(500).json({ error: "Failed to fetch global KPIs" });
  }
};
