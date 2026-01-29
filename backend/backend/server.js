import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "online", time: new Date() });
});

app.get("/api/world", async (req, res) => {
  try {
    const response = await fetch("https://api.publicapis.org/entries");
    const data = await response.json();
    res.json(data.entries.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar dados reais" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend rodando em http://localhost:3000");
});
