# UAP Vault — Pipeline de Ingestão

Scraper + processamento IA + ingestão Supabase para o portal de documentos UAP desclassificados do Pentágono.

## Estrutura

```
uap-pipeline/
├── schema.sql          # Schema Supabase — execute primeiro no SQL Editor
├── scraper.py          # Extrai documentos do war.gov/ufo via Playwright
├── ai_processor.py     # Gera resumos PT+EN via Claude API
├── ingestor.py         # Upsert no Supabase com controle de duplicatas
├── pipeline.py         # Orquestrador completo + cron watcher
├── .env.example        # Template de variáveis de ambiente
└── data/               # JSONs intermediários (criado automaticamente)
```

## Setup

### 1. Instalar dependências

```bash
pip install playwright httpx anthropic supabase python-slugify pdfplumber tqdm
python -m playwright install chromium
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

### 3. Criar schema no Supabase

Acesse o **SQL Editor** do seu projeto Supabase e cole o conteúdo de `schema.sql`.

## Uso

### Pipeline completo (primeira execução)

```bash
# Teste com 3 documentos primeiro
python pipeline.py --full --limit 3 --dry-run

# Produção
python pipeline.py --full
```

### Verificar novos lotes do Pentágono (cron)

```bash
python pipeline.py --check-new
```

### Cron — a cada 6 horas

```cron
0 */6 * * * cd /path/to/uap-pipeline && python pipeline.py --check-new >> logs/pipeline.log 2>&1
```

### Rodar fases individualmente

```bash
# Só scraping
python scraper.py --output data/raw.json

# Só IA (precisa do raw.json)
python ai_processor.py --input data/raw.json --output data/processed.json --limit 5

# Só ingestão (precisa do processed.json)
python ingestor.py --input data/processed.json --dry-run
python ingestor.py --input data/processed.json
```

## Variáveis de ambiente

| Variável                  | Descrição                              |
|---------------------------|----------------------------------------|
| `SUPABASE_URL`            | URL do projeto Supabase                |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (não a anon!)     |
| `ANTHROPIC_API_KEY`       | API key do Claude (para ai_processor) |

## Fonte de dados

- **war.gov/ufo** — Arquivo oficial PURSUE do Pentágono
- **Lotes novos** prometidos a cada poucas semanas
- O scraper usa Playwright porque a tabela é carregada via JavaScript

## Notas técnicas

- O site `war.gov/ufo` renderiza dados via JS — `requests` simples não funciona
- O scraper tem fallback hardcodado com os 17 documentos do slideshow identificados no HTML
- O `ai_processor.py` usa `ANTHROPIC_API_KEY` do ambiente — não hardcode keys
- O `ingestor.py` faz upsert via `slug` como chave — re-rodar é seguro
- Rate limiting suave embutido (0.5s entre chamadas IA, 0.1s entre upserts)
