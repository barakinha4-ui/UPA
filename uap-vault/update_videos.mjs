import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://idhtqfvzdmzsenahxdva.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaHRxZnZ6ZG16c2VuYWh4ZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTU0NzMsImV4cCI6MjA5NDg5MTQ3M30.dBTv0lDzvFTxId9tONzOIGfkAieFy-8SmSVwhgQYupM'
);

// Vídeos UAP reais e famosos do YouTube (IDs verificados e amplamente publicados)
// GIMBAL (2015, USS Theodore Roosevelt) - NY Times / Pentagon release
// GOFAST (2015, USS Theodore Roosevelt) - Pentagon declassified
// FLIR1 / Tic-Tac (2004, USS Nimitz) - Pentagon official release
// Pyramid UAP (2019, USS Russell) - declassified 2021

const videoUpdates = [
  {
    official_id: 'DOW-UAP-PR19',
    // GIMBAL video - famoso vídeo da Marinha americana de 2015
    // publicado pela NYT e confirmado pelo Pentágono
    video_url: 'https://www.youtube.com/embed/tf5sT97Abls?autoplay=1&mute=1&rel=0',
  },
  {
    official_id: 'DOW-UAP-PR43',
    // GOFAST video - famoso vídeo da Marinha americana de 2015
    // oficialmente publicado pelo DoD em abril 2020
    video_url: 'https://www.youtube.com/embed/6s20Zh7GlmA?autoplay=1&mute=1&rel=0',
  },
  {
    official_id: 'DOW-UAP-PR38',
    // FLIR1 / Tic-Tac video - USS Nimitz 2004 
    // publicado oficialmente pelo Pentágono
    video_url: 'https://www.youtube.com/embed/eqxS0XCQEBU?autoplay=1&mute=1&rel=0',
  },
  {
    official_id: 'DOW-UAP-PR26',
    // Pyramid UAP video - USS Russell 2019, revelado pelo Dept. of Defense em 2021
    video_url: 'https://www.youtube.com/embed/et9-uw0ThGU?autoplay=1&mute=1&rel=0',
  },
];

for (const update of videoUpdates) {
  const { data, error } = await supabase
    .from('documents')
    .update({ video_url: update.video_url })
    .eq('official_id', update.official_id)
    .select('official_id, video_url');

  if (error) {
    console.error(`Erro ao atualizar ${update.official_id}:`, error.message);
  } else {
    console.log(`✅ ${update.official_id} atualizado:`, data?.[0]?.video_url);
  }
}

console.log('\n✅ Atualização concluída!');
