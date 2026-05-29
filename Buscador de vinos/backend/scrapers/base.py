"""Base scraper utilities shared across all store scrapers."""
import re
import httpx
from typing import Optional

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Linux; Android 12; Pixel 6) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Mobile Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}

TIMEOUT = 15.0


def clean_price(price_str: str) -> Optional[float]:
    """Extract numeric price from a string like '$45.900' or '45900'."""
    if not price_str:
        return None
    cleaned = re.sub(r"[^\d]", "", str(price_str))
    if cleaned:
        return float(cleaned)
    return None


def make_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        headers=HEADERS,
        timeout=TIMEOUT,
        follow_redirects=True,
        verify=False,
    )


def calc_discount(original: Optional[float], current: float) -> Optional[int]:
    """Return discount percentage, or None if no original price."""
    if original and original > current:
        return round((1 - current / original) * 100)
    return None
