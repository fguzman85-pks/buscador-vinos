"""Scraper for Dislicores (dislicores.com)."""
import logging
from typing import Optional
from bs4 import BeautifulSoup
from .base import make_client, clean_price, calc_discount

logger = logging.getLogger(__name__)

STORE_NAME = "Dislicores"
STORE_COLOR = "#8B0000"
BASE_URL = "https://www.dislicores.com"


async def scrape_dislicores(query: Optional[str] = None) -> list[dict]:
    """
    Fetch wine products from Dislicores.
    If query is provided, search for that term; otherwise fetch promoted wines.
    """
    results = []
    try:
        async with make_client() as client:
            if query:
                url = f"{BASE_URL}/catalogsearch/result/?q={query.replace(' ', '+')}"
            else:
                url = f"{BASE_URL}/vinos.html?sort=price&dir=asc"

            resp = await client.get(url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Dislicores uses standard Magento product grid
            items = soup.select("li.product-item, .item.product")
            if not items:
                items = soup.select(".product-item-info")

            for item in items[:20]:
                try:
                    name_el = item.select_one(".product-item-name a, .product-name a, h2.product-name a")
                    if not name_el:
                        continue

                    name = name_el.get_text(strip=True)
                    link = name_el.get("href", "")
                    if link and not link.startswith("http"):
                        link = BASE_URL + link

                    # Price: look for special (discounted) price first
                    special_el = item.select_one(".special-price .price, .price-final_price .price")
                    regular_el = item.select_one(".old-price .price, .regular-price .price")
                    price_el = item.select_one(".price")

                    current_price = clean_price(
                        (special_el or price_el or "").get_text(strip=True)
                        if hasattr((special_el or price_el or ""), "get_text")
                        else ""
                    )
                    if not current_price:
                        continue

                    original_price = clean_price(
                        regular_el.get_text(strip=True) if regular_el else None
                    )

                    # Image
                    img_el = item.select_one("img.product-image-photo, img")
                    image = img_el.get("src") or img_el.get("data-src") if img_el else None

                    results.append({
                        "store": STORE_NAME,
                        "store_color": STORE_COLOR,
                        "name": name,
                        "price": current_price,
                        "original_price": original_price,
                        "discount": calc_discount(original_price, current_price),
                        "url": link,
                        "image": image,
                        "currency": "COP",
                    })
                except Exception as e:
                    logger.debug(f"Error parsing Dislicores item: {e}")
                    continue

    except Exception as e:
        logger.warning(f"Dislicores scraper error: {e}")

    return results
