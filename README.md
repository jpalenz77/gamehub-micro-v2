# 🎮 GameHub - Retro Gaming Platform

**Práctica final de la edición 12 del bootcamp de DevOps de KeepCoding**

GameHub es una plataforma de juegos retro basada en microservicios que permite a los usuarios jugar juegos clásicos de DOS, guardar puntuaciones y competir en rankings globales.

---

## 🏗️ Arquitectura

### Stack Tecnológico

- **Backend**: Node.js + Express (6 microservicios)
- **Frontend**: HTML5 + JS-DOS (emulador de DOSBox en browser)
- **Bases de Datos**: 
  - PostgreSQL 15 (auth, users, scores)
  - MongoDB 7 (game catalog)
  - Redis 7 (cache + event bus)
- **API Gateway**: Kong 3.4 (DB-less mode)
- **Monitoring**: Prometheus + Grafana
- **Orquestación**: Docker Compose

### Microservicios

| Servicio | Puerto | Descripción | Base de Datos |
|----------|--------|-------------|---------------|
| **auth-service** | 3001 | Autenticación JWT | PostgreSQL (5432) |
| **user-service** | 3002 | Gestión de usuarios | PostgreSQL (5433) |
| **score-service** | 3003 | Puntuaciones | PostgreSQL (5434) |
| **ranking-service** | 3004 | Rankings con cache | Redis (6379) |
| **game-catalog-service** | 3005 | Catálogo de juegos | MongoDB (27017) |
| **frontend** | 8081 | Aplicación web | nginx |
| **games-cdn** | 8086 | CDN de archivos .jsdos | nginx |
| **kong** | 8000 | API Gateway | - |
| **prometheus** | 9090 | Métricas | - |
| **grafana** | 3000 | Dashboards | - |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker 24+
- Docker Compose 2.20+
- 4GB RAM disponible
- Puertos disponibles: 3000, 3001-3005, 5432-5434, 6379, 8000, 8081, 8086, 9090, 27017

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/jpalenz77/gamehub.git
cd gamehub

# 2. Crear archivo .env (opcional, ya hay valores por defecto)
cp .env.example .env

# 3. Levantar todos los servicios
docker compose up -d

# 4. Esperar a que todos los servicios estén healthy (2-3 minutos)
docker compose ps

# 5. Verificar que todos los contenedores estén "Up" y "healthy"
```

### Acceso

- **Frontend**: http://localhost:8081
- **API Gateway**: http://localhost:8000
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

---

## 🎮 Uso

### 1. Registro de Usuario

1. Abre http://localhost:8081
2. Haz clic en "Registrarse"
3. Completa el formulario
4. Serás redirigido automáticamente a la página de juegos

### 2. Jugar

- Selecciona un juego de la lista
- Espera a que cargue el emulador (5-10 segundos)
- Usa las teclas de dirección y CTRL/ALT para jugar
- Tu puntuación se guardará automáticamente al salir

### 3. Rankings

Los rankings se actualizan en tiempo real y se muestran en el panel derecho.

---

## 📚 Documentación Adicional

- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Arquitectura detallada del sistema
- **[COMMANDS.md](COMMANDS.md)**: Comandos útiles de Docker y debugging
- **[USER_GUIDE.md](USER_GUIDE.md)**: Guía completa del usuario
- **[GAMES_GUIDE.md](GAMES_GUIDE.md)**: Guía de controles de cada juego
- **[README_MICROSERVICES.md](README_MICROSERVICES.md)**: Documentación técnica de microservicios

---

## 🛠️ Desarrollo

### Estructura del Proyecto

```
gamehub/
├── services/                # Microservicios
│   ├── auth-service/       # Autenticación JWT
│   ├── user-service/       # Gestión de usuarios
│   ├── score-service/      # Puntuaciones
│   ├── ranking-service/    # Rankings
│   └── game-catalog-service/ # Catálogo
├── frontend/               # Aplicación web
├── infrastructure/         # Kong, Kubernetes, nginx
├── monitoring/             # Prometheus + Grafana
├── juegos/                 # Archivos .jsdos
├── shared/                 # Eventos compartidos
└── docker-compose.yml      # Orquestación

```

### Comandos Útiles

```bash
# Ver logs de un servicio
docker compose logs -f auth-service

# Reiniciar un servicio
docker compose restart auth-service

