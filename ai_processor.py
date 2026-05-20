"""
ai_processor.py — UAP Vault
Processa cada documento com Claude API:
- Gera título PT e EN
- Gera resumo PT e EN (2-3 parágrafos)
- Gera análise estruturada PT e EN
- Extrai tags, coordenadas inferidas e meta description
- Gera slug SEO-friendly

Uso:
    python ai_processor.py --input raw_documents.json --output processed.json
    python ai_processor.py --input raw_documents.json --limit 5  # testa com 5
"""

import asyncio
import sys
import json
import re
import argparse
import os
import httpx
from pathlib import Path
from slugify import slugify

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Carrega arquivo .env se existir
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.strip() and not line.strip().startswith("#"):
            if "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-20250514"

SYSTEM_PROMPT = """Você é um analista especialista em fenômenos aéreos não identificados (UAP/OVNI).
Seu trabalho é processar documentos oficiais desclassificados do governo americano e gerar conteúdo
bilíngue (PT-BR e EN) claro, preciso e factual para um portal público de informação.

REGRAS ABSOLUTAS:
- Nunca invente fatos. Use apenas o que foi fornecido.
- Mantenha tom jornalístico, neutro e factual.
- Não faça afirmações sobre origem extraterrestre.
- PT-BR deve soar natural para um brasileiro, não traduções literais.
- EN deve soar natural para um americano.
- Sempre retorne JSON válido, sem markdown ou ```json.
"""

def build_user_prompt(doc: dict) -> str:
    return f"""Processe este documento UAP oficial e retorne um JSON com os campos abaixo.

DADOS DO DOCUMENTO:
- ID oficial: {doc.get('official_id', 'N/A')}
- Título EN atual: {doc.get('title_en', 'N/A')}
- Agência: {doc.get('agency', 'N/A')}
- Tipo de mídia: {doc.get('media_type', 'N/A')}
- Data do incidente: {doc.get('incident_date', 'N/A')}
- Localização: {doc.get('location_name', 'N/A')} / {doc.get('location_region', 'N/A')}
- URL original: {doc.get('original_url', 'N/A')}
- URL thumbnail: {doc.get('thumbnail_url', 'N/A')}

RETORNE APENAS este JSON (sem markdown, sem ```, sem comentários):
{{
  "title_en": "Título em inglês claro e descritivo (máx 80 chars)",
  "title_pt": "Título em português brasileiro (máx 80 chars)",
  "summary_en": "Resumo factual em inglês (2-3 parágrafos, ~150 palavras)",
  "summary_pt": "Resumo factual em PT-BR (2-3 parágrafos, ~150 palavras)",
  "analysis_en": "O que torna este caso notável? Contexto técnico e histórico. (~100 palavras)",
  "analysis_pt": "O que torna este caso notável? Contexto técnico e histórico. (~100 palavras)",
  "meta_description_en": "Meta description para SEO, 155 chars max",
  "meta_description_pt": "Meta description SEO em PT-BR, 155 chars max",
  "tags": ["lista", "de", "tags", "relevantes", "máximo 8"],
  "lat": null_ou_numero_decimal,
  "lng": null_ou_numero_decimal,
  "slug_hint": "sugestão de slug url-friendly baseado no ID oficial e localização"
}}"""


