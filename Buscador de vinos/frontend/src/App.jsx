import { useState, useCallback, useEffect } from "react";
import WineCard from "./components/WineCard";
import SearchBar from "./components/SearchBar";
import CepaChips from "./components/CepaChips";
import StoreFilter from "./components/StoreFilter";
import EmptyState from "./components/EmptyState";
import Skeleton from "./components/Skeleton";

// ── Config ────────────────────────────────────────────────────────────────────
// Change this to your Render backend URL after deploying
const API_BASE = import.meta.env.VITE_API_URL || "/api";

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "discount", label: "Mejor descuento" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "store", label: "Tienda A-Z" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function sortProducts(products, sortBy) {
  const arr = [...products];
  switch (sortBy) {
    case "discount":
      return arr.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case "price_asc":
      return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price_desc":
      return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "store":
      return arr.sort((a, b) => a.store.localeCompare(b.store));
    default:
      return arr;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(null); // what was actually searched
  const [sortBy, setSortBy] = useState("discount");
  const [selectedStores, setSelectedStores] = useState([]);
  const [availableStores, setAvailableStores] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (searchQuery, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let url;
      if (searchQuery && searchQuery.trim()) {
        const params = new URLSearchParams({ q: searchQuery.trim() });
        if (forceRefresh) params.set("refresh", "true");
        url = `${API_BASE}/search?${params}`;
      } else {
        url = `${API_BASE}/promotions${forceRefresh ? "?refresh=true" : ""}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();

      setProducts(data.products || []);
      setAvailableStores(data.stores || []);
      setSelectedStores([]); // reset store filter on new search
      setActiveQuery(searchQuery || null);
      setFromCache(data.from_cache || false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = (q) => {
    setQuery(q);
    fetchProducts(q);
  };

  const handleCepa = (cepa) => {
    setQuery(cepa);
    fetchProducts(cepa);
  };

  const handlePromotions = () => {
    setQuery("");
    fetchProducts("");
  };

  const handleRefresh = () => {
    fetchProducts(activeQuery, true);
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const filtered = sortProducts(
    selectedStores.length > 0
      ? products.filter((p) => selectedStores.includes(p.store))
      : products,
    sortBy
  );

  const hasDiscount = filtered.filter((p) => p.discount > 0);
  const bestDeal = hasDiscount.length > 0 ? hasDiscount[0] : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🍷</span>
            <div>
              <h1 style={styles.title}>Buscador de Vinos</h1>
              <p style={styles.subtitle}>Colombia · Mejores precios del día</p>
            </div>
          </div>
          {lastUpdated && (
            <button onClick={handleRefresh} style={styles.refreshBtn} title="Actualizar">
              <span style={{ display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
            </button>
          )}
        </div>
      </header>

      {/* Search area */}
      <div style={styles.searchArea}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Main action buttons */}
        <div style={styles.actionRow}>
          <button
            onClick={handlePromotions}
            disabled={loading}
            style={styles.promoBtn}
          >
            {loading && !query ? (
              <span style={styles.spinner} />
            ) : (
              "🔥 Mejores Promociones del Día"
            )}
          </button>
        </div>

        {/* Cepa chips */}
        <CepaChips onSelect={handleCepa} activeQuery={activeQuery} />
      </div>

      {/* Results area */}
      <main style={styles.main}>
        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
            <button onClick={handleRefresh} style={styles.retryBtn}>Reintentar</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && !error && (
          <>
            {/* Stats bar */}
            {products.length > 0 && (
              <div style={styles.statsBar}>
                <div style={styles.statsLeft}>
                  <span style={styles.count}>{filtered.length} vinos</span>
                  {activeQuery && (
                    <span style={styles.queryTag}>"{activeQuery}"</span>
                  )}
                  {fromCache && (
                    <span style={styles.cacheTag}>· caché</span>
                  )}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={styles.sortSelect}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Store filter */}
            {availableStores.length > 1 && (
              <StoreFilter
                stores={availableStores}
                selected={selectedStores}
                onChange={setSelectedStores}
              />
            )}

            {/* Best deal banner */}
            {bestDeal && sortBy === "discount" && (
              <div style={styles.bestDealBanner}>
                <span style={styles.bestDealLabel}>🏆 Mejor oferta</span>
                <span style={styles.bestDealName}>{bestDeal.name}</span>
                <span style={styles.bestDealStore}>{bestDeal.store}</span>
                <span style={styles.bestDealDiscount}>-{bestDeal.discount}% OFF</span>
              </div>
            )}

            {/* Product grid */}
            {filtered.length > 0 ? (
              <div style={styles.grid}>
                {filtered.map((product, i) => (
                  <WineCard key={`${product.store}-${i}`} product={product} rank={i} />
                ))}
              </div>
            ) : (
              <EmptyState query={activeQuery} />
            )}
          </>
        )}

        {/* Welcome state */}
        {!loading && !hasSearched && (
          <div style={styles.welcome}>
            <div style={styles.welcomeEmoji}>🍷</div>
            <h2 style={styles.welcomeTitle}>¿Qué vino buscas hoy?</h2>
            <p style={styles.welcomeText}>
              Presiona <strong>Mejores Promociones del Día</strong> para ver las
              mejores ofertas en Dislicores, Éxito, Carulla, Rappi, Jumbo y más.
              O busca por cepa usando los filtros de arriba.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Dislicores · Éxito · Carulla · Rappi · Jumbo · La Recetta</p>
      </footer>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  app: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
    maxWidth: 600,
    margin: "0 auto",
  },
  header: {
    background: "linear-gradient(135deg, #3d0c0c 0%, #5a1a1a 100%)",
    padding: "env(safe-area-inset-top, 0) 16px 0",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: 700, color: "var(--gold-light)", lineHeight: 1.2 },
  subtitle: { fontSize: 11, color: "var(--text3)", marginTop: 2 },
  refreshBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid var(--border)",
    color: "var(--text2)",
    borderRadius: 8,
    width: 36,
    height: 36,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchArea: {
    padding: "12px 16px 8px",
    background: "var(--bg2)",
    borderBottom: "1px solid var(--border)",
  },
  actionRow: { marginTop: 10 },
  promoBtn: {
    width: "100%",
    padding: "14px 20px",
    background: "linear-gradient(135deg, var(--wine) 0%, var(--wine-light) 100%)",
    border: "none",
    borderRadius: "var(--radius)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 20px rgba(139,26,26,0.5)",
    letterSpacing: "0.02em",
  },
  spinner: {
    display: "inline-block",
    width: 18,
    height: 18,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  main: { flex: 1, padding: "12px 16px 80px" },
  errorBox: {
    background: "#3d1a1a",
    border: "1px solid #8b2020",
    borderRadius: "var(--radius-sm)",
    padding: "12px 16px",
    color: "#ff8080",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    fontSize: 13,
  },
  retryBtn: {
    background: "#8b2020",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
  },
  statsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  statsLeft: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  count: { fontSize: 13, color: "var(--text2)", fontWeight: 600 },
  queryTag: {
    fontSize: 12,
    background: "var(--wine)",
    color: "#fff",
    borderRadius: 20,
    padding: "2px 8px",
    fontStyle: "italic",
  },
  cacheTag: { fontSize: 11, color: "var(--text3)" },
  sortSelect: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    color: "var(--text2)",
    borderRadius: 8,
    padding: "4px 8px",
    fontSize: 12,
    cursor: "pointer",
    flexShrink: 0,
  },
  bestDealBanner: {
    background: "linear-gradient(135deg, #1a3d1a 0%, #1f4d1f 100%)",
    border: "1px solid #2ecc71",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    fontSize: 12,
  },
  bestDealLabel: { color: "var(--gold)", fontWeight: 700, flexShrink: 0 },
  bestDealName: { color: "var(--text)", flex: 1, minWidth: 80, fontWeight: 600 },
  bestDealStore: { color: "var(--text3)" },
  bestDealDiscount: {
    background: "var(--green)",
    color: "#000",
    borderRadius: 20,
    padding: "2px 8px",
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
  },
  welcome: {
    textAlign: "center",
    padding: "60px 24px",
  },
  welcomeEmoji: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: 700, color: "var(--gold-light)", marginBottom: 12 },
  welcomeText: { fontSize: 14, color: "var(--text2)", lineHeight: 1.6 },
  footer: {
    textAlign: "center",
    padding: "16px",
    fontSize: 11,
    color: "var(--text3)",
    borderTop: "1px solid var(--border)",
  },
};
