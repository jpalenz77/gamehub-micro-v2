import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "supersecretkey";

let db;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      game TEXT,
      score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  console.log("✅ Database ready");
})();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// === REGISTRO DE USUARIO ===
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
    const userId = result.lastID;
    
    // 🎯 Registrar al usuario en el ranking de DOOM y Wolfenstein con puntuación 0
    await db.run("INSERT INTO scores (user_id, game, score) VALUES (?, ?, ?)", [userId, "doom", 0]);
    await db.run("INSERT INTO scores (user_id, game, score) VALUES (?, ?, ?)", [userId, "wolf", 0]);
    
    console.log(`✅ Usuario registrado: ${username} (ID: ${userId}) con puntuación inicial 0`);
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(400).json({ message: "User already exists" });
  }
});

// === LOGIN DE USUARIO ===
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "7d" });
  res.json({ token, username });
});

// === GUARDAR PUNTUACIÓN ===
app.post("/api/score", authenticateToken, async (req, res) => {
  const { game, score } = req.body;
  const userId = req.user.id;
  
  // Verificar si ya existe una puntuación para este usuario y juego
  const existing = await db.get(
    "SELECT * FROM scores WHERE user_id = ? AND game = ?",
    [userId, game]
  );
  
  if (existing) {
    // Si la nueva puntuación es mayor, actualizarla
    if (score > existing.score) {
      await db.run(
        "UPDATE scores SET score = ?, created_at = datetime('now', 'localtime') WHERE user_id = ? AND game = ?",
        [score, userId, game]
      );
      console.log(`🎮 Puntuación actualizada: ${req.user.username} - ${game} - ${score} (anterior: ${existing.score})`);
      res.json({ message: "Score updated", previous: existing.score, new: score });
    } else {
      console.log(`ℹ️ Puntuación no actualizada (menor que la actual): ${req.user.username} - ${game} - ${score} <= ${existing.score}`);
      res.json({ message: "Score not updated (lower than current)", current: existing.score, attempted: score });
    }
  } else {
    // Si no existe, crear nueva entrada
    await db.run("INSERT INTO scores (user_id, game, score) VALUES (?, ?, ?)", [userId, game, score]);
    console.log(`🎮 Nueva puntuación registrada: ${req.user.username} - ${game} - ${score}`);
    res.json({ message: "Score saved" });
  }
});

// === OBTENER RANKING POR JUEGO ===
app.get("/api/scores/:game", async (req, res) => {
  const { game } = req.params;
  const scores = await db.all(
    `SELECT users.username, scores.score, scores.created_at
     FROM scores
     JOIN users ON scores.user_id = users.id
     WHERE scores.game = ?
     ORDER BY score DESC, scores.created_at ASC
     LIMIT 50`,
    [game]
  );
  res.json(scores);
});

// === OBTENER RANKING GENERAL (TODOS LOS JUEGOS) ===
app.get("/api/scores", async (req, res) => {
  const scores = await db.all(
    `SELECT users.username, scores.game, scores.score, scores.created_at
     FROM scores
     JOIN users ON scores.user_id = users.id
     ORDER BY score DESC, scores.created_at ASC
     LIMIT 50`
  );
  res.json(scores);
});

// === OBTENER ESTADÍSTICAS DE UN USUARIO ===
app.get("/api/user/:username/stats", async (req, res) => {
  const { username } = req.params;
  const stats = await db.all(
    `SELECT scores.game, scores.score, scores.created_at
     FROM scores
     JOIN users ON scores.user_id = users.id
     WHERE users.username = ?
     ORDER BY scores.game`,
    [username]
  );
  res.json(stats);
});

const PORT = 8082;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));