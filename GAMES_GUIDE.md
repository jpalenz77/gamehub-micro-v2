# 🎮 GameHub - Guía de Juegos

## 📦 Tus Juegos Retro

Tienes **10 juegos clásicos DOS** en formato `.jsdos` listos para jugar:

```
/juegos/
├── dangerousdave2.jsdos      # Dangerous Dave 2 (1990) - Platformer
├── digger.jsdos               # Digger (1983) - Arcade  
├── doom.jsdos                 # DOOM (1993) - FPS
├── duke3d.jsdos               # Duke Nukem 3D (1996) - FPS
├── heroesofmightandmagic2.jsdos  # Heroes II (1996) - Strategy
├── lostvikings.jsdos          # The Lost Vikings (1992) - Puzzle
├── mortalkombat.jsdos         # Mortal Kombat (1992) - Fighting
├── streetfighter2.jsdos       # Street Fighter II (1991) - Fighting
├── tetris.jsdos               # Tetris (1984) - Puzzle
└── wolf.jsdos                 # Wolfenstein 3D (1992) - FPS
```

---

## 🏗️ Arquitectura de Juegos

### 1. **Almacenamiento de Archivos .jsdos**
- **Ubicación:** `/juegos/` (carpeta en el host)
- **Servido por:** `games-cdn` (nginx)
- **Puerto:** 8086
- **URL Local:** `http://localhost:8086/juegos/[nombre].jsdos`

### 2. **Catálogo de Juegos (Metadata)**
- **Base de Datos:** MongoDB (`gamehub-catalog-db`)
- **Microservicio:** `game-catalog-service` (puerto 3005)
- **Datos:** Nombre, descripción, año, desarrollador, tags, controles
- **API:** `http://localhost:8000/api/games`

### 3. **Emulador JS-DOS**
- **Frontend:** `/frontend/jsdos/` - Emulador de DOSBox en JavaScript
- **Archivos:**
  - `js-dos.js` - Core del emulador
  - `wdosbox.js` - DOSBox compilado a WebAssembly
  - `emulators/` - Diferentes versiones del emulador

---

## 🎯 Flujo de Juego

```
1. Usuario abre: http://localhost:8081/games.html
                          ↓
2. Frontend carga lista de juegos desde API:
   GET http://localhost:8000/api/games
                          ↓
3. Usuario selecciona un juego (ej: DOOM)
                          ↓
4. Frontend descarga el archivo desde CDN:
   GET http://localhost:8086/juegos/doom.jsdos
                          ↓
5. JS-DOS emula DOSBox y ejecuta el juego
                          ↓
6. Al terminar, guarda score (si auth):
   POST http://localhost:8000/api/scores
   {
     "game": "doom",
     "score": 15000
   }
                          ↓
7. Actualiza ranking en tiempo real:
   GET http://localhost:8000/api/rankings/games/doom
```

---

## 🚀 Agregar Nuevos Juegos

### Paso 1: Agregar archivo .jsdos
```bash
# Copiar el nuevo juego a la carpeta
cp mi-nuevo-juego.jsdos /mnt/c/tests/gamehub/juegos/

# Verificar permisos
chmod 644 /mnt/c/tests/gamehub/juegos/mi-nuevo-juego.jsdos
```

### Paso 2: Actualizar el catálogo en MongoDB
```bash
# Conectar a MongoDB
docker exec -it gamehub-catalog-db mongosh gamehub_catalog

# Insertar el nuevo juego
db.games.insertOne({
  slug: "mi-juego",
  name: "Mi Juego Retro",
  description: "Descripción del juego",
  thumbnail: "/img/mi-juego-thumb.jpg",
  file_url: "/mi-nuevo-juego.jsdos",
  year: 1995,
  developer: "Developer Name",
  tags: ["action", "platformer"],
  controls: {
    movement: "Arrow keys",
    jump: "SPACE",
    action: "CTRL"
  }
});
```

### Paso 3: Actualizar el frontend
```javascript
// En frontend/games.html, agregar al objeto JUEGOS_RUTAS:
const JUEGOS_RUTAS = {
    // ... juegos existentes ...
    "mi-juego": `${CDN_URL}/mi-nuevo-juego.jsdos`
};
```

### Paso 4: Reiniciar frontend
```bash
docker-compose restart frontend
```

