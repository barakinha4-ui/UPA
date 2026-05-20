"""
scraper.py — UAP Vault
Extrai documentos da tabela dinâmica de war.gov/ufo usando Playwright.
O site carrega dados via JavaScript, então requests simples não funcionam.

Uso:
    python scraper.py                    # scraping completo
    python scraper.py --dry-run          # apenas imprime o que encontrou
    python scraper.py --output raw.json  # salva JSON sem processar
"""

import asyncio
import sys
import json
import re
import argparse
from datetime import date
from pathlib import Path
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# URLs conhecidas de imagens do slideshow (extraídas da análise do HTML)
# Servem como seed caso a tabela JS não carregue
SLIDESHOW_IMAGES = [
    {
        "official_id": "FBI-Photo-1",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/FBI-Photo-1.jpg",
        "agency": "FBI",
        "location_name": "Western United States",
        "incident_date": "December 2025",
        "incident_year": 2025,
        "media_type": "image",
        "title_en": "FBI Infrared Photo — Unidentified Object, Western US, Dec 2025",
    },
    {
        "official_id": "FBI-Photo-A5",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/FBI-Photo-A5.jpg",
        "agency": "FBI",
        "location_name": "Western United States",
        "incident_date": "December 2025",
        "incident_year": 2025,
        "media_type": "image",
        "title_en": "FBI Infrared Photo A5 — Unidentified Object, Western US, Dec 2025",
    },
    {
        "official_id": "FBI-Photo-B2",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/FBI-Photo-B2.jpg",
        "agency": "FBI",
        "location_name": "Western United States",
        "incident_date": "September 2025",
        "incident_year": 2025,
        "media_type": "image",
        "title_en": "FBI Infrared Photo B2 — Unidentified Object, Western US, Sep 2025",
    },
    {
        "official_id": "FBI-Photo-B7",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/FBI-Photo-B7-.jpg",
        "agency": "FBI",
        "location_name": "Western United States",
        "incident_date": "September 2025",
        "incident_year": 2025,
        "media_type": "image",
        "title_en": "FBI Infrared Photo B7 — UAP Below Helicopter, Western US, Sep 2025",
    },
    {
        "official_id": "FBI-Photo-B18",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/FBI-Photo-B18.jpg",
        "agency": "FBI",
        "location_name": "Western United States",
        "incident_date": "September 2025",
        "incident_year": 2025,
        "media_type": "image",
        "title_en": "FBI Infrared Photo B18 — Multiple Unidentified Objects, Western US, Sep 2025",
    },
    {
        "official_id": "FBI-Photo-B20",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/FBI-Photo-B20.jpg",
        "agency": "FBI",
        "location_name": "Western United States",
        "incident_date": "September 2025",
        "incident_year": 2025,
        "media_type": "image",
        "title_en": "FBI Infrared Photo B20 — Multiple Unidentified Objects, Western US, Sep 2025",
    },
    {
        "official_id": "Composite-Sketch-2023",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/2024-04-30-Composite-Sketch.jpg",
        "agency": "DOW",
        "location_name": "Southeastern United States",
        "incident_date": "September 2023",
        "incident_year": 2023,
        "media_type": "image",
        "title_en": "Composite Sketch — Anomalous Sighting, Southeastern US, Sep 2023",
    },
    {
        "official_id": "NASA-UAP-VM6",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/NASA-UAP-VM6-Apollo-17-1972.jpg",
        "agency": "NASA",
        "location_name": "Moon — Apollo 17 Mission",
        "incident_date": "1972",
        "incident_year": 1972,
        "media_type": "image",
        "title_en": "NASA Apollo 17 — Three Lights Above Lunar Terrain (1972)",
        "lat": None, "lng": None,
    },
    {
        "official_id": "DOW-UAP-PR19",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR19-Unresolved-UAP-Report-Middle-East-May-2022.jpg",
        "agency": "DOW",
        "location_name": "Iraq",
        "location_region": "Middle East",
        "incident_date": "May 2022",
        "incident_year": 2022,
        "media_type": "video",
        "title_en": "DOW-UAP-PR19 — Unresolved UAP Report, Middle East, May 2022",
        "lat": 33.2232, "lng": 43.6793,
    },
    {
        "official_id": "DOW-UAP-PR26",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR26-Unresolved-UAP-Report-United-Arab-Emirates-October-2023.jpg",
        "agency": "DOW",
        "location_name": "United Arab Emirates",
        "location_region": "Middle East",
        "incident_date": "October 2023",
        "incident_year": 2023,
        "media_type": "video",
        "title_en": "DOW-UAP-PR26 — Inverted Teardrop UAP, UAE, October 2023",
        "lat": 23.4241, "lng": 53.8478,
    },
    {
        "official_id": "DOW-UAP-PR34",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR34-Unresolved-UAP-Report-Greece-October-2023.jpg",
        "agency": "DOW",
        "location_name": "Aegean Sea, Greece",
        "location_region": "Mediterranean",
        "incident_date": "October 2023",
        "incident_year": 2023,
        "media_type": "video",
        "title_en": "DOW-UAP-PR34 — UAP Report, Greece / Aegean Sea, October 2023",
        "lat": 37.9838, "lng": 23.7275,
    },
    {
        "official_id": "DOW-UAP-PR35",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR35-Unresolved-UAP-Report-Greece-October-2023.jpg",
        "agency": "DOW",
        "location_name": "Greece",
        "location_region": "Mediterranean",
        "incident_date": "October 2023",
        "incident_year": 2023,
        "media_type": "video",
        "title_en": "DOW-UAP-PR35 — UAP Flying Toward Land, Greece, October 2023",
        "lat": 37.9838, "lng": 23.7275,
    },
    {
        "official_id": "DOW-UAP-PR38",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR38-Unresolved-UAP-Report-Middle-East-2013.jpg",
        "agency": "DOW",
        "location_name": "Middle East",
        "location_region": "Middle East",
        "incident_date": "2013",
        "incident_year": 2013,
        "media_type": "video",
        "title_en": "DOW-UAP-PR38 — Eight-Pointed UAP via Infrared Sensor, Middle East, 2013",
    },
    {
        "official_id": "DOW-UAP-PR43",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR43-Unresolved-UAP-Report-Africa-2025.jpg",
        "agency": "DOW",
        "location_name": "Africa",
        "location_region": "Africa",
        "incident_date": "2025",
        "incident_year": 2025,
        "media_type": "video",
        "title_en": "DOW-UAP-PR43 — UAP in African Airspace, 2025",
    },
    {
        "official_id": "DOW-UAP-PR45",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR45-Unresolved-UAP-Report-Middle-East-2020.jpg",
        "agency": "DOW",
        "location_name": "Southern United States",
        "location_region": "North America",
        "incident_date": "2020",
        "incident_year": 2020,
        "media_type": "video",
        "title_en": "DOW-UAP-PR45 — U.S. Air Force UAP Report, Southern US, 2020",
    },
    {
        "official_id": "DOW-UAP-PR46",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR46-Unresolved-UAP-Report-INDOPACOM-2024.jpg",
        "agency": "DOW",
        "location_name": "Japan",
        "location_region": "Indo-Pacific",
        "incident_date": "2024",
        "incident_year": 2024,
        "media_type": "video",
        "title_en": "DOW-UAP-PR46 — Football-Shaped UAP, Indo-Pacific Command, Near Japan, 2024",
        "lat": 36.2048, "lng": 138.2529,
    },
    {
        "official_id": "DOW-UAP-PR49",
        "thumbnail_url": "https://www.war.gov/portals/1/Interactive/2026/UFO/Slideshow/DOW-UAP-PR49-Unresolved-UAP-Report-Department-of-the-Army-2026.jpg",
        "agency": "DOW",
        "location_name": "North America",
        "location_region": "North America",
        "incident_date": "2026",
        "incident_year": 2026,
        "media_type": "video",
        "title_en": "DOW-UAP-PR49 — U.S. Army UAP Report, North America, 2026",
    },
]