async def call_claude(client: httpx.AsyncClient, doc: dict) -> dict:
    """Chama Claude API para processar um documento."""
    payload = {
        "model": MODEL,
        "max_tokens": 1500,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": build_user_prompt(doc)}],
    }

    resp = await client.post(CLAUDE_API_URL, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    raw_text = data["content"][0]["text"].strip()

    # Remove markdown se vier
    raw_text = re.sub(r"^```json\s*", "", raw_text)
    raw_text = re.sub(r"\s*```$", "", raw_text)

    return json.loads(raw_text)


def merge_doc(original: dict, ai_result: dict) -> dict:
    """Mescla dados originais com resultado da IA."""
    slug_base = ai_result.get("slug_hint") or original.get("official_id", "uap-document")
    slug = slugify(slug_base, max_length=80, word_boundary=True)

    # Garante unicidade com sufixo do ID se necessário
    if original.get("official_id"):
        official_slug = slugify(original["official_id"], max_length=40)
        if official_slug not in slug:
            slug = f"{slug}-{official_slug}"

    return {
        # Dados originais
        "official_id": original.get("official_id"),
        "agency": original.get("agency", "OTHER"),
        "media_type": original.get("media_type", "document"),
        "classification": original.get("classification", "unresolved"),
        "incident_date": original.get("incident_date"),
        "incident_year": original.get("incident_year"),
        "release_date": original.get("release_date"),
        "location_name": original.get("location_name"),
        "location_region": original.get("location_region"),
        "original_url": original.get("original_url"),
        "thumbnail_url": original.get("thumbnail_url"),
        "pdf_url": original.get("pdf_url"),
        "video_url": original.get("video_url"),

        # Dados enriquecidos pela IA
        "slug": slug,
        "title_en": ai_result.get("title_en") or original.get("title_en", ""),
        "title_pt": ai_result.get("title_pt", ""),
        "summary_en": ai_result.get("summary_en", ""),
        "summary_pt": ai_result.get("summary_pt", ""),
        "analysis_en": ai_result.get("analysis_en", ""),
        "analysis_pt": ai_result.get("analysis_pt", ""),
        "meta_description_en": ai_result.get("meta_description_en", ""),
        "meta_description_pt": ai_result.get("meta_description_pt", ""),
        "tags": ai_result.get("tags", []),
        "lat": ai_result.get("lat") or original.get("lat"),
        "lng": ai_result.get("lng") or original.get("lng"),
        "is_published": True,
    }


async def process_all(docs: list[dict], limit: int | None = None) -> list[dict]:
    processed = []
    failed = []
    to_process = docs[:limit] if limit else docs

    # Usa variável de ambiente ANTHROPIC_API_KEY do .env para autenticação
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    headers = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": api_key,
    }

    async with httpx.AsyncClient(headers=headers) as client:
        for i, doc in enumerate(to_process):
            official_id = doc.get("official_id", f"doc-{i}")
            print(f"[{i+1}/{len(to_process)}] Processando {official_id}...")

            try:
                ai_result = await call_claude(client, doc)
                merged = merge_doc(doc, ai_result)
                processed.append(merged)
                print(f"  ✅ {merged['slug']}")

                # Rate limiting gentil
                await asyncio.sleep(0.5)

            except json.JSONDecodeError as e:
                print(f"  ❌ JSON inválido da IA: {e}")
                failed.append(official_id)
                # Adiciona sem enriquecimento IA
                processed.append(merge_doc(doc, {}))

            except httpx.HTTPStatusError as e:
                print(f"  ❌ HTTP {e.response.status_code}: {e.response.text[:200]}")
                failed.append(official_id)
                await asyncio.sleep(5)  # Back-off em rate limit

            except Exception as e:
                print(f"  ❌ Erro inesperado: {e}")
                failed.append(official_id)

    print(f"\n✅ Processados: {len(processed)} | ❌ Falhas: {len(failed)}")
    if failed:
        print(f"Falhas: {failed}")

    return processed


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="raw_documents.json")
    parser.add_argument("--output", default="processed_documents.json")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ Arquivo {args.input} não encontrado. Rode scraper.py primeiro.")
        return

    docs = json.loads(input_path.read_text())
    print(f"📂 Carregados {len(docs)} documentos de {args.input}")

    processed = await process_all(docs, limit=args.limit)

    out = Path(args.output)
    out.write_text(json.dumps(processed, indent=2, ensure_ascii=False))
    print(f"💾 Salvo em {out}")


if __name__ == "__main__":
    asyncio.run(main())
