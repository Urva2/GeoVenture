const https = require('https');

const places = ['Ziro', 'Malana', 'Cherrapunji', 'Mawlynnong', 'Diskit', 'Lachung', 'Chitkul', 'Kalpa', 'Khonoma'];

async function searchPlace(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`, {
      headers: { 'User-Agent': 'GeoVenture-Test/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => reject(err));
  });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  for (const place of places) {
    try {
      const results = await searchPlace(place);
      console.log(`\n=== Results for "${place}" ===`);
      if (results.length === 0) {
        console.log('  No results found.');
      } else {
        for (const d of results) {
          console.log(`  Name: ${d.display_name.split(",")[0]}`);
          console.log(`  Class: ${d.class}, Type: ${d.type}`);
          const isIncluded = d.type === "city" || d.type === "administrative" || d.class === "place";
          console.log(`  Passes Strict Filter? ${isIncluded ? '✅ YES' : '❌ NO'}`);
        }
      }
    } catch (err) {
      console.error(`  Error searching for "${place}": ${err.message}`);
    }
    await sleep(1000); // 1 second delay between requests
  }
}

runTests();
