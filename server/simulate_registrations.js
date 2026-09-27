const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function runStressTest() {
  console.log("🚀 Starting ML Duplicate Detection Stress Test...");

  try {
    // 1. Fetch available Events to target
    console.log("Fetching target event...");
    const eventsRes = await axios.get("http://localhost:5000/api/events");
    const events = eventsRes.data;
    
    if (events.length === 0) {
      console.log("❌ No events found in MongoDB to register against! Please create one in Admin Panel.");
      return;
    }

    const targetEvent = events[0];
    console.log(`Targeting Event: "${targetEvent.title}" (ID: ${targetEvent._id})\n`);

    // 2. Load the generated JSON payload
    const dataPath = path.join(__dirname, 'ml_api', 'ml_duplicate_test_dataset.json');
    const payloads = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log(`Loaded ${payloads.length} test participants. Beginning bulk registration...`);

    let successCount = 0;
    let mlRejectedCount = 0;
    let failedCount = 0;

    // 3. Loop and simulate API hits
    for (const [index, payload] of payloads.entries()) {
      try {
        const response = await axios.post(`http://localhost:5000/api/events/${targetEvent._id}/register`, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
          age: 25 // standard age
        });
        
        console.log(`[${index+1}/${payloads.length}] ✅ Inserted: ${payload.name}`);
        successCount++;
        
      } catch (err) {
        if (err.response && err.response.status === 400) {
           console.log(`[${index+1}/${payloads.length}] 🛑 ML CAUGHT DUPLICATE: ${payload.name} -> ${err.response.data.error}`);
           mlRejectedCount++;
        } else {
           console.log(`[${index+1}/${payloads.length}] ❌ ERRORED: ${payload.name}`);
           failedCount++;
        }
      }
      
      // Throttle slightly to not overwhelm the local single-threaded server instantly
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log("\n📊 ==== STRESS TEST RESULTS ====");
    console.log(`Total Sent: ${payloads.length}`);
    console.log(`Successfully Registered (Unique): ${successCount}`);
    console.log(`Caught by ML Engine (Duplicate): ${mlRejectedCount}`);
    console.log(`Failed (Other Error/Vol Cap Hit): ${failedCount}`);

  } catch (err) {
    console.error("Critical Failure:", err.message);
  }
}

runStressTest();
