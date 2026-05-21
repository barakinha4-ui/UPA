import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function scrapePURSUE() {
  try {
    const res = await fetch('https://www.war.gov/UFO/');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Attempt to find Next.js data
    const nextData = $('#__NEXT_DATA__').html();
    if (nextData) {
      const parsed = JSON.parse(nextData);
      fs.writeFileSync('scripts/raw-next-data.json', JSON.stringify(parsed, null, 2));
      console.log('Saved raw-next-data.json');
    }
    
    // Look for rows/files
    const documents = [];
    $('[data-file], .file-entry, tr[data-id], tr').each((_, el) => {
      const id = $(el).attr('data-id') || $(el).find('.file-id').text().trim();
      const title = $(el).find('.file-title, td:nth-child(2)').text().trim();
      const agency = $(el).find('.agency, td:nth-child(3)').text().trim();
      const type = $(el).find('.file-type, td:nth-child(4)').text().trim();
      const date = $(el).find('.date, td:nth-child(5)').text().trim();
      const url = $(el).find('a').attr('href');
      
      if (title || id) {
        documents.push({ id, title, agency, type, date, url });
      }
    });
    
    fs.writeFileSync('scripts/raw-documents.json', JSON.stringify(documents, null, 2));
    console.log(`Extraídos ${documents.length} documentos`);
  } catch (error) {
    console.error('Error scraping:', error);
  }
}

// Create directory if not exists
if (!fs.existsSync('scripts')) {
  fs.mkdirSync('scripts');
}

scrapePURSUE();
