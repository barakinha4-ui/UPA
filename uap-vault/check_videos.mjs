import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://idhtqfvzdmzsenahxdva.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaHRxZnZ6ZG16c2VuYWh4ZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTU0NzMsImV4cCI6MjA5NDg5MTQ3M30.dBTv0lDzvFTxId9tONzOIGfkAieFy-8SmSVwhgQYupM'
);

const { data, error } = await supabase
  .from('documents')
  .select('official_id, media_type, video_url, thumbnail_url')
  .eq('media_type', 'video');

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Documentos com media_type=video:');
  console.log(JSON.stringify(data, null, 2));
}
