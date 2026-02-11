const https = require('https');

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

  // 2. Build URL
  let baseUrl = "";
  let queryParams = [
    `pagenumber=1`,
    `users_date=${dateStr}`,
    `current_time=${timeStr}`,
    `todays_day=${dayOfWeek}`
  ];

  if (params.nusach) queryParams.push(`nusach=${encodeURIComponent(params.nusach)}`);
  if (params.tefillah) queryParams.push(`tefillah=${encodeURIComponent(params.tefillah)}`);

  if (lat && lng) {
    baseUrl = "https://www.godaven.com/api/V2/shuls/radius-search";
    queryParams.push(`lat=${lat}`);
    queryParams.push(`lng=${lng}`);
    queryParams.push(`distance=20`);
  } else {
    baseUrl = "https://www.godaven.com/api/V2/shuls/search-all";
    queryParams.push(`query=${encodeURIComponent(q)}`);
  }

  const finalUrl = `${baseUrl}?${queryParams.join('&')}`;
  const API_KEY = process.env.GODAVEN_PRIVATE_KEY;

  console.log(`Requesting: ${finalUrl}`);

  // 3. Perform Request (Using Native Node HTTPS - No Dependencies needed)
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    https.get(finalUrl, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            statusCode: 200,
            body: data
          });
        } else {
          resolve({
            statusCode: res.statusCode,
            body: JSON.stringify({ error: true, message: `GoDaven Error: ${res.statusMessage}` })
          });
        }
      });

    }).on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: true, message: e.message })
      });
    });
  });
};
