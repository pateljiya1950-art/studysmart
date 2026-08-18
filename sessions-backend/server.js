require("dotenv").config();
const express  = require("express");
const cors     = require("cors");

const app  = express();
const PORT = process.env.PORT || 5000;

/* ─── CORS: read origin from environment ─────────────────────── */
// Set CORS_ORIGIN in .env (dev) or hosting platform env vars (prod).
// Multiple origins: CORS_ORIGIN=https://frontend.com,https://localhost:63349
const rawOrigins = process.env.CORS_ORIGIN || "https://localhost:63349";
const allowedOrigins = rawOrigins.split(",").map(o => o.trim());

app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

/* ─────────────────────────────────────────────────────────────
   In-Memory Store (used when MongoDB is unavailable)
───────────────────────────────────────────────────────────── */
const { v4: uuidv4 } = require("uuid");
let store = []; // array of session objects

/* ─── Routes ────────────────────────────────────────────────── */
app.use("/api/sessions", require("./routes/sessions"));
app.use("/", require("./routes/auth"));

/* ─── Health ────────────────────────────────────────────────── */
app.get("/health", (_req, res) =>
  res.json({ status: "ok", mode: "in-memory", count: store.length })
);

/* ─── 404 ───────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

/* ─── Error handler ─────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error("Unhandled:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

/* ─────────────────────────────────────────────────────────────
   Try MongoDB first, fall back to in-memory automatically
───────────────────────────────────────────────────────────── */
async function startServer() {
  console.log("📦  Mode: MongoDB Disabled (Requested by User)");
  
  /* Patch controller to use in-memory store */
  require("./store").activate(store, uuidv4);

  app.listen(PORT, () => console.log(`✅ sessions-backend running on port ${PORT}`));
}

startServer();