async def scrape_war_gov() -> list[dict]:
    """
    Tenta extrair a tabela dinâmica do war.gov/ufo via Playwright.
    A tabela tem colunas: Agency, Release Date, Incident Date, Incident Location, Type.
    Se falhar, usa o fallback de slideshow hardcodado.
    """
    results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("🌐 Acessando war.gov/ufo...")
        try:
            await page.goto("https://www.war.gov/ufo/", timeout=30000)
            # Aguarda tabela carregar (seletor baseado no HTML observado)
            await page.wait_for_selector("table", timeout=15000)

            rows = await page.query_selector_all("table tbody tr")
            print(f"✅ Tabela encontrada: {len(rows)} linhas")

            for row in rows:
                cells = await row.query_selector_all("td")
                if len(cells) >= 5:
                    # Tenta extrair link do arquivo
                    link_el = await cells[0].query_selector("a")
                    file_url = None
                    if link_el:
                        file_url = await link_el.get_attribute("href")
                        if file_url and not file_url.startswith("http"):
                            file_url = "https://www.war.gov" + file_url

                    results.append({
                        "agency": (await cells[0].inner_text()).strip(),
                        "release_date": (await cells[1].inner_text()).strip(),
                        "incident_date": (await cells[2].inner_text()).strip(),
                        "location_name": (await cells[3].inner_text()).strip(),
                        "media_type": (await cells[4].inner_text()).strip().lower(),
                        "original_url": file_url,
                    })

        except Exception as e:
            print(f"⚠️  Tabela JS não carregou ({e}), usando fallback de slideshow ({len(SLIDESHOW_IMAGES)} itens)")
            results = SLIDESHOW_IMAGES.copy()

        await browser.close()

    if not results:
        print("⚠️  Scraping não retornou dados, usando fallback")
        results = SLIDESHOW_IMAGES.copy()

    return results


