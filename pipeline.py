#!/usr/bin/env python3
"""
pipeline.py — UAP Vault
Orquestra scraping → IA → Supabase em uma chamada só.
Também detecta novos lotes do Pentágono via polling.

Uso:
    # Pipeline completo (primeira vez)
    python pipeline.py --full

    # Apenas verifica se há novos lotes (para cron)
    python pipeline.py --check-new

    # Testa com 3 documentos
    python pipeline.py --full --limit 3

    # Dry-run completo (sem salvar nada)
    python pipeline.py --full --dry-run

Cron sugerido (a cada 6 horas):
    0 */6 * * * cd /path/to/uap-pipeline && python pipeline.py --check-new >> logs/pipeline.log 2>&1
"""

import asyncio
import json
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

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

# Importa os módulos do pipeline
sys.path.insert(0, str(Path(__file__).parent))
import scraper as scraper_mod
import ai_processor as ai_mod
import ingestor as ingestor_mod

LOGS_DIR = Path("logs")
DATA_DIR = Path("data")


def setup_dirs():
    LOGS_DIR.mkdir(exist_ok=True)
    DATA_DIR.mkdir(exist_ok=True)


def log(msg: str):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}")


async def run_full_pipeline(limit: int | None = None, dry_run: bool = False):
    """Pipeline completo: scrape → IA → Supabase."""
    setup_dirs()
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    # ── Fase 1: Scraping ──────────────────────────────────────────────
    log("🕷️  Iniciando scraping do war.gov/ufo...")
    raw_docs = await scraper_mod.scrape_war_gov()
    log(f"📋 {len(raw_docs)} documentos extraídos")

    raw_path = DATA_DIR / f"raw_{ts}.json"
    raw_path.write_text(json.dumps(raw_docs, indent=2, ensure_ascii=False))
    log(f"💾 Raw salvo em {raw_path}")

    # ── Fase 2: Processamento com IA ────────────────────────────────
    log("🤖 Processando com Claude API...")
    processed = await ai_mod.process_all(raw_docs, limit=limit)
    log(f"✅ {len(processed)} documentos processados")

    processed_path = DATA_DIR / f"processed_{ts}.json"
    processed_path.write_text(json.dumps(processed, indent=2, ensure_ascii=False))
    log(f"💾 Processado salvo em {processed_path}")

    if dry_run:
        log("🔍 DRY-RUN: pulando ingestão no Supabase")
        log(f"\nAmostra do primeiro documento:\n{json.dumps(processed[0], indent=2, ensure_ascii=False)[:800]}")
        return

    # ── Fase 3: Ingestão no Supabase ────────────────────────────────
    log("📤 Iniciando ingestão no Supabase...")
    import httpx
    async with httpx.AsyncClient() as client:
        release_id = await ingestor_mod.get_release_id(client, release_num=1)
        success, failures = await ingestor_mod.upsert_documents(
            client, processed, release_id=release_id
        )

    log(f"🏁 Pipeline concluído: {success} sucesso, {failures} falhas")


async def check_new_releases():
    """
    Verifica se o Pentágono publicou novos lotes desde o último check.
    Compara contagem de documentos na página com o que está no Supabase.
    """
    log("🔍 Verificando novos lotes em war.gov/ufo...")

    # Estado anterior
    state_file = DATA_DIR / "last_state.json"
    last_state = {}
    if state_file.exists():
        last_state = json.loads(state_file.read_text())

    # Scraping rápido para contar documentos
    raw_docs = await scraper_mod.scrape_war_gov()
    current_count = len(raw_docs)
    last_count = last_state.get("doc_count", 0)

    log(f"📊 Documentos: antes={last_count} | agora={current_count}")

    if current_count > last_count:
        new_count = current_count - last_count
        log(f"🚨 NOVOS DOCUMENTOS DETECTADOS: +{new_count}!")

        # Salva novo estado
        state_file.write_text(json.dumps({
            "doc_count": current_count,
            "last_check": datetime.now().isoformat(),
        }))

        # Roda pipeline apenas com documentos novos (os últimos da lista)
        new_docs = raw_docs[last_count:]
        log(f"🤖 Processando {len(new_docs)} novos documentos...")
        processed = await ai_mod.process_all(new_docs)

        import httpx
        async with httpx.AsyncClient() as client:
            release_id = await ingestor_mod.get_release_id(client, release_num=1)
            success, failures = await ingestor_mod.upsert_documents(
                client, processed, release_id=release_id
            )

        log(f"✅ {success} novos documentos ingeridos")
    else:
        log("✅ Nenhum documento novo detectado")
        state_file.write_text(json.dumps({
            "doc_count": current_count,
            "last_check": datetime.now().isoformat(),
        }))


async def main():
    parser = argparse.ArgumentParser(description="UAP Vault Pipeline")
    parser.add_argument("--full", action="store_true", help="Pipeline completo")
    parser.add_argument("--check-new", action="store_true", help="Verifica novos lotes")
    parser.add_argument("--limit", type=int, default=None, help="Limita número de docs")
    parser.add_argument("--dry-run", action="store_true", help="Não salva no Supabase")
    args = parser.parse_args()

    if args.full:
        await run_full_pipeline(limit=args.limit, dry_run=args.dry_run)
    elif args.check_new:
        await check_new_releases()
    else:
        parser.print_help()


if __name__ == "__main__":
    asyncio.run(main())
