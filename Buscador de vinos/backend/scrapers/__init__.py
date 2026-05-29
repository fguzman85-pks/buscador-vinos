# Scrapers package
from .dislicores import scrape_dislicores
from .exito import scrape_exito
from .carulla import scrape_carulla
from .rappi import scrape_rappi
from .jumbo import scrape_jumbo
from .larecetta import scrape_larecetta

__all__ = [
    "scrape_dislicores",
    "scrape_exito",
    "scrape_carulla",
    "scrape_rappi",
    "scrape_jumbo",
    "scrape_larecetta",
]
