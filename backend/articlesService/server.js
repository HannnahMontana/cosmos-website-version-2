import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pkg from "pg";
import articleRoutes from "./routes/articles.js";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = 3002;

// Middleware
app.use(bodyParser.json());

// DB connection
const pool = new Pool({
  connectionString: process.env.ARTICLES_DB_URL,
  ssl: false,
  // ssl: { rejectUnauthorized: false },
});
app.locals.pool = pool;

// Routes
app.use("/articles", articleRoutes);

// Error handling
app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ message: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Articles Service running on http://localhost:${PORT}`);
});
