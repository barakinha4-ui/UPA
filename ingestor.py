"""
ingestor.py — UAP Vault
Faz upsert dos documentos processados no Supabase.
Controla duplicatas via official_id, atualiza registros existentes.

Uso:
    python ingestor.py --input processed_documents.json
    python ingestor.py --input processed_documents.json --dry-run
    python ingestor.py --input processed_documents.json --release-id <uuid>

Variáveis de ambiente necessárias:
    SUPABASE_URL              — ex: https://xxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY — chave service_role (não anon!)
"""

import asyncio
import sys
import json
import os
import argparse
from pathlib import Path
from datetime import date
import httpx

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

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def get_headers() -> dict:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise EnvironmentError(
            "❌ Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env"
        )
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",  # upsert por conflict
    }


def sanitize_doc(doc: dict) -> dict:
    """Remove campos None e converte tipos para compatibilidade com Supabase."""
    clean = {}
    for k, v in doc.items():
        if v is None:
            continue
        if isinstance(v, list) and len(v) == 0:
            clean[k] = "{}"  # array vazio no formato Postgres
            continue
        if isinstance(v, list):
            # Arrays string para Postgres: {"tag1","tag2"}
            escaped = [str(i).replace('"', '\\"') for i in v]
            clean[k] = "{" + ",".join(f'"{e}"' for e in escaped) + "}"
            continue
        clean[k] = v
    return clean


async def upsert_documents(
    client: httpx.AsyncClient,
    docs: list[dict],
    release_id: str | None = None,
    dry_run: bool = False,
) -> tuple[int, int]:
    """
    Faz upsert de todos os documentos.
    Retorna (sucesso, falhas).
    """
    success = 0
    failures = 0
    headers = get_headers()

    for i, doc in enumerate(docs):
        slug = doc.get("slug", f"doc-{i}")
        official_id = doc.get("official_id", slug)
        print(f"[{i+1}/{len(docs)}] Upserting {official_id}...")

        if dry_run:
            print(f"  📋 DRY-RUN: {json.dumps(sanitize_doc(doc), ensure_ascii=False)[:120]}...")
            success += 1
            continue

        try:
            clean = sanitize_doc(doc)

            # Upsert principal na tabela documents
            resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/documents",
                headers={**headers, "Prefer": "resolution=merge-duplicates,return=representation"},
                json=clean,
            )
            resp.raise_for_status()
            inserted = resp.json()

            doc_id = inserted[0]["id"] if inserted else None
            print(f"  ✅ id={doc_id}")

            # Vincula ao release se informado
            if doc_id and release_id:
                await client.post(
                    f"{SUPABASE_URL}/rest/v1/document_releases",
                    headers={**headers, "Prefer": "resolution=ignore-duplicates"},
                    json={"document_id": doc_id, "release_id": release_id},
                )

            success += 1

        except httpx.HTTPStatusError as e:
            print(f"  ❌ HTTP {e.response.status_code}: {e.response.text[:300]}")
            failures += 1

        except Exception as e:
            print(f"  ❌ Erro: {e}")
            failures += 1

        # Rate limit gentil com a API do Supabase
        await asyncio.sleep(0.1)

    return success, failures


async def get_release_id(client: httpx.AsyncClient, release_num: int = 1) -> str | None:
    """Busca o UUID do release pelo número."""
    headers = get_headers()
    resp = await client.get(
        f"{SUPABASE_URL}/rest/v1/releases",
        headers=headers,
        params={"release_num": f"eq.{release_num}", "select": "id"},
    )
    data = resp.json()
    return data[0]["id"] if data else None


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="processed_documents.json")
    parser.add_argument("--release-num", type=int, default=1)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ {args.input} não encontrado. Rode ai_processor.py primeiro.")
        return

    docs = json.loads(input_path.read_text())
    print(f"📂 {len(docs)} documentos carregados de {args.input}")

    if args.dry_run:
        print("🔍 Modo DRY-RUN ativo — nada será salvo no Supabase\n")

    async with httpx.AsyncClient() as client:
        release_id = None
        if not args.dry_run:
            release_id = await get_release_id(client, args.release_num)
            if release_id:
                print(f"🔗 Release {args.release_num} encontrado: {release_id}")
            else:
                print(f"⚠️  Release {args.release_num} não encontrado. Execute o schema.sql primeiro.")

        success, failures = await upsert_documents(
            client, docs, release_id=release_id, dry_run=args.dry_run
        )

    print(f"\n{'🔍 DRY-RUN: ' if args.dry_run else ''}✅ Sucesso: {success} | ❌ Falhas: {failures}")


if __name__ == "__main__":
    asyncio.run(main())
