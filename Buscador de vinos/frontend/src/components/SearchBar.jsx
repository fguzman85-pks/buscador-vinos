import { useRef } from "react";

export default function SearchBar({ value, onChange, onSearch, loading }) {
  const inputRef = useRef();

  const handleKey = (e) => {
    if (e.key === "Enter" && !loading) {
      onSearch(value);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div style={styles.wrapper}>
      <span style={styles.icon}>🔍</span>
      <input
        ref={inputRef}
        type="search"
        placeholder="Buscar por cepa, marca o nombre..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={loading}
        style={styles.input}
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {value && (
        <button onClick={handleClear} style={styles.clear}>✕</button>
      )}
      <button
        onClick={() => !loading && onSearch(value)}
        disabled={loading || !value.trim()}
        style={{
          ...styles.searchBtn,
          opacity: (!value.trim() || loading) ? 0.5 : 1,
        }}
      >
        {loading ? <span style={styles.spinner} /> : "Buscar"}
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "0 4px 0 12px",
    gap: 6,
    height: 46,
  },
  icon: { fontSize: 16, flexShrink: 0 },
  input: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontSize: 15,
    padding: "0 4px",
    minWidth: 0,
  },
  clear: {
    background: "none",
    border: "none",
    color: "var(--text3)",
    cursor: "pointer",
    fontSize: 14,
    padding: "0 4px",
    flexShrink: 0,
  },
  searchBtn: {
    background: "var(--wine)",
    border: "none",
    color: "#fff",
    borderRadius: 10,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    height: 34,
  },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
