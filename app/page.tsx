export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Mindful Academic Evaluator</h1>

      <p>Welcome to your grading system.</p>

      <textarea
        placeholder="Paste student paper here..."
        style={{
          width: "100%",
          height: "200px",
          marginTop: "20px",
          padding: "10px"
        }}
      />

      <br /><br />

      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
      >
        Evaluate Paper
      </button>
    </main>
  );
}