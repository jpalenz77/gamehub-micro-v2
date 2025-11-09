# 🎮 GameHub - Microservices Architecture

Sistema de retro gaming con arquitectura de microservicios escalable, desplegable en Docker Compose y Kubernetes.

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Inicio Rápido](#-inicio-rápido)
- [Servicios](#-servicios)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Monitorización](#-monitorización)
- [API Documentation](#-api-documentation)

---

## 🏗️ Arquitectura

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│          API Gateway (Kong)                 │
│    Rate Limiting · CORS · Auth Proxy        │
└──────┬────────────────────────────────┬─────┘
       │                                │
       ▼                                ▼
┌──────────────┐                 ┌──────────────┐
│ Auth Service │◄───────────────►│ User Service │
│  (Node.js)   │   Events via    │  (Node.js)   │
│  PostgreSQL  │     Redis       │  PostgreSQL  │
└──────────────┘                 └──────────────┘
       │
       ▼
┌──────────────┐                 ┌────────────────┐
│Score Service │◄───────────────►│Ranking Service │
│  (Node.js)   │   Cache Inval.  │   (Node.js)    │
│  PostgreSQL  │                 │Redis Cache (30s)│
└──────────────┘                 └────────────────┘
       │
       ▼
┌────────────────────┐
│Game Catalog Service│
│     (Node.js)      │
│     MongoDB        │
└────────────────────┘
```

### Componentes Principales

| Componente | Tecnología | Responsabilidad |
|------------|-----------|-----------------|
| **API Gateway** | Kong | Enrutamiento, rate limiting, CORS |
| **Auth Service** | Node.js + PostgreSQL | Autenticación JWT |
| **User Service** | Node.js + PostgreSQL | Perfiles de usuario |
| **Score Service** | Node.js + PostgreSQL | Registro de puntuaciones |
| **Ranking Service** | Node.js + Redis + PostgreSQL | Rankings con caché |
| **Game Catalog** | Node.js + MongoDB | Catálogo de juegos |
| **Frontend** | HTML/JS + Nginx | Aplicación web |
| **Games CDN** | Nginx | Archivos .jsdos estáticos |

---

## 🛠️ Tecnologías

**Backend:**
- Node.js 20 (ES Modules)
- Express.js
- PostgreSQL 15
- MongoDB 7
- Redis 7
- Kong API Gateway 3.4

**Frontend:**
- HTML5 / CSS3 / JavaScript
- js-dos (DOSBox emulator)
- Nginx

**DevOps:**
- Docker & Docker Compose
- Kubernetes
- Prometheus + Grafana
- GitHub Actions (CI/CD)

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Docker 24+ y Docker Compose 2.20+
- Node.js 20+ (para desarrollo local)
- 8GB RAM mínimo
- Puertos disponibles: 3000-3005, 5432-5434, 6379, 8000-8002, 8081, 8085, 9090, 27017

### Instalación con Docker Compose

```bash
# 1. Clonar el repositorio
git clone https://github.com/jpalenz77/gamehub.git
cd gamehub

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env y cambiar JWT_SECRET y contraseñas

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Verificar estado de los servicios
docker-compose ps

# 5. Ver logs
docker-compose logs -f
```

**Servicios disponibles:**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:8081 | Aplicación web |
| API Gateway | http://localhost:8000 | Kong proxy |
| Kong Admin | http://localhost:8001 | Kong admin API |
| Prometheus | http://localhost:9090 | Métricas |
| Grafana | http://localhost:3000 | Dashboards (admin/admin) |
| Games CDN | http://localhost:8086 | Archivos de juegos |

### Health Checks

```bash
# Health de todos los servicios
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # User
curl http://localhost:3003/health  # Score
curl http://localhost:3004/health  # Ranking
curl http://localhost:3005/health  # Game Catalog
curl http://localhost:8000/health  # Kong

# Métricas Prometheus
curl http://localhost:3001/metrics
```

---

## 📦 Servicios

### 1. Auth Service (Puerto 3001)

**Endpoints:**
```
POST   /api/auth/register      - Registrar usuario
POST   /api/auth/login         - Login (devuelve JWT)
POST   /api/auth/refresh       - Refrescar access token
POST   /api/auth/logout        - Logout
GET    /api/auth/verify        - Verificar token
GET    /api/auth/me            - Info del usuario actual
```

**Ejemplo:**
```bash
# Registro
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"secret123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"secret123"}'
```

### 2. User Service (Puerto 3002)

**Endpoints:**
```
GET    /api/users/:id               - Obtener perfil
GET    /api/users/username/:name    - Buscar por username
PUT    /api/users/:id               - Actualizar perfil
GET    /api/users/:id/stats         - Estadísticas
GET    /api/users/leaderboard       - Top usuarios
```

### 3. Score Service (Puerto 3003)

**Endpoints:**
```
POST   /api/scores                  - Guardar puntuación
GET    /api/scores/user/:userId     - Puntuaciones de usuario
GET    /api/scores/user/:userId/game/:game - Puntuación específica
```

**Ejemplo:**
```bash
# Guardar puntuación (requiere JWT)
curl -X POST http://localhost:8000/api/scores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"game":"doom","score":15000}'
```

### 4. Ranking Service (Puerto 3004)

**Endpoints:**
```
GET    /api/rankings/games/:game           - Ranking por juego
GET    /api/rankings/global                - Ranking global
GET    /api/rankings/games/:game/user/:id  - Posición de usuario
GET    /api/rankings/users/:username/stats - Stats de usuario
GET    /api/rankings/games/:game/stats     - Stats del juego
```

**Cache:** Redis con TTL de 30 segundos para rankings hot.

### 5. Game Catalog Service (Puerto 3005)

**Endpoints:**
```
GET    /api/games              - Listar todos los juegos
GET    /api/games/:slug        - Detalle de juego
GET    /api/games/search?q=    - Buscar juegos
GET    /api/games/tags/:tag    - Filtrar por tag
GET    /api/tags               - Listar tags
```

---

## 💻 Desarrollo

### Desarrollo Local (sin Docker)

**1. Levantar bases de datos:**
```bash
docker-compose up -d auth-db user-db score-db game-catalog-db redis
```

**2. Auth Service:**
```bash
cd services/auth-service
cp .env.example .env
npm install
npm run dev
```

**3. Otros servicios:** Repetir para cada servicio.

### Estructura del Proyecto

```
gamehub/
├── services/                    # Microservicios
│   ├── auth-service/
│   ├── user-service/
│   ├── score-service/
│   ├── ranking-service/
│   └── game-catalog-service/
├── frontend/                    # Frontend web
├── infrastructure/              # Configuración de infraestructura
│   ├── kong/                   # Kong API Gateway
│   ├── kubernetes/             # Manifests K8s
│   └── nginx/                  # Nginx configs
├── monitoring/                  # Prometheus + Grafana
├── shared/                      # Código compartido
├── juegos/                      # Archivos .jsdos
└── docker-compose.yml          # Orquestación Docker
```

### Testing

```bash
# Dentro de cada servicio
npm test

# Prueba de integración
./scripts/integration-test.sh
```

---

## 🚢 Despliegue

### Docker Compose (Producción)

```bash
# Despliegue con SSL y variables de producción
JWT_SECRET=<strong-secret> docker-compose up -d

# Escalar servicios específicos
docker-compose up -d --scale ranking-service=5
```

### Kubernetes

```bash
# 1. Crear namespace y secrets
kubectl apply -f infrastructure/kubernetes/namespace-and-secrets.yaml

# 2. Desplegar bases de datos (StatefulSets)
kubectl apply -f infrastructure/kubernetes/statefulsets/

# 3. Desplegar microservicios
kubectl apply -f infrastructure/kubernetes/deployments/

# 4. Crear services
kubectl apply -f infrastructure/kubernetes/services/

# 5. Configurar Ingress
kubectl apply -f infrastructure/kubernetes/ingress/

# Verificar estado
kubectl get pods -n gamehub
kubectl get svc -n gamehub
kubectl get ingress -n gamehub
```

### CI/CD con GitHub Actions

El proyecto incluye workflows para:
- Build y test automático en PR
- Deploy automático a staging en merge a `develop`
- Deploy a producción en tag `v*`

---

## 📊 Monitorización

### Prometheus

**Acceso:** http://localhost:9090

**Métricas disponibles:**
- Latencia de requests HTTP
- Throughput por endpoint
- Errores 4xx/5xx
- Uso de CPU/memoria por servicio
- Cache hit rate (Redis)
- Connection pool status (PostgreSQL)

### Grafana

**Acceso:** http://localhost:3000 (admin/admin)

**Dashboards incluidos:**
- Overview del sistema
- Métricas por microservicio
- API Gateway (Kong)
- Base de datos
- Cache Redis

### Logs

```bash
# Ver logs de un servicio específico
docker-compose logs -f auth-service

# Logs agregados
docker-compose logs -f

# Kubernetes
kubectl logs -f deployment/auth-service -n gamehub
```

---

## 📖 API Documentation

### Autenticación

Todos los endpoints protegidos requieren JWT en el header:

```
Authorization: Bearer <access_token>
```

### Rate Limiting (Kong)

| Endpoint | Límite |
|----------|--------|
| `/api/auth/*` | 20 req/min |
| `/api/scores` (POST) | 100 req/min |
| `/api/rankings/*` | 200 req/min |
| Otros | 100 req/min |

### Códigos de Respuesta

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (token inválido) |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 🔐 Seguridad

- **JWT con refresh tokens**: Access tokens de corta duración (15min)
- **Bcrypt**: Hash de passwords con 10 rounds
- **Rate limiting**: Kong protege contra DDoS
- **CORS**: Configurado en API Gateway
- **Helmet.js**: Headers de seguridad HTTP
- **Secrets externos**: Variables sensibles en .env

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte del Bootcamp DevOps de KeepCoding - Edición 12.

---

## 👥 Autor

**José Pablo Alenzuela**  
GitHub: [@jpalenz77](https://github.com/jpalenz77)

---

## 🙏 Agradecimientos

- KeepCoding Bootcamp DevOps
- js-dos project
- Kong API Gateway
- Comunidad de código abierto

---

## 📞 Soporte

- Issues: https://github.com/jpalenz77/gamehub/issues
- Email: [tu-email]

---

**¡Disfruta jugando a los clásicos! 🎮🕹️**
