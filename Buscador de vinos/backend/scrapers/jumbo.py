"""Scraper for Jumbo Colombia (tiendasjumbo.co) using VTEX API."""
import logging
import httpx
from typing import Optional
from .base import calc_discount

logger = logging.getLogger(__name__)

STORE_NAME = "Jumbo"
STORE_COLOR = "#E31837"
API_URL = "https://www.tiendasjumbo.co/api/catalog_system/pub/products/search"


async def scrape_jumbo(query: Optional[str] = None) -> list[dict]:
    """Fetch wine products from Jumbo Colombia via VTEX search API."""
    results = []
    try:
        search_term = query if query else "vino"
        params = {
            "ft": search_term,
            "_from": 0,
            "_to": 24,
            "O": "OrderByBestDiscountDESC",
        }

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Linux; Android 12) "
                "AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36"
            ),
            "Accept": "application/json",
            "Referer": "https://www.tiendasjumbo.co/",
        }

        async with httpx.AsyncClient(headers=headers, timeout=15, follow_redirects=True) as client:
            resp = await client.get(API_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

            for item in data[:20]:
                try:
                    name = item.get("productName", "")
                    if not name:
                        continue

                    sellers = item.get("items", [{}])[0].get("sellers", [{}])
                    if not sellers:
                        continue

                    offer = sellers[0].get("commertialOffer", {})
                    price = offer.get("Price")
                    list_price = offer.get("ListPrice")

                    if not price:
                        continue

                    link = f"https://www.tiendasjumbo.co/{item.get('linkText', '')}/p"
                    images = item.get("items", [{}])[0].get("images", [{}])
                    image = images[0].get("imageUrl") if images else None

                    results.append({
                        "store": STORE_NAME,
                        "store_color": STORE_COLOR,
                        "name": name,
                        "price": float(price),
                        "original_price": float(list_price) if list_price and list_price != price else None,
                        "discount": calc_discount(
                            float(list_price) if list_price else None,
                            float(price)
                        ),
                        "url": link,
                        "image": image,
                        "currency": "COP",
                    })
                except Exception as e:
                    logger.debug(f"Error parsing Jumbo item: {e}")
                    continue

    except Exception as e:
        logger.warning(f"Jumbo scraper error: {e}")

    return results
