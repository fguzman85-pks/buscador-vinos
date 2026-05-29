const CEPAS = [
  { label: "Malbec", emoji: "🍇" },
  { label: "Cabernet Sauvignon", emoji: "🍷" },
  { label: "Pinot Noir", emoji: "🌹" },
  { label: "Chardonnay", emoji: "🥂" },
  { label: "Sauvignon Blanc", emoji: "🍋" },
  { label: "Merlot", emoji: "🍒" },
  { label: "Carménère", emoji: "🌶️" },
  { label: "Rosé", emoji: "🌸" },
  { label: "Espumante", emoji: "✨" },
  { label: "Moscato", emoji: "🍑" },
  { label: "Syrah", emoji: "🫐" },
  { label: "Tempranillo", emoji: "🔴" },
];

export default function CepaChips({ onSelect, activeQuery }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.scroll}>
        {CEPAS.map(({ label, emoji }) => {
          const isActive = activeQuery?.toLowerCase() === label.toLowerCase();
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              style={{
                ...styles.chip,
                ...(isActive ? styles.chipActive : {}),
              }}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: 10,
    marginLeft: -16,
    marginRight: -16,
    overflow: "hidden",
  },
  scroll: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "4px 16px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  },
  chip: {
    flexShrink: 0,
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    color: "var(--text2)",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontWeight: 500,
    transition: "all 0.15s",
  },
  chipActive: {
    background: "var(--wine)",
    border: "1px solid var(--wine-light)",
    color: "#fff",
    fontWeight: 700,
  },
};
