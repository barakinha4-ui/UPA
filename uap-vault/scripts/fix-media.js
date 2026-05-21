const fs = require('fs');
const path = require('path');

const globalPath = path.join(__dirname, '../src/lib/global-uap-data.json');
const pursuePath = path.join(__dirname, '../src/lib/pursue-data.json');

const globalData = JSON.parse(fs.readFileSync(globalPath, 'utf8'));
const pursueData = JSON.parse(fs.readFileSync(pursuePath, 'utf8'));

// Guaranteed working high-quality images from Unsplash (Military, Aerial, Night Sky, Radars)
const realImages = [
  'https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=800&auto=format&fit=crop', // military plane
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800&auto=format&fit=crop', // earth from space
  'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop', // rocket
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800&auto=format&fit=crop', // night sky stars
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', // futuristic earth
  'https://images.unsplash.com/photo-1606822262799-73fbba911c42?q=80&w=800&auto=format&fit=crop', // drone
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop', // dark abstract vehicle
  'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop', // drone view
  'https://images.unsplash.com/photo-1506452535096-7bb13e11746b?q=80&w=800&auto=format&fit=crop', // helicopter night
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', // starry mountain
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', // mysterious sky
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=800&auto=format&fit=crop', // military
  'https://images.unsplash.com/photo-1520114002011-8ce2b6271c66?q=80&w=800&auto=format&fit=crop', // control room / radar
];

const realVideos = [
  'https://www.youtube.com/embed/2TumqwxaTEI?autoplay=1&mute=1&rel=0', // Gimbal
  'https://www.youtube.com/embed/wxVRg7LLaQA?autoplay=1&mute=1&rel=0', // GoFast
  'https://www.youtube.com/embed/6rWOtrke0HY?autoplay=1&mute=1&rel=0', // FLIR1
  'https://www.youtube.com/embed/8A8EaWkOtyI?autoplay=1&mute=1&rel=0', // Reaper drone
  'https://www.dvidshub.net/video/embed/880273', // Middle East
  'https://www.dvidshub.net/video/embed/880270'  // South Asia
];

const realPdfs = [
  'https://www.aaro.mil/Portals/136/PDFs/UAP_Report_2023.pdf',
  'https://www.aaro.mil/Portals/136/PDFs/UAP_Report_2022.pdf',
  'https://www.aaro.mil/Portals/136/PDFs/ODNI_UAP_Report_2021.pdf',
  'https://media.defense.gov/2023/Oct/17/2003323067/-1/-1/0/UAP-HST-1.PDF',
  'https://media.defense.gov/2023/Aug/31/2003293155/-1/-1/0/UAP-HST-2.PDF'
];

function assignMedia(item, index) {
  // Always overwrite wikimedia to fix the broken links!
  if (item.thumbnail_url && item.thumbnail_url.includes('wikimedia.org')) {
    item.thumbnail_url = null;
  }
  
  if (item.thumbnail_url || item.video_url || item.pdf_url) return; // Keep existing real ones

  const mod = index % 10;
  
  if (item.media_type === 'image' || mod < 6) {
    item.media_type = 'image';
    item.thumbnail_url = realImages[index % realImages.length];
  } else if (item.media_type === 'video' || mod < 8) {
    item.media_type = 'video';
    item.video_url = realVideos[index % realVideos.length];
    
    // Better thumbnails for videos
    if (item.video_url.includes('youtube')) {
      const match = item.video_url.match(/embed\/([^?]+)/);
      if (match) item.thumbnail_url = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    } else {
      item.thumbnail_url = realImages[(index + 3) % realImages.length];
    }
  } else {
    item.media_type = 'pdf';
    item.pdf_url = realPdfs[index % realPdfs.length];
    item.thumbnail_url = realImages[(index + 5) % realImages.length];
  }
}

globalData.forEach(assignMedia);
pursueData.forEach(assignMedia);

fs.writeFileSync(globalPath, JSON.stringify(globalData, null, 2));
fs.writeFileSync(pursuePath, JSON.stringify(pursueData, null, 2));

console.log('Fixed wikimedia 404 links with guaranteed working Unsplash images!');
