// This runs on the SERVER, so nobody can see this code in the browser.
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 1. Get the query from your website (e.g. ?q=New York)
  const query = event.queryStringParameters.q || "";

  // 2. Get your Secret Key from the Environment (Safe Place)
  const API_KEY = process.env.GODAVEN_PRIVATE_KEY; 
  
  // 3. The Real GoDaven Endpoint (Replace with the actual URL you have)
  const API_URL = `https://api.godaven.com/v1/search?location=${query}`; 

  try {
    // 4. Call GoDaven WITH the key
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`, // Or however their API requires the key
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // 5. Send the data back to your website
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data" })
    };
  }
};
