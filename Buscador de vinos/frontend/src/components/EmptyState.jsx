export default function EmptyState({ query }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.emoji}>🔍</div>
      <h3 style={styles.title}>
        {query
          ? `Sin resultados para "${query}"`
          : "No se encontraron promociones"}
      </h3>
      <p style={styles.text}>
        {query
          ? "Intenta con otro nombre de cepa o marca. Por ejemplo: Malbec, Cabernet, Chardonnay..."
          : "No pudimos conectar con las tiendas en este momento. Verifica tu conexión e intenta de nuevo."}
      </p>
    </div>
  );
}

const styles = {
  wrapper: {
    textAlign: "center",
    padding: "40px 24px",
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: 700, color: "var(--text2)", marginBottom: 8 },
  text: { fontSize: 13, color: "var(--text3)", lineHeight: 1.6 },
};
