const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 1. Get the parameters sent from your website
  const params = event.queryStringParameters;
  const q = params.q || "";
  const lat = params.lat;
  const lng = params.lng;
  
  // 2. Get Current Date & Time (Required by GoDaven to show accurate zmanim)
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // e.g. "2026-02-11"
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // e.g. "15:17"
  const dayOfWeek = now.getDay() + 1; // 1=Sun, 7=Shabbos

  let API_URL = "";

  // 3. DECIDE: GPS Search vs. Name Search
  if (lat && lng) {
    // Scenario A: We have GPS coordinates -> Use "Radius Search"
    // distance=10 means 10 miles radius
    API_URL = `https://www.godaven.com/api/V2/shuls/radius-search?lat=${lat}&lng=${lng}&distance=10&pagenumber=1&nusach=&tefillah=&day=&current_time=${timeStr}&todays_day=${dayOfWeek}&users_date=${dateStr}`;
  } else {
    // Scenario B: We only have text -> Use "Search All"
    API_URL = `https://www.godaven.com/api/V2/shuls/search-all?query=${encodeURIComponent(q)}&pagenumber=1&users_date=${dateStr}&nusach=&tefillah=&day=&current_time=${timeStr}&todays_day=${dayOfWeek}`;
  }

  // 4. Get your Private Key from Netlify settings
  const API_KEY = process.env.GODAVEN_PRIVATE_KEY; 

  try {
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': `Bearer ${API_KEY}` // Uncomment this line if you confirmed they use a Bearer token
      }
    });

    if (!response.ok) {
       return { statusCode: response.status, body: `GoDaven API Error: ${response.statusText}` };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", details: error.message })
    };
  }
};
