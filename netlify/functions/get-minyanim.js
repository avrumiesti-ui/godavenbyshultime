const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const params = event.queryStringParameters;
  const q = params.q || "";
  const lat = params.lat;
  const lng = params.lng;
  
  // 1. Get Current Date & Time
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
  const dayOfWeek = now.getDay() + 1;

  // 2. Build URL
  let API_URL = "";
  if (lat && lng) {
    API_URL = `https://www.godaven.com/api/V2/shuls/radius-search?lat=${lat}&lng=${lng}&distance=20&pagenumber=1&nusach=&tefillah=&day=&current_time=${timeStr}&todays_day=${dayOfWeek}&users_date=${dateStr}`;
  } else {
    API_URL = `https://www.godaven.com/api/V2/shuls/search-all?query=${encodeURIComponent(q)}&pagenumber=1&users_date=${dateStr}&nusach=&tefillah=&day=&current_time=${timeStr}&todays_day=${dayOfWeek}`;
  }

  try {
    // 3. THE FIX: Add "Fake" Headers so GoDaven doesn't block us
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.godaven.com/',
        'Origin': 'https://www.godaven.com'
      }
    });

    if (!response.ok) {
       return { statusCode: response.status, body: `GoDaven Blocked Us: ${response.statusText}` };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow your site to see the data
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", details: error.message })
    };
  }
};
