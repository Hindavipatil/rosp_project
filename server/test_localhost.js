const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('http://localhost:5000/api/settings');
    console.log("Success fetching settings. Valid connection to Node.");
  } catch(err) {
    if(err.response) {
      console.log("Error Response data:", err.response.data);
    } else {
      console.log("Error Message:", err.message);
    }
  }
}
run();
