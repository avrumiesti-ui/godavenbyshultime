const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const params = event.queryStringParameters;
  const q = params.q || "";
  const lat = params.lat;
  const lng = params.lng;
  
  // 1. Get Date/Time
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
  const dayOfWeek = now.getDay() + 1;

  // 2. Build URL (Standard V2 API)
  let API_URL = "";
  if (lat && lng) {
    API_URL = `https://www.godaven.com/api/V2/shuls/radius-search?lat=${lat}&lng=${lng}&distance=10&pagenumber=1&nusach=&tefillah=&day=&current_time=${timeStr}&todays_day=${dayOfWeek}&users_date=${dateStr}`;
  } else {
    API_URL = `https://www.godaven.com/api/V2/shuls/search-all?query=${encodeURIComponent(q)}&pagenumber=1&users_date=${dateStr}&nusach=&tefillah=&day=&current_time=${timeStr}&todays_day=${dayOfWeek}`;
  }

  // 3. Get Key from Netlify
  const API_KEY = process.env.GODAVEN_PRIVATE_KEY; 

  console.log(`Fetching: ${API_URL}`); // This goes to Netlify Logs

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // IMPORTANT: We try both common header names for keys.
        // One of these WILL work if the key is valid.
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY 
      }
    });

    // 4. Capture & Return Errors to Frontend
    if (!response.ok) {
       const text = await response.text();
       return { 
         statusCode: response.status, 
         body: JSON.stringify({ error: true, message: `GoDaven Error ${response.status}: ${text}` }) 
       };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: `Server Crash: ${error.message}` })
    };
  }
};
