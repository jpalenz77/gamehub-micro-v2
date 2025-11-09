# 🎮 GameHub - Guía de Usuario

## 📋 Inicio Rápido

### 1️⃣ Acceder a GameHub
Abre tu navegador en: **http://localhost:8081**

### 2️⃣ Crear una Cuenta
1. Haz clic en **"Registrarse"**
2. Completa el formulario:
   - **Usuario**: Elige un nombre único
   - **Email**: Tu correo electrónico
   - **Contraseña**: Mínimo 6 caracteres
3. Haz clic en **"Registrarse"**
4. Serás redirigido automáticamente a la página de juegos

### 3️⃣ Iniciar Sesión
1. Introduce tu **usuario** y **contraseña**
2. Haz clic en **"Iniciar Sesión"**
3. Serás redirigido a la página de juegos con tu sesión activa

---

## 🎯 Jugar

### Seleccionar un Juego
- Haz clic en cualquier tarjeta de juego de la lista
- El juego se cargará en el emulador JS-DOS
- **Espera a que cargue completamente** (puede tardar 5-10 segundos)

### Controles Generales
| Tecla | Acción |
|-------|--------|
| **↑ ↓ ← →** | Movimiento |
| **CTRL** | Disparar / Acción primaria |
| **ALT** | Acción secundaria |
| **ESPACIO** | Usar / Abrir puertas |
| **SHIFT** | Correr (mantener presionado) |
| **1-7** | Cambiar arma (FPS) |
| **ESC** | Menú del juego |
| **F11** | Pantalla completa |

### Capturar el Ratón
- Algunos juegos requieren que **hagas clic dentro del juego** para capturar el ratón
- Para liberar el ratón, presiona **ESC**

---

## 🏆 Puntuaciones y Rankings

### ✅ Guardar Puntuaciones
Para que tus puntuaciones se guarden **DEBES estar logueado**:
- ✅ **Usuario logueado** → Las puntuaciones se guardan automáticamente
- ❌ **Sin login** → Puedes jugar, pero NO se guardan puntuaciones

### 📊 Ver Rankings
Los rankings se muestran en el panel derecho:
- **Top 10** de cada juego
- Se actualiza automáticamente al guardar puntuaciones
- Haz clic en las pestañas para cambiar entre juegos

### 🏅 Sistema de Puntuación
El sistema calcula automáticamente tu puntuación basándose en:
- **Tiempo jugado**
- **Acciones realizadas** (disparos, movimientos, etc.)
- **Eventos del juego** (enemigos eliminados, objetos recogidos)

Si jugaste **menos de 30 segundos**, el sistema te pedirá introducir tu puntuación manualmente.

---

## 🔧 Cambiar de Juego

### Método Recomendado
1. **Cierra el juego actual** presionando **ESC** y seleccionando "Quit" o "Exit"
2. Haz clic en otro juego de la lista
3. Espera a que cargue el nuevo juego

### ⚠️ Si Encuentras Errores
**Error:** "Not a zip archive" o "Unable to add .jsdos/jsdos.json"
- **Causa:** JS-DOS no limpió correctamente el juego anterior
- **Solución:** Recarga la página (**F5** o **CTRL+R**)

**Error:** "403 Forbidden" al guardar puntuaciones
- **Causa:** Tu sesión expiró (tokens válidos por 15 minutos)
- **Solución:** Inicia sesión nuevamente desde http://localhost:8081

---

## 🎮 Juegos Disponibles

| Juego | Género | Controles Especiales |
|-------|--------|---------------------|
| **DOOM** | FPS | 1-7 para armas, CTRL para disparar |
| **Wolfenstein 3D** | FPS | CTRL para disparar, ESPACIO para puertas |
| **Duke Nukem 3D** | FPS | CTRL disparo, ALT saltar |
| **Mortal Kombat** | Lucha | ↑↓←→ + CTRL/ALT para combos |
| **Street Fighter II** | Lucha | Combos con direcciones + botones |
| **Tetris** | Puzzle | ↑ rotar, ↓ bajar rápido |
| **The Lost Vikings** | Puzzle/Plataforma | ESPACIO cambiar personaje |
| **Heroes of Might & Magic II** | Estrategia | Ratón + teclado |
| **Digger** | Arcade | ↑↓←→ movimiento, ESPACIO disparar |
| **Dangerous Dave 2** | Plataforma | CTRL saltar, ↑↓←→ movimiento |

---

## 🚪 Cerrar Sesión
1. Haz clic en **"Cerrar Sesión"** (esquina superior derecha)
2. Serás redirigido a la página de login
3. Tus datos de sesión se borrarán

---

## 🐛 Problemas Comunes

### El juego no carga
✅ **Solución:**
1. Espera 10-15 segundos (algunos juegos son grandes)
2. Si sigue sin cargar, recarga la página (**F5**)
3. Verifica que el servicio games-cdn esté corriendo: `docker ps | grep games-cdn`

### No puedo mover el personaje
✅ **Solución:**
1. Haz **clic dentro del área del juego** para capturar el foco
2. Algunos juegos requieren capturar el ratón (clic dentro del juego)

### Las puntuaciones no se guardan
✅ **Solución:**
1. **Verifica que estés logueado** (debe aparecer tu usuario arriba)
2. Si tu sesión expiró, vuelve a iniciar sesión
3. Verifica que el servicio score-service esté corriendo: `docker ps | grep score-service`

### Error al cambiar de juego
✅ **Solución:**
1. **Cierra el juego actual correctamente** (ESC → Quit)
2. Si persiste, **recarga la página** (**F5**)
3. El sistema ahora previene cargas múltiples simultáneas

---

## 📞 Soporte Técnico

### Verificar Estado de Servicios
```bash
cd /mnt/c/tests/gamehub
docker compose ps
```

Todos los servicios deben estar **Up** y **healthy**.

### Logs de Servicios
```bash
# Ver logs del frontend
docker compose logs -f frontend

# Ver logs del API Gateway (Kong)
docker compose logs -f kong

# Ver logs de autenticación
docker compose logs -f auth-service

# Ver logs de puntuaciones
docker compose logs -f score-service
```

### Reiniciar Servicios
```bash
# Reiniciar todo
docker compose restart

# Reiniciar solo un servicio
docker compose restart frontend
```

---

## 🎉 ¡Disfruta Jugando!

GameHub es un proyecto de demostración de arquitectura de microservicios con juegos retro clásicos. 

**¡Diviértete y compite por el #1 en los rankings! 🏆**
