/**
 * Real UAP video overrides mapped by official_id.
 *
 * These are genuine, publicly declassified UAP/UFO videos from the U.S. Department
 * of Defense and the Naval Air Systems Command (NAVAIR) FOIA Reading Room,
 * widely published by major news organizations (NYT, CBS, CNBC).
 *
 * They override any broken/placeholder video_url values stored in the database.
 */

export const UAP_VIDEO_OVERRIDES: Record<string, string> = {
  // GIMBAL (January 2015, USS Theodore Roosevelt, East Coast)
  'DOW-UAP-PR19': 'https://www.youtube.com/embed/tf5sT97Abls?autoplay=1&mute=1&rel=0',
  // GOFAST (January 2015, USS Theodore Roosevelt, East Coast)
  'DOW-UAP-PR43': 'https://www.youtube.com/embed/6s20Zh7GlmA?autoplay=1&mute=1&rel=0',
  // FLIR1 / "Tic-Tac" (November 2004, USS Nimitz, Pacific Ocean)
  'DOW-UAP-PR38': 'https://www.youtube.com/embed/eqxS0XCQEBU?autoplay=1&mute=1&rel=0',
  // Pyramid UAP / USS Russell (July 2019, Pacific Ocean off San Diego)
  'DOW-UAP-PR26': 'https://www.youtube.com/embed/et9-uw0ThGU?autoplay=1&mute=1&rel=0',
};

/**
 * Detects if a URL is a fake/procedurally-generated placeholder.
 * Fake DVIDS URLs: https://www.dvidshub.net/video/100000/uap  (sequential IDs ending in /uap)
 */
function isFakePlaceholder(url: string): boolean {
  if (/dvidshub\.net\/video\/10[0-9]{4}\/uap/.test(url)) return true;
  if (/war\.gov\/.*placeholder/.test(url)) return true;
  return false;
}

/**
 * Converts a real DVIDS video page URL to an embed URL.
 * Input:  https://www.dvidshub.net/video/1006056/foo-bar
 * Output: https://www.dvidshub.net/video/embed/1006056
 */
function toDvidsEmbed(url: string): string | null {
  const match = url.match(/dvidshub\.net\/video\/(\d{6,})/);
  if (match) return `https://www.dvidshub.net/video/embed/${match[1]}`;
  return null;
}

/**
 * Returns the best available embed URL for a document:
 * 1. YouTube/Vimeo override map (known-good real UAP videos)
 * 2. Validates DB value — discards fake placeholders
 * 3. Converts real DVIDS page URLs to embed format
 * 4. Returns direct URLs as-is (YouTube, Vimeo, .mp4 from trusted sources)
 */
export function getVideoUrl(officialId: string | null | undefined, dbVideoUrl: string | null | undefined): string | null {
  if (officialId && UAP_VIDEO_OVERRIDES[officialId]) return UAP_VIDEO_OVERRIDES[officialId];
  if (!dbVideoUrl || isFakePlaceholder(dbVideoUrl)) return null;
  if (dbVideoUrl.includes('/embed/')) return dbVideoUrl;
  const dvidsEmbed = toDvidsEmbed(dbVideoUrl);
  if (dvidsEmbed) return dvidsEmbed;
  return dbVideoUrl;
}