# Reconstruir un servicio
docker compose up -d --build auth-service

# Ver estado de todos los servicios
docker compose ps

# Detener todo
docker compose down

# Detener y eliminar volúmenes (reset completo)
docker compose down -v
```

### Variables de Entorno

Ver `.env.example` para la lista completa. Las principales son:

```env
# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# PostgreSQL
POSTGRES_USER=gamehub
POSTGRES_PASSWORD=gamehub_secret

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=mongo_secret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 🎯 Patrones Implementados

- **Microservicios**: Servicios independientes con responsabilidad única
- **API Gateway**: Kong como punto único de entrada
- **Event-Driven**: Redis pub/sub para eventos asíncronos
- **CQRS**: Separación de lectura (rankings) y escritura (scores)
- **Cache Distribuido**: Redis con TTL de 30 segundos
- **Circuit Breaker**: Fault tolerance en comunicación entre servicios
- **Health Checks**: Endpoints `/health` y `/ready` en todos los servicios
- **Observability**: Métricas Prometheus + Dashboards Grafana

---

---

## ☸️ Kubernetes Deployment

GameHub incluye soporte completo para Kubernetes con:
- **HPA (Horizontal Pod Autoscaler)**: Escalado automático de 1-10 réplicas por juego
- **10 deployments independientes**: Un deployment por cada juego
- **Métricas**: metrics-server para HPA basado en CPU/memoria
- **Health checks**: Liveness y readiness probes
- **Resource limits**: CPU y memoria controlados

### Prerrequisitos para Kubernetes

- Minikube 1.30+ o cualquier cluster de Kubernetes
- kubectl configurado
- 8GB RAM y 4 CPUs recomendados para Minikube
- Docker para construir imágenes

### Inicio Rápido con Minikube

```bash
# 1. Iniciar Minikube
minikube start --memory=8192 --cpus=4

# 2. Habilitar addons necesarios
minikube addons enable metrics-server
minikube addons enable ingress

# 3. Configurar Docker para usar el daemon de Minikube
eval $(minikube docker-env)

# 4. Construir imágenes
cd /mnt/c/tests/gamehub
docker build -f frontend/Dockerfile.k8s -t gamehub-frontend-full:latest .
docker build -f services/auth-service/Dockerfile -t gamehub-auth-service:latest services/auth-service/
docker build -f services/score-service/Dockerfile -t gamehub-score-service:latest services/score-service/
docker build -f services/ranking-service/Dockerfile -t gamehub-ranking-service:latest services/ranking-service/

# 5. Crear namespace
kubectl create namespace gamehub

# 6. Desplegar servicios backend (PostgreSQL, Redis, Auth, Score, Ranking)
kubectl apply -f infrastructure/kubernetes/games/backend-services.yaml

# 7. Generar deployments de juegos
cd infrastructure/kubernetes/games
chmod +x generate-game-deployments.sh
./generate-game-deployments.sh

# 8. Desplegar los 10 juegos
kubectl apply -f deployments/

# 9. Verificar que todos los pods estén corriendo
kubectl get pods -n gamehub
```

### Acceso a los Servicios

Opción 1: **Port Forwards** (desarrollo local)

```bash
# Terminal 1: Frontend
kubectl port-forward -n gamehub svc/doom-game-service 8081:8081

# Terminal 2: Auth Service
kubectl port-forward -n gamehub svc/auth-service 8000:3001

# Terminal 3: Score Service
kubectl port-forward -n gamehub svc/score-service 8003:3003

# Terminal 4: Ranking Service
kubectl port-forward -n gamehub svc/ranking-service 8004:3004
```

Luego accede a: http://localhost:8081

Opción 2: **NodePort** (Minikube)

```bash
# Obtener URL del servicio
minikube service doom-game-service -n gamehub --url
```

Opción 3: **Ingress** (producción)

```bash
# Aplicar ingress
kubectl apply -f infrastructure/kubernetes/games/simple-ingress.yaml

# Agregar a /etc/hosts
echo "$(minikube ip) gamehub.local" | sudo tee -a /etc/hosts

# Acceder
http://gamehub.local
```

### Arquitectura de Kubernetes

