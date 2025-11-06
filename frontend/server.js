import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Servir todos los archivos estáticos
app.use(express.static(__dirname));

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`🎮 Frontend running at http://localhost:${PORT}`);
});
