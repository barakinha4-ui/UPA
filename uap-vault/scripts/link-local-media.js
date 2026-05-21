const fs = require('fs');
const path = require('path');

const globalPath = path.join(__dirname, '../src/lib/global-uap-data.json');
const pursuePath = path.join(__dirname, '../src/lib/pursue-data.json');

const globalData = JSON.parse(fs.readFileSync(globalPath, 'utf8'));
const pursueData = JSON.parse(fs.readFileSync(pursuePath, 'utf8'));

// Get all MP4s
const mediaDir = path.join(__dirname, '../public/media');
const releaseDir = path.join(__dirname, '../public/release/Release_1');

let mp4Files = [];
if (fs.existsSync(mediaDir)) {
  mp4Files = fs.readdirSync(mediaDir)
    .filter(f => f.endsWith('.mp4'))
    .map(f => '/media/' + f);
}

let pdfFiles = [];
let imgFiles = [];

if (fs.existsSync(releaseDir)) {
  const allRelease = fs.readdirSync(releaseDir);
  pdfFiles = allRelease.filter(f => f.toLowerCase().endsWith('.pdf')).map(f => '/release/Release_1/' + f);
  imgFiles = allRelease.filter(f => f.toLowerCase().match(/\.(jpg|jpeg|png)$/)).map(f => '/release/Release_1/' + f);
}

const allItems = [...pursueData, ...globalData];

let vIndex = 0;
let pIndex = 0;
let iIndex = 0;

allItems.forEach((item, index) => {
  // If we have local MP4s, assign some
  if (item.media_type === 'video' && mp4Files.length > 0) {
    item.video_url = mp4Files[vIndex % mp4Files.length];
    vIndex++;
  } else if (item.media_type === 'pdf' && pdfFiles.length > 0) {
    item.pdf_url = pdfFiles[pIndex % pdfFiles.length];
    pIndex++;
  } else if (item.media_type === 'image' && imgFiles.length > 0) {
    // Only overwrite image if we have enough local images, else keep Unsplash
    if (iIndex < imgFiles.length * 3) { 
      item.thumbnail_url = imgFiles[iIndex % imgFiles.length];
      iIndex++;
    }
  }
});

fs.writeFileSync(globalPath, JSON.stringify(globalData, null, 2));
fs.writeFileSync(pursuePath, JSON.stringify(pursueData, null, 2));

console.log(`Mapped ${mp4Files.length} videos, ${pdfFiles.length} PDFs, and ${imgFiles.length} Images to local files!`);
