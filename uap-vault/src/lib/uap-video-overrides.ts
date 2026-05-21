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
  // Officially released by the Pentagon on April 27, 2020
  // Rotating object moving against a 120-knot wind — "a whole fleet of them"
  'DOW-UAP-PR19': 'https://www.youtube.com/embed/tf5sT97Abls?autoplay=1&mute=1&rel=0',

  // GOFAST (January 2015, USS Theodore Roosevelt, East Coast)
  // Officially released by the Pentagon on April 27, 2020
  // Object skimming ocean surface at extraordinarily high speed
  'DOW-UAP-PR43': 'https://www.youtube.com/embed/6s20Zh7GlmA?autoplay=1&mute=1&rel=0',

  // FLIR1 / "Tic-Tac" (November 2004, USS Nimitz, Pacific Ocean)
  // Officially released by the Pentagon on April 27, 2020
  // Oblong white object with no visible propulsion or wings
  'DOW-UAP-PR38': 'https://www.youtube.com/embed/eqxS0XCQEBU?autoplay=1&mute=1&rel=0',

  // Pyramid UAP / USS Russell (July 2019, Pacific Ocean off San Diego)
  // Officially acknowledged by Department of Defense, 2021
  // Triangular objects tracked by Navy destroyer
  'DOW-UAP-PR26': 'https://www.youtube.com/embed/et9-uw0ThGU?autoplay=1&mute=1&rel=0',
};

/**
 * Returns the best available video URL for a document:
 * - First checks the override map (known-good real UAP videos)
 * - Falls back to the database value if no override exists
 */
export function getVideoUrl(officialId: string, dbVideoUrl: string | null | undefined): string | null {
  return UAP_VIDEO_OVERRIDES[officialId] ?? dbVideoUrl ?? null;
}
