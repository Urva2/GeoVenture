const https = require('https');

https.get('https://nominatim.openstreetmap.org/search?format=json&q=Ahmedabad&limit=1', {
  headers: {
    'User-Agent': 'GeoVenture-Test/1.0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', err => console.log(err));
