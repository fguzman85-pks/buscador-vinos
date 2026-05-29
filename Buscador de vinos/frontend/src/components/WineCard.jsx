export default function WineCard({ product, rank }) {
  const {
    name, store, store_color, price, original_price,
    discount, url, image, currency,
  } = product;

  const formatPrice = (p) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);

  const isTopDeal = rank < 3 && discount > 0;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...styles.card, animation: `slideUp 0.3s ease ${rank * 0.04}s both` }}
    >
      {/* Discount badge */}
      {discount > 0 && (
        <div style={styles.discountBadge}>
          -{discount}%
        </div>
      )}

      {/* Top deal crown */}
      {isTopDeal && (
        <div style={styles.crownBadge}>🏆</div>
      )}

      {/* Product image */}
      <div style={styles.imageWrapper}>
        {image ? (
          <img
            src={image}
            alt={name}
            style={styles.image}
            loading="lazy"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <div style={{ ...styles.imagePlaceholder, display: image ? "none" : "flex" }}>
          🍷
        </div>
      </div>

      {/* Store chip */}
      <div style={{ ...styles.storeChip, background: store_color || "#722F37" }}>
        {store}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={styles.name} title={name}>{name}</p>

        {/* Price */}
        <div style={styles.priceArea}>
          <span style={styles.price}>{formatPrice(price)}</span>
          {original_price && original_price > price && (
            <span style={styles.originalPrice}>{formatPrice(original_price)}</span>
          )}
        </div>

        {/* Savings */}
        {original_price && original_price > price && (
          <span style={styles.savings}>
            Ahorras {formatPrice(original_price - price)}
          </span>
        )}
      </div>

      {/* CTA */}
      <div style={styles.cta}>Ver oferta →</div>
    </a>
  );
}

const styles = {
  card: {
    position: "relative",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "linear-gradient(135deg, #c0392b, #e74c3c)",
    color: "#fff",
    borderRadius: 20,
    padding: "3px 8px",
    fontSize: 11,
    fontWeight: 800,
    zIndex: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },
  crownBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    fontSize: 16,
    zIndex: 2,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: "1 / 1.1",
    background: "#1a0808",
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: 8,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    color: "var(--border)",
  },
  storeChip: {
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
    padding: "3px 10px",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  content: { padding: "8px 10px 4px", flex: 1 },
  name: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    lineHeight: 1.4,
    marginBottom: 6,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  priceArea: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 15,
    fontWeight: 800,
    color: "var(--gold-light)",
  },
  originalPrice: {
    fontSize: 11,
    color: "var(--text3)",
    textDecoration: "line-through",
  },
  savings: {
    display: "block",
    fontSize: 10,
    color: "var(--green)",
    marginTop: 2,
    fontWeight: 600,
  },
  cta: {
    padding: "8px 10px",
    fontSize: 11,
    color: "var(--wine-light)",
    fontWeight: 700,
    borderTop: "1px solid var(--border)",
    marginTop: 4,
  },
};
