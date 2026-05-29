const STORE_COLORS = {
  "Dislicores": "#8B0000",
  "Éxito": "#b8940a",
  "Carulla": "#2E8B57",
  "Rappi": "#FF441F",
  "Jumbo": "#E31837",
  "La Recetta": "#722F37",
};

export default function StoreFilter({ stores, selected, onChange }) {
  const toggle = (store) => {
    if (selected.includes(store)) {
      onChange(selected.filter((s) => s !== store));
    } else {
      onChange([...selected, store]);
    }
  };

  return (
    <div style={styles.wrapper}>
      <span style={styles.label}>Filtrar por tienda:</span>
      <div style={styles.chips}>
        {stores.map((store) => {
          const isActive = selected.includes(store);
          const color = STORE_COLORS[store] || "#722F37";
          return (
            <button
              key={store}
              onClick={() => toggle(store)}
              style={{
                ...styles.chip,
                borderColor: isActive ? color : "var(--border)",
                background: isActive ? color : "transparent",
                color: isActive ? "#fff" : "var(--text2)",
              }}
            >
              {store}
            </button>
          );
        })}
        {selected.length > 0 && (
          <button onClick={() => onChange([])} style={styles.clearAll}>
            Todas ✕
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { marginBottom: 12 },
  label: { fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 6 },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: {
    border: "1px solid",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  clearAll: {
    background: "none",
    border: "1px solid var(--border)",
    color: "var(--text3)",
    borderRadius: 20,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
  },
};
