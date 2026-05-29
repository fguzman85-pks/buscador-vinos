"""Scraper for La Recetta (larecetta.co) — specialty wine shop in Colombia."""
import logging
from typing import Optional
from bs4 import BeautifulSoup
from .base import make_client, clean_price, calc_discount

logger = logging.getLogger(__name__)

STORE_NAME = "La Recetta"
STORE_COLOR = "#722F37"
BASE_URL = "https://www.larecetta.co"


async def scrape_larecetta(query: Optional[str] = None) -> list[dict]:
    """Fetch wine products from La Recetta."""
    results = []
    try:
        async with make_client() as client:
            if query:
                url = f"{BASE_URL}/search?q={query.replace(' ', '+')}&type=product"
            else:
                url = f"{BASE_URL}/collections/vinos?sort_by=price-ascending"

            resp = await client.get(url)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Shopify-style product grid
            items = soup.select(
                ".product-item, .grid__item, [class*='product-card'], "
                ".product-grid-item, .grid-product"
            )

            for item in items[:20]:
                try:
                    name_el = item.select_one(
                        ".product-item__title, .grid-product__title, "
                        ".product-card__name, h3, h2, .h4 a, a.full-unstyled-link"
                    )
                    if not name_el:
                        continue
                    name = name_el.get_text(strip=True)

                    link_el = item.select_one("a[href*='/products/']")
                    link = (BASE_URL + link_el["href"]) if link_el else ""

                    price_el = item.select_one(
                        ".product-item__price .price__regular .price-item--regular, "
                        ".price .price-item--sale, .price-item, .money, "
                        "[class*='price']"
                    )
                    current_price = clean_price(
                        price_el.get_text(strip=True) if price_el else ""
                    )
                    if not current_price:
                        continue

                    compare_el = item.select_one(
                        ".price__regular s, s.price-item--regular, "
                        ".price-item--regular[aria-hidden], del"
                    )
                    original_price = clean_price(
                        compare_el.get_text(strip=True) if compare_el else ""
                    )

                    img_el = item.select_one("img")
                    image = None
                    if img_el:
                        image = img_el.get("src") or img_el.get("data-src") or img_el.get("data-srcset", "").split()[0]
                        if image and image.startswith("//"):
                            image = "https:" + image

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
                    logger.debug(f"Error parsing La Recetta item: {e}")
                    continue

    except Exception as e:
        logger.warning(f"La Recetta scraper error: {e}")

    return results
