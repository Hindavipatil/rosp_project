const axios = require('axios');
const FormData = require('form-data');
async function run() {
  const fd = new FormData();
  fd.append('title', 'Test Event');
  fd.append('description', 'Test Description');
  fd.append('date', '2026-10-10');
  fd.append('venue', 'Pune');
  fd.append('organizers', 'Test');
  
  try {
    const res = await axios.post('http://localhost:5000/api/events', fd, { headers: fd.getHeaders() });
    console.log("Success:", res.data);
  } catch(err) {
    if(err.response) {
      console.log("Error Response status:", err.response.status);
      console.log("Error Response data:", err.response.data);
    } else {
      console.log("Error Message:", err.message);
    }
  }
}
run();
