const https = require('https');
https.get('https://upload.wikimedia.org/wikipedia/commons/1/14/Treasure_Island_UFO.jpg', (res) => console.log(res.statusCode));
