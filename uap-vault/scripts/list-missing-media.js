const global = require('../src/lib/global-uap-data.json');
const pursue = require('../src/lib/pursue-data.json');

const all = [...global, ...pursue];

const missing = all.filter(x => !x.thumbnail_url && !x.video_url && !x.pdf_url);

console.log(`Total sem mídia: ${missing.length} / ${all.length}\n`);
console.log('official_id | media_type | título');
console.log('---');
missing.forEach(x => {
  console.log(`${x.official_id} | ${x.media_type} | ${x.title_pt}`);
});
