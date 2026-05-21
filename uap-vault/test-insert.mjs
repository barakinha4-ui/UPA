import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://idhtqfvzdmzsenahxdva.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaHRxZnZ6ZG16c2VuYWh4ZHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMTU0NzMsImV4cCI6MjA5NDg5MTQ3M30.dBTv0lDzvFTxId9tONzOIGfkAieFy-8SmSVwhgQYupM'
);

async function testInsert() {
  const { data, error } = await supabase
    .from('documents')
    .insert([
      {
        slug: 'test-doc-pursue',
        official_id: 'PURSUE-TEST',
        title_en: 'Test',
        title_pt: 'Teste',
        agency: 'FBI',
        media_type: 'document',
        classification: 'unknown',
        is_published: true,
        view_count: 0
      }
    ])
    .select();

  if (error) {
    console.error('Erro de inserção:', error.message);
  } else {
    console.log('Inserção bem-sucedida:', data);
    
    // Clean up
    await supabase.from('documents').delete().eq('slug', 'test-doc-pursue');
  }
}

testInsert();
