-- ============================================================
-- UAP Vault — Schema Supabase
-- Execute no Supabase SQL Editor
-- ============================================================

-- Habilita extensão de busca full-text com suporte a português
create extension if not exists unaccent;

-- Enum de agências fonte
create type uap_agency as enum (
  'DOW', 'FBI', 'NASA', 'STATE', 'CIA', 'ODNI', 'DOE', 'OTHER'
);

-- Enum de tipo de mídia
create type uap_media_type as enum (
  'video', 'pdf', 'image', 'document', 'mixed'
);

-- Enum de classificação do incidente
create type uap_classification as enum (
  'unresolved', 'resolved_natural', 'resolved_manmade', 'unknown'
);

-- ============================================================
-- Tabela principal de documentos
-- ============================================================
create table if not exists documents (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,

  -- Identificador oficial do Pentágono (ex: DOW-UAP-PR34)
  official_id     text,

  -- Títulos bilíngues
  title_en        text not null,
  title_pt        text not null,

  -- Resumos gerados por IA
  summary_en      text,
  summary_pt      text,

  -- Análise estruturada por IA
  analysis_en     text,
  analysis_pt     text,

  -- Metadados do incidente
  agency          uap_agency not null default 'OTHER',
  media_type      uap_media_type not null default 'document',
  classification  uap_classification not null default 'unresolved',

  -- Datas
  incident_date   text,           -- pode ser parcial: "October 2023"
  incident_year   int,
  release_date    date,

  -- Localização
  location_name   text,           -- ex: "Greece", "Western United States"
  location_region text,           -- ex: "Mediterranean", "Middle East"
  lat             double precision,
  lng             double precision,

  -- URLs dos assets originais
  original_url    text,           -- URL do arquivo no war.gov
  thumbnail_url   text,           -- imagem do slideshow
  pdf_url         text,
  video_url       text,

  -- Tags para filtro
  tags            text[] default '{}',

  -- SEO
  meta_description_pt text,
  meta_description_en text,

  -- Controle
  is_published    boolean default true,
  view_count      bigint default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- Tabela de lotes de release
-- ============================================================
create table if not exists releases (
  id           uuid primary key default gen_random_uuid(),
  release_num  int not null,        -- 1, 2, 3...
  title        text not null,
  released_at  date not null,
  source_url   text,
  doc_count    int default 0,
  created_at   timestamptz default now()
);

-- Relacionamento documento <-> release
create table if not exists document_releases (
  document_id  uuid references documents(id) on delete cascade,
  release_id   uuid references releases(id) on delete cascade,
  primary key (document_id, release_id)
);

-- ============================================================
-- Índices para performance
-- ============================================================

-- Full-text search em PT
create index if not exists documents_fts_pt on documents
  using gin(to_tsvector('portuguese', coalesce(title_pt,'') || ' ' || coalesce(summary_pt,'') || ' ' || coalesce(location_name,'')));

-- Full-text search em EN
create index if not exists documents_fts_en on documents
  using gin(to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(summary_en,'') || ' ' || coalesce(location_name,'')));

-- Filtros comuns
create index if not exists documents_agency_idx       on documents(agency);
create index if not exists documents_media_type_idx   on documents(media_type);
create index if not exists documents_incident_year_idx on documents(incident_year);
create index if not exists documents_release_date_idx  on documents(release_date);
create index if not exists documents_tags_idx          on documents using gin(tags);
create index if not exists documents_published_idx     on documents(is_published);

-- ============================================================
-- Função de busca full-text bilíngue
-- ============================================================
create or replace function search_documents(
  query text,
  lang text default 'pt',
  limit_n int default 20,
  offset_n int default 0
)
returns setof documents
language sql stable as $$
  select * from documents
  where is_published = true
    and (
      case when lang = 'pt' then
        to_tsvector('portuguese', coalesce(title_pt,'') || ' ' || coalesce(summary_pt,'') || ' ' || coalesce(location_name,''))
        @@ plainto_tsquery('portuguese', query)
      else
        to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(summary_en,'') || ' ' || coalesce(location_name,''))
        @@ plainto_tsquery('english', query)
      end
    )
  order by release_date desc, created_at desc
  limit limit_n
  offset offset_n;
$$;

-- ============================================================
-- Trigger: atualiza updated_at automaticamente
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger documents_updated_at
  before update on documents
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table documents enable row level security;
alter table releases enable row level security;
alter table document_releases enable row level security;

-- Leitura pública
create policy "Public read documents"
  on documents for select using (is_published = true);

create policy "Public read releases"
  on releases for select using (true);

create policy "Public read document_releases"
  on document_releases for select using (true);

-- Escrita apenas com service role (backend)
create policy "Service role full access documents"
  on documents for all using (auth.role() = 'service_role');

create policy "Service role full access releases"
  on releases for all using (auth.role() = 'service_role');

create policy "Service role full access document_releases"
  on document_releases for all using (auth.role() = 'service_role');

-- ============================================================
-- Seed: Release 01 (May 8, 2026)
-- ============================================================
insert into releases (release_num, title, released_at, source_url, doc_count)
values (
  1,
  'PURSUE Release 01 — Historic UAP Declassification',
  '2026-05-08',
  'https://www.war.gov/News/Releases/Release/Article/4480582/',
  162
)
on conflict do nothing;
