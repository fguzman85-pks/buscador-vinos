"""Scraper for Rappi Colombia via their public search endpoint."""
import logging
import httpx
from typing import Optional
from .base import calc_discount

logger = logging.getLogger(__name__)

STORE_NAME = "Rappi"
STORE_COLOR = "#FF441F"
# Rappi uses a GraphQL/REST backend for product search
SEARCH_URL = "https://services.rappi.com.co/api/ms/web-gateway/api/dynamic/context/content/"


async def scrape_rappi(query: Optional[str] = None) -> list[dict]:
    """
    Fetch wine products from Rappi Colombia.
    Uses the Rappi web search API.
    """
    results = []
    try:
        search_term = query if query else "vino"

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Linux; Android 12) "
                "AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36"
            ),
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "es-CO,es;q=0.9",
            "Origin": "https://www.rappi.com.co",
            "Referer": "https://www.rappi.com.co/",
        }

        # Try Rappi's universal search endpoint
        search_endpoint = f"https://www.rappi.com.co/api/ms/web-gateway/api/dynamic/context/content/search"
        params = {
            "query": search_term,
            "limit": 20,
            "offset": 0,
        }

        async with httpx.AsyncClient(headers=headers, timeout=15, follow_redirects=True) as client:
            resp = await client.get(search_endpoint, params=params)
            resp.raise_for_status()
            data = resp.json()

            # Navigate Rappi's response structure
            products = []
            if isinstance(data, dict):
                products = (
                    data.get("data", {}).get("products", [])
                    or data.get("results", [])
                    or data.get("products", [])
                )
            elif isinstance(data, list):
                products = data

            for item in products[:20]:
                try:
                    name = item.get("name") or item.get("product_name", "")
                    if not name:
                        continue

                    price = item.get("price") or item.get("real_price")
                    original_price = item.get("real_price") or item.get("original_price")

                    if not price:
                        continue

                    price = float(price)
                    original_price = float(original_price) if original_price else None

                    product_id = item.get("product_id") or item.get("id", "")
                    link = f"https://www.rappi.com.co/producto/{product_id}"
                    image = item.get("image") or item.get("image_url")

                    results.append({
                        "store": STORE_NAME,
                        "store_color": STORE_COLOR,
                        "name": name,
                        "price": price,
                        "original_price": original_price if original_price and original_price > price else None,
                        "discount": calc_discount(original_price, price),
                        "url": link,
                        "image": image,
                        "currency": "COP",
                    })
                except Exception as e:
                    logger.debug(f"Error parsing Rappi item: {e}")
                    continue

    except Exception as e:
        logger.warning(f"Rappi scraper error: {e}")

    return results
