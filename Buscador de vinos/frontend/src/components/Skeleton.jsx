export default function Skeleton() {
  return (
    <div style={styles.card}>
      <div style={styles.image} />
      <div style={styles.strip} />
      <div style={styles.content}>
        <div style={{ ...styles.line, width: "90%" }} />
        <div style={{ ...styles.line, width: "70%", marginTop: 6 }} />
        <div style={{ ...styles.line, width: "50%", marginTop: 8, height: 18 }} />
      </div>
    </div>
  );
}

const shimmer = {
  background: "linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

const styles = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  image: { ...shimmer, width: "100%", aspectRatio: "1 / 1.1" },
  strip: { ...shimmer, height: 22, width: "100%" },
  content: { padding: "8px 10px 12px" },
  line: { ...shimmer, height: 12, borderRadius: 6 },
};
