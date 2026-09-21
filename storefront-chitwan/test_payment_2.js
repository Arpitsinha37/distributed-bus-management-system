const axios = require('axios');
async function run() {
  try {
    const api = axios.create({ baseURL: 'https://backend-api-production-be2e.up.railway.app/api/v1' });
    
    console.log("Initiating payment...");
    const payRes = await api.post('/payments/esewa/initiate', {
      bookingId: 'cmu965ah7001dly82fh2etijf'
    });
    console.log(payRes.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
