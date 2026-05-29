"""
Buscador de Vinos - Backend API
FastAPI server with real-time scraping and 1-hour cache.
"""
import asyncio
import logging
import time
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from scrapers import (
    scrape_dislicores,
    scrape_exito,
    scrape_carulla,
    scrape_rappi,
    scrape_jumbo,
    scrape_larecetta,
)

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Buscador de Vinos API",
    description="API para buscar promociones de vino en tiendas colombianas",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory cache ───────────────────────────────────────────────────────────
CACHE_TTL = 3600  # 1 hour

_cache: dict[str, dict] = {}


def get_cache(key: str) -> Optional[list]:
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        return entry["data"]
    return None


def set_cache(key: str, data: list):
    _cache[key] = {"ts": time.time(), "data": data}


# ── Scrapers list ─────────────────────────────────────────────────────────────
ALL_SCRAPERS = [
    scrape_dislicores,
    scrape_exito,
    scrape_carulla,
    scrape_rappi,
    scrape_jumbo,
    scrape_larecetta,
]


async def run_all_scrapers(query: Optional[str] = None) -> list[dict]:
    """Run all scrapers concurrently and merge results."""
    tasks = [scraper(query) for scraper in ALL_SCRAPERS]
    results_per_store = await asyncio.gather(*tasks, return_exceptions=True)

    merged = []
    for res in results_per_store:
        if isinstance(res, list):
            merged.extend(res)
        elif isinstance(res, Exception):
            logger.warning(f"Scraper failed: {res}")

    # Sort: biggest discount first, then cheapest price
    merged.sort(key=lambda x: (-(x.get("discount") or 0), x.get("price") or 0))
    return merged


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "message": "Buscador de Vinos API 🍷"}


@app.get("/api/promotions")
async def get_promotions(refresh: bool = False):
    """
    Fetch the best wine promotions across all stores.
    Results are cached for 1 hour. Pass ?refresh=true to force refresh.
    """
    cache_key = "promotions"
    if not refresh:
        cached = get_cache(cache_key)
        if cached is not None:
            return {
                "products": cached,
                "count": len(cached),
                "from_cache": True,
                "stores": list({p["store"] for p in cached}),
            }

    logger.info("Running all scrapers for promotions...")
    products = await run_all_scrapers()
    set_cache(cache_key, products)

    return {
        "products": products,
        "count": len(products),
        "from_cache": False,
        "stores": list({p["store"] for p in products}),
    }


@app.get("/api/search")
async def search_wines(
    q: str = Query(..., min_length=1, description="Cepa o nombre de vino a buscar"),
    refresh: bool = False,
):
    """
    Search wines by name or grape variety (cepa) across all stores.
    Example: ?q=malbec  or  ?q=cabernet sauvignon
    """
    query_key = f"search:{q.lower().strip()}"

    if not refresh:
        cached = get_cache(query_key)
        if cached is not None:
            return {
                "query": q,
                "products": cached,
                "count": len(cached),
                "from_cache": True,
                "stores": list({p["store"] for p in cached}),
            }

    logger.info(f"Searching for: {q}")
    products = await run_all_scrapers(query=q)
    set_cache(query_key, products)

    return {
        "query": q,
        "products": products,
        "count": len(products),
        "from_cache": False,
        "stores": list({p["store"] for p in products}),
    }


@app.post("/api/refresh")
async def force_refresh():
    """Clear the cache and trigger a fresh scrape immediately."""
    _cache.clear()
    logger.info("Cache cleared, running scrapers...")
    products = await run_all_scrapers()
    set_cache("promotions", products)

    return {
        "message": "Cache refreshed successfully",
        "products": products,
        "count": len(products),
    }


@app.get("/api/stores")
async def list_stores():
    """List all supported stores."""
    return {
        "stores": [
            {"name": "Dislicores", "url": "https://www.dislicores.com", "color": "#8B0000"},
            {"name": "Éxito", "url": "https://www.exito.com", "color": "#FFD700"},
            {"name": "Carulla", "url": "https://www.carulla.com", "color": "#2E8B57"},
            {"name": "Rappi", "url": "https://www.rappi.com.co", "color": "#FF441F"},
            {"name": "Jumbo", "url": "https://www.tiendasjumbo.co", "color": "#E31837"},
            {"name": "La Recetta", "url": "https://www.larecetta.co", "color": "#722F37"},
        ]
    }


@app.get("/api/cepas")
async def popular_cepas():
    """Return popular grape varieties for quick-filter chips."""
    return {
        "cepas": [
            "Malbec", "Cabernet Sauvignon", "Pinot Noir", "Chardonnay",
            "Sauvignon Blanc", "Merlot", "Carménère", "Syrah",
            "Moscato", "Rosé", "Espumante", "Tempranillo",
        ]
    }
