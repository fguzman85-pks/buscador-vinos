# Scrapers package
from .dislicores import scrape_dislicores
from .exito import scrape_exito
from .carulla import scrape_carulla
from .olimpica import scrape_olimpica
from .jumbo import scrape_jumbo
from .larecetta import scrape_larecetta

__all__ = [
    "scrape_dislicores",
    "scrape_exito",
    "scrape_carulla",
    "scrape_olimpica",
    "scrape_jumbo",
    "scrape_larecetta",
]
