const axios = require('axios');
const FormData = require('form-data');

const fd = new FormData();
fd.append('title', 'Test');
fd.append('year', '2026');
fd.append('issuer', 'Self');

axios.post('http://localhost:5000/api/achievements', fd, { headers: fd.getHeaders() })
  .then(r => console.log('Success:', r.data))
  .catch(e => {
     console.error('Error response data:', e.response?.data);
     console.error('Error status:', e.response?.status);
     console.error('Error message:', e.message);
  });