---

## 🎮 URLs de Acceso

### Para Jugadores
- **Página Principal:** http://localhost:8081
- **Selector de Juegos:** http://localhost:8081/games.html
- **Ver Rankings:** Los rankings aparecen en la misma página de juegos

### Para Desarrolladores
- **API Catálogo:** http://localhost:8000/api/games
- **API Ranking:** http://localhost:8000/api/rankings/games/doom
- **CDN de Juegos:** http://localhost:8086/juegos/
- **Grafana:** http://localhost:3000 (admin/admin)
- **Prometheus:** http://localhost:9090

---

## 🔧 Troubleshooting

### El juego no carga
```bash
# 1. Verificar que el archivo existe
ls -lh /mnt/c/tests/gamehub/juegos/doom.jsdos

# 2. Verificar que el CDN está corriendo
curl http://localhost:8086/juegos/doom.jsdos -I

# 3. Ver logs del CDN
docker-compose logs games-cdn

# 4. Verificar permisos
chmod 644 /mnt/c/tests/gamehub/juegos/*.jsdos
```

### El juego no aparece en la lista
```bash
# 1. Verificar que está en MongoDB
docker exec gamehub-catalog-db mongosh gamehub_catalog \
  --eval "db.games.find({slug: 'doom'})"

# 2. Verificar la API
curl http://localhost:8000/api/games/doom

# 3. Ver logs del catalog-service
docker-compose logs game-catalog-service
```

### CORS errors
```bash
# Verificar configuración de CORS en Kong
curl http://localhost:8001/plugins | grep cors

# Reiniciar Kong si es necesario
docker-compose restart kong
```

---

## 📊 Scoring System

### Guardar Score (requiere login)
```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"secret123"}' \
  | jq -r '.accessToken')

# 2. Guardar score
curl -X POST http://localhost:8000/api/scores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "game": "doom",
    "score": 15000
  }'
```

### Ver Rankings (público)
```bash
# Top 50 de un juego
curl http://localhost:8000/api/rankings/games/doom

# Top 50 de un juego con límite
curl http://localhost:8000/api/rankings/games/doom?limit=10

# Ranking global (todos los juegos)
curl http://localhost:8000/api/rankings/global

# Stats de un jugador
curl http://localhost:8000/api/rankings/users/player1/stats
```

---

## 🎯 Características del Sistema

### ✅ Lo que está funcionando:
- ✅ 10 juegos retro listos para jugar
- ✅ Emulador JS-DOS integrado
- ✅ CDN optimizado (nginx) en puerto 8086
- ✅ Catálogo de juegos en MongoDB
- ✅ Sistema de autenticación (JWT)
- ✅ Guardado de scores con historial
- ✅ Rankings en tiempo real con cache (Redis)
- ✅ API Gateway (Kong) con rate limiting
- ✅ Monitoring (Prometheus + Grafana)

### 🔄 Event-Driven Features:
- Cuando guardas un score, se dispara un evento
- El ranking-service escucha y invalida su cache
- Los rankings se actualizan en tiempo real
- El user-service actualiza estadísticas del jugador

---

## 📝 Formato .jsdos

Los archivos `.jsdos` son archivos ZIP que contienen:
```
mi-juego.jsdos (ZIP):
├── .jsdos (metadata JSON)
└── game/ (archivos del juego DOS)
    ├── game.exe
    ├── data/
    └── ...
```

Para crear uno nuevo:
```bash
# 1. Organizar archivos del juego DOS
mkdir game
cp mi-juego.exe game/
cp -r data/ game/

# 2. Crear metadata
echo '{"version": "2.0"}' > .jsdos

# 3. Crear ZIP
zip -r mi-juego.jsdos .jsdos game/
```

---

## 🎨 Thumbnails (Opcional)

Si quieres agregar miniaturas de los juegos:
```bash
# Copiar imágenes a frontend/img/
cp doom-thumb.jpg /mnt/c/tests/gamehub/frontend/img/

# Actualizar MongoDB
db.games.updateOne(
  {slug: "doom"},
  {$set: {thumbnail: "/img/doom-thumb.jpg"}}
);

# Rebuild frontend
docker-compose up -d --build frontend
```

---

**🎮 ¡Disfruta tus juegos retro con arquitectura de microservicios moderna!**
