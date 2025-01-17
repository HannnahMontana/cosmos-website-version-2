import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Proxy routes
app.use("/auth", async (req, res) => {
  try {
    console.log("Proxy to auth service");

    console.log("Request method:", req.method);
    console.log("Request URL:", `http://localhost:3001${req.url}`);
    console.log("Request body:", req.body);

    const response = await axios({
      method: req.method,
      url: `http://localhost:3001/auth/${req.url}`, // Proxy to auth service
      headers: req.headers,
      data: req.body,
    });
    console.log("Response from auth service", response);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: error.message });
  }
});

app.use("/articles", async (req, res) => {
  try {
    console.log("Proxy to articles service");
    const response = await axios({
      method: req.method,
      url: `http://localhost:3002${req.url}`, // Proxy to articles service
      headers: req.headers,
      data: req.body,
    });
    console("Response from articles service", response);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: error.message });
  }
});

// Error handling
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Coś poszło nie tak.";
  res.status(status).json({ message });
});

// Server start
app.listen(PORT, () => {
  console.log(`Gateway działa na http://localhost:${PORT}`);
});