```
gamehub namespace
├── Backend Services
│   ├── postgres-auth (PostgreSQL 15)
│   ├── redis (Redis 7)
│   ├── auth-service (Node.js)
│   ├── score-service (Node.js)
│   └── ranking-service (Node.js)
│
└── Game Deployments (10 total)
    ├── doom-game (HPA: 1-10 replicas)
    ├── wolf-game (HPA: 1-10 replicas)
    ├── tetris-game (HPA: 1-10 replicas)
    ├── mortalkombat-game (HPA: 1-10 replicas)
    ├── dangerousdave2-game (HPA: 1-10 replicas)
    ├── digger-game (HPA: 1-10 replicas)
    ├── dukenukem3d-game (HPA: 1-10 replicas)
    ├── heroesofmightandmagic2-game (HPA: 1-10 replicas)
    ├── lostvikings-game (HPA: 1-10 replicas)
    └── streetfighter2-game (HPA: 1-10 replicas)
```

### HPA (Horizontal Pod Autoscaler)

Cada juego tiene configurado:
- **Min replicas**: 1
- **Max replicas**: 10
- **Métricas**: CPU 70%, Memoria 80%
- **Scale up**: Inmediato (100% o 2 pods cada 15s)
- **Scale down**: 5 minutos de estabilización (máx 50% cada 60s)

```bash
# Ver estado de HPA
kubectl get hpa -n gamehub

# Ver en tiempo real
kubectl get hpa -n gamehub -w
```

### Monitoreo y Testing

```bash
# Ver todos los pods
kubectl get pods -n gamehub

# Ver logs de un pod
kubectl logs -f -n gamehub <pod-name>

# Ejecutar monitor en tiempo real
cd infrastructure/kubernetes/games
./monitor-games.sh

# Generar carga para probar HPA
./load-test.sh
```

### Comandos Útiles de Kubernetes

```bash
# Ver estado de todos los recursos
kubectl get all -n gamehub

# Describir un pod
kubectl describe pod <pod-name> -n gamehub

# Ejecutar comando en un pod
kubectl exec -it -n gamehub <pod-name> -- /bin/sh

# Ver logs de múltiples pods
kubectl logs -f -n gamehub -l app=doom-game

# Reiniciar un deployment
kubectl rollout restart deployment/doom-game -n gamehub

# Ver historial de rollout
kubectl rollout history deployment/doom-game -n gamehub

# Escalar manualmente
kubectl scale deployment doom-game -n gamehub --replicas=5

# Ver métricas de recursos
kubectl top nodes
kubectl top pods -n gamehub
```

### Limpieza de Kubernetes

```bash
# Eliminar todo el namespace (cuidado!)
kubectl delete namespace gamehub

# Eliminar deployments específicos
kubectl delete -f infrastructure/kubernetes/games/deployments/

# Eliminar servicios backend
kubectl delete -f infrastructure/kubernetes/games/backend-services.yaml
```

### Detalles Técnicos

Ver [infrastructure/kubernetes/games/README.md](infrastructure/kubernetes/games/README.md) para:
- Configuración detallada de HPA
- Troubleshooting de Kubernetes
- Scripts de automatización
- Arquitectura de red y volúmenes

---

## 🐳 Docker Compose (Desarrollo Local)

## 🐳 Kubernetes (Opcional)

El proyecto incluye manifiestos de Kubernetes en `infrastructure/kubernetes/`:

```bash
# Aplicar namespace y secrets
kubectl apply -f infrastructure/kubernetes/namespace-and-secrets.yaml

# Desplegar servicios
kubectl apply -f infrastructure/kubernetes/deployments/
kubectl apply -f infrastructure/kubernetes/services/

# Aplicar ingress
kubectl apply -f infrastructure/kubernetes/ingress/
```

---

## 🔧 Troubleshooting

### Los servicios no inician

```bash
# Ver logs
docker compose logs

# Verificar puertos ocupados
netstat -tuln | grep -E "3000|3001|3002|3003|3004|3005|5432|5433|5434|6379|8000|8081|8086|9090|27017"

# Reiniciar todo
docker compose down -v
docker compose up -d
```

### Error 429 (Rate Limiting)

Los límites configurados son:
- Auth: 100 req/min
- Otros servicios: 100-200 req/min

Si necesitas más, edita `infrastructure/kong/kong.yml`

### Juegos no cargan

1. Verifica que `games-cdn` esté corriendo: `docker compose ps games-cdn`
2. Comprueba que los archivos .jsdos existan: `ls -lh juegos/`
3. Revisa logs del frontend: `docker compose logs frontend`

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---