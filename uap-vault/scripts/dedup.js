const fs = require('fs');
const path = require('path');

const globalPath = path.join(__dirname, '../src/lib/global-uap-data.json');

const globalData = JSON.parse(fs.readFileSync(globalPath, 'utf8'));

// We will keep track of seen titles to remove duplicates
const seenTitles = new Set();
const deduplicatedData = [];

for (const doc of globalData) {
  // Strip the "[AGENCY]" prefix if any to really compare the core title
  // Actually, our titles don't have [AGENCY] in the string, it's rendered by the UI!
  // Wait, the UI renders the agency badge separately.
  // We'll just use title_en to deduplicate.
  
  // Also let's clean up generic titles entirely or just keep one of each.
  // The generic titles are "Incident Report - YYYY", "Sensor Data: Anomalous Track in...", etc.
  // We'll just keep the first instance of any exact title.
  
  if (!seenTitles.has(doc.title_en)) {
    seenTitles.add(doc.title_en);
    deduplicatedData.push(doc);
  }
}

fs.writeFileSync(globalPath, JSON.stringify(deduplicatedData, null, 2));

console.log(`Removed ${globalData.length - deduplicatedData.length} duplicates. New total: ${deduplicatedData.length}`);
