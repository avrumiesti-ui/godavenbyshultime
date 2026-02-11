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

  // 2. Start building the URL (Base)
  let baseUrl = "";
  let urlParams = new URLSearchParams();

  // Always add these required defaults
  urlParams.append("pagenumber", "1");
  urlParams.append("users_date", dateStr);
  urlParams.append("current_time", timeStr);
  urlParams.append("todays_day", dayOfWeek);

  // 3. Add Optional Filters (ONLY if they exist)
  if (params.nusach) urlParams.append("nusach", params.nusach);
  if (params.tefillah) urlParams.append("tefillah", params.tefillah);

  // 4. Decide Endpoint
  if (lat && lng) {
    baseUrl = "https://www.godaven.com/api/V2/shuls/radius-search";
    urlParams.append("lat", lat);
    urlParams.append("lng", lng);
    urlParams.append("distance", "20"); // Increased radius to 20 miles
  } else {
    baseUrl = "https://www.godaven.com/api/V2/shuls/search-all";
    urlParams.append("query", q);
  }

  const FINAL_URL = `${baseUrl}?${urlParams.toString()}`;
  const API_KEY = process.env.GODAVEN_PRIVATE_KEY; 

  try {
    const response = await fetch(FINAL_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const data = await response.json();

    // DEBUGGING HELPER:
    // If we get 0 results, we send back a special message to help you debug
    if (!data || (Array.isArray(data) && data.length === 0) || (data.SearchResults && data.SearchResults.length === 0)) {
         return {
            statusCode: 200,
            body: JSON.stringify({ 
                results: [], 
                debug_info: {
                    message: "API returned 0 results",
                    url_used: FINAL_URL // This will let us see exactly what URL was sent!
                }
            })
         };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: error.message })
    };
  }
};