def normalize_agency(raw: str) -> str:
    mapping = {
        "fbi": "FBI", "nasa": "NASA", "state": "STATE",
        "state department": "STATE", "cia": "CIA",
        "odni": "ODNI", "doe": "DOE",
        "dow": "DOW", "department of war": "DOW",
        "dod": "DOW", "department of defense": "DOW",
    }
    return mapping.get(raw.lower().strip(), "OTHER")


def normalize_media_type(raw: str) -> str:
    raw = raw.lower()
    if "video" in raw: return "video"
    if "pdf" in raw or "document" in raw: return "pdf"
    if "image" in raw or "photo" in raw: return "image"
    return "document"


def extract_year(date_str: str) -> int | None:
    if not date_str:
        return None
    match = re.search(r"\b(19|20)\d{2}\b", date_str)
    return int(match.group()) if match else None


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--output", default="raw_documents.json")
    args = parser.parse_args()

    raw = await scrape_war_gov()

    # Normaliza campos
    normalized = []
    for item in raw:
        normalized.append({
            **item,
            "agency": normalize_agency(item.get("agency", "")),
            "media_type": normalize_media_type(item.get("media_type", "")),
            "incident_year": item.get("incident_year") or extract_year(item.get("incident_date", "")),
            "release_date": item.get("release_date", str(date.today())),
            "classification": "unresolved",
        })

    print(f"\n📋 Total de documentos extraídos: {len(normalized)}")

    if args.dry_run:
        for doc in normalized[:3]:
            print(json.dumps(doc, indent=2, ensure_ascii=False))
        print("... (dry-run, não salvando)")
        return

    out = Path(args.output)
    out.write_text(json.dumps(normalized, indent=2, ensure_ascii=False))
    print(f"💾 Salvo em {out}")


if __name__ == "__main__":
    asyncio.run(main())
