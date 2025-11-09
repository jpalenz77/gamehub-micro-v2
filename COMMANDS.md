# 🛠️ GameHub - Comandos Útiles

Referencia rápida de comandos para desarrollo, operación y troubleshooting.

---

## 🚀 Inicio Rápido

```bash
# Setup completo (primera vez)
./setup.sh

# Iniciar todos los servicios
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Parar todo
docker-compose down

# Parar y limpiar (BORRA DATOS)
docker-compose down -v
```

---

## 🔍 Logs y Debugging

```bash
# Logs de un servicio específico
docker-compose logs -f auth-service
docker-compose logs -f ranking-service

# Últimas 100 líneas
docker-compose logs --tail=100 score-service

# Logs con timestamps
docker-compose logs -f --timestamps

# Logs de múltiples servicios
docker-compose logs -f auth-service user-service

# Buscar en logs
docker-compose logs | grep "ERROR"
docker-compose logs auth-service | grep "JWT"

# Logs en Kubernetes
kubectl logs -f deployment/auth-service -n gamehub
kubectl logs -f deployment/ranking-service -n gamehub --tail=50
```

---

## 🏥 Health Checks

```bash
# Check individual services
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # User
curl http://localhost:3003/health  # Score
curl http://localhost:3004/health  # Ranking
curl http://localhost:3005/health  # Game Catalog
curl http://localhost:8000/health  # Kong

# Check all at once
for port in 3001 3002 3003 3004 3005 8000; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/health | jq -r '.status' || echo "FAIL"
done

# Kubernetes health checks
kubectl get pods -n gamehub
kubectl describe pod <pod-name> -n gamehub
```

---

## 📊 Métricas

```bash
# Ver métricas de Prometheus
curl http://localhost:3001/metrics  # Auth Service
curl http://localhost:3004/metrics  # Ranking Service
curl http://localhost:8001/metrics  # Kong

# Top queries en Prometheus UI
# http://localhost:9090
# Queries útiles:
rate(http_requests_total[5m])
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
up{job="auth-service"}

# Grafana dashboards
# http://localhost:3000 (admin/admin)
```

---

## 🗄️ Base de Datos

### PostgreSQL

```bash
# Conectar a Auth DB
docker-compose exec auth-db psql -U auth_user -d auth_db

# Queries útiles
SELECT COUNT(*) FROM users_auth;
SELECT * FROM users_auth ORDER BY created_at DESC LIMIT 10;
SELECT * FROM refresh_tokens WHERE expires_at > NOW();

# Conectar a Score DB
docker-compose exec score-db psql -U score_user -d score_db

# Ver top scores
SELECT username, game, score FROM scores ORDER BY score DESC LIMIT 20;

# Stats por juego
SELECT game, COUNT(*) as players, MAX(score) as top_score, AVG(score) as avg_score 
FROM scores 
GROUP BY game;

# Backup
docker-compose exec auth-db pg_dump -U auth_user auth_db > backup_auth.sql
docker-compose exec score-db pg_dump -U score_user score_db > backup_score.sql

# Restore
cat backup_auth.sql | docker-compose exec -T auth-db psql -U auth_user -d auth_db
```

### MongoDB

```bash
# Conectar a MongoDB
docker-compose exec game-catalog-db mongosh gamehub_catalog

# Queries útiles
db.games.find().pretty()
db.games.countDocuments()
db.games.find({tags: "fps"})
db.games.find({year: {$gte: 1990, $lte: 1995}})

# Backup
docker-compose exec game-catalog-db mongodump --db gamehub_catalog --out /backup

# Restore
docker-compose exec game-catalog-db mongorestore --db gamehub_catalog /backup/gamehub_catalog
```

### Redis

```bash
# Conectar a Redis
docker-compose exec redis redis-cli

# Queries útiles
KEYS *
GET ranking:doom:50
TTL ranking:doom:50
LLEN events:score.created
LPOP events:score.created

# Ver stats
INFO stats
INFO memory
INFO clients

# Flush cache (CAUTION!)
FLUSHDB
```

---

## 🔧 Desarrollo

```bash
# Rebuild un servicio específico
docker-compose up -d --build auth-service

# Rebuild sin cache
docker-compose build --no-cache auth-service

# Ver variables de entorno
docker-compose exec auth-service env

# Ejecutar comando en contenedor
docker-compose exec auth-service sh
docker-compose exec auth-service npm test

# Copiar archivos desde/hacia contenedor
docker cp auth-service:/app/logs/error.log ./logs/
docker cp ./new-config.json auth-service:/app/config/

# Hot reload en desarrollo
cd services/auth-service
npm run dev  # watch mode
```

---

## 🧪 Testing

```bash
# Unit tests por servicio
cd services/auth-service && npm test
cd services/score-service && npm test

# Integration tests
./scripts/integration-test.sh

# Load testing con Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/rankings/games/doom

# Load testing con wrk
wrk -t4 -c100 -d30s http://localhost:8000/api/rankings/games/doom
```

---

## 🔐 Autenticación

```bash
# Registrar usuario
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@example.com"}'

# Login y guardar token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  | jq -r '.accessToken')

echo $TOKEN

# Verificar token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/auth/verify

# Usar token en requests
curl -X POST http://localhost:8000/api/scores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"game":"doom","score":15000}'
```

---

## 📈 API Testing

```bash
# Auth endpoints
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"secret123"}'

curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"secret123"}'

# User endpoints
curl http://localhost:8000/api/users/1
curl http://localhost:8000/api/users/username/player1
curl http://localhost:8000/api/users/leaderboard

# Score endpoints (requires auth)
curl -X POST http://localhost:8000/api/scores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"game":"doom","score":15000}'

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/scores/user/1

# Ranking endpoints (public)
curl http://localhost:8000/api/rankings/games/doom
curl http://localhost:8000/api/rankings/games/doom?limit=10
curl http://localhost:8000/api/rankings/global
curl http://localhost:8000/api/rankings/users/player1/stats

# Game Catalog endpoints
curl http://localhost:8000/api/games
curl http://localhost:8000/api/games/doom
curl "http://localhost:8000/api/games/search?q=doom"
curl http://localhost:8000/api/games/tags/fps
curl http://localhost:8000/api/tags
```

---

## 🎛️ Kong API Gateway

```bash
# Kong Admin API
curl http://localhost:8001/status
curl http://localhost:8001/services
curl http://localhost:8001/routes
curl http://localhost:8001/plugins

# Ver configuración de rate limiting
curl http://localhost:8001/plugins | jq '.data[] | select(.name=="rate-limiting")'

# Ver métricas de Kong
curl http://localhost:8001/metrics

# Reload configuración
docker-compose restart kong
```

---

## 🔄 Escalado

```bash
# Docker Compose - escalar servicios
docker-compose up -d --scale ranking-service=5
docker-compose up -d --scale score-service=3

# Ver instancias
docker-compose ps

# Kubernetes - escalar deployments
kubectl scale deployment ranking-service --replicas=5 -n gamehub
kubectl scale deployment auth-service --replicas=3 -n gamehub

# Auto-scaling (HPA)
kubectl autoscale deployment ranking-service \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n gamehub

# Ver HPA status
kubectl get hpa -n gamehub
kubectl describe hpa ranking-service-hpa -n gamehub
```

---

## 🐛 Troubleshooting

```bash
# Servicios no inician - ver dependencias
docker-compose ps
docker-compose logs <failing-service>

# Puerto ocupado
sudo lsof -i :8000
sudo kill -9 <PID>

# Base de datos no conecta
docker-compose exec auth-db pg_isready -U auth_user
docker-compose restart auth-db

# Redis no funciona
docker-compose exec redis redis-cli PING
docker-compose restart redis

# Kong no arranca
docker-compose logs kong-migrations
docker-compose run --rm kong-migrations
docker-compose up -d kong

# Cache no se invalida
docker-compose logs ranking-service | grep "cache"
docker-compose exec redis redis-cli KEYS "ranking:*"
docker-compose exec redis redis-cli FLUSHDB

# Memory/CPU issues
docker stats

# Ver recursos por servicio
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Disk space
docker system df
docker system prune -a  # CAUTION: removes everything not in use!
```

---

## 📦 Kubernetes

```bash
# Deploy completo
kubectl apply -f infrastructure/kubernetes/namespace-and-secrets.yaml
kubectl apply -f infrastructure/kubernetes/deployments/
kubectl apply -f infrastructure/kubernetes/services/
kubectl apply -f infrastructure/kubernetes/ingress/

# Ver recursos
kubectl get all -n gamehub
kubectl get pods -n gamehub -o wide
kubectl get svc -n gamehub
kubectl get ingress -n gamehub

# Logs
kubectl logs -f deployment/auth-service -n gamehub
kubectl logs -f pod/<pod-name> -n gamehub

# Exec into pod
kubectl exec -it <pod-name> -n gamehub -- sh

# Port forward (desarrollo local)
kubectl port-forward svc/auth-service 3001:3001 -n gamehub
kubectl port-forward svc/kong-proxy 8000:8000 -n gamehub

# Describe para debugging
kubectl describe pod <pod-name> -n gamehub
kubectl describe deployment auth-service -n gamehub

# Ver eventos
kubectl get events -n gamehub --sort-by='.lastTimestamp'

# Rollout
kubectl rollout status deployment/auth-service -n gamehub
kubectl rollout restart deployment/auth-service -n gamehub
kubectl rollout undo deployment/auth-service -n gamehub

# Secrets
kubectl get secrets -n gamehub
kubectl describe secret jwt-secret -n gamehub
kubectl create secret generic new-secret --from-literal=key=value -n gamehub
```

---

## 🔄 CI/CD

```bash
# Build images
docker build -t gamehub/auth-service:v1.0.0 services/auth-service
docker build -t gamehub/ranking-service:v1.0.0 services/ranking-service

# Tag images
docker tag gamehub/auth-service:v1.0.0 registry.example.com/gamehub/auth-service:v1.0.0

# Push to registry
docker push registry.example.com/gamehub/auth-service:v1.0.0

# Deploy nueva versión
kubectl set image deployment/auth-service \
  auth-service=registry.example.com/gamehub/auth-service:v1.0.0 \
  -n gamehub

# Verificar rollout
kubectl rollout status deployment/auth-service -n gamehub
```

---

## 📊 Monitoring

```bash
# Prometheus queries (en UI http://localhost:9090)
# CPU usage
rate(process_cpu_user_seconds_total[5m])

# Memory usage
process_resident_memory_bytes

# HTTP request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Latency p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Cache hit rate
rate(redis_cache_hits[5m]) / (rate(redis_cache_hits[5m]) + rate(redis_cache_misses[5m]))
```

---

## 🔒 Seguridad

```bash
# Generar JWT secret fuerte
openssl rand -base64 32

# Generar password hash (para testing)
docker-compose exec auth-service node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('mypassword', 10).then(console.log);
"

# Verificar SSL/TLS
openssl s_client -connect api.gamehub.example.com:443

# Scan de vulnerabilidades
docker scan gamehub/auth-service:latest

# Audit de dependencias
cd services/auth-service && npm audit
npm audit fix
```

---

## 🧹 Limpieza

```bash
# Limpiar todo (Docker)
./cleanup.sh

# Limpiar volúmenes huérfanos
docker volume prune

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar sistema completo
docker system prune -a --volumes

# Limpiar Kubernetes namespace
kubectl delete namespace gamehub
```

---

## 📝 Variables de Entorno

```bash
# Ver .env actual
cat .env

# Editar .env
nano .env

# Reload servicios con nuevas env vars
docker-compose up -d --force-recreate
```

---

## 🎯 Performance Testing

```bash
# Test de carga con k6
k6 run --vus 100 --duration 30s tests/load-test.js

# Apache Bench
ab -n 10000 -c 100 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/rankings/games/doom

# wrk benchmark
wrk -t4 -c100 -d30s --latency http://localhost:8000/api/rankings/games/doom
```

---

**💡 Tip:** Crea aliases para los comandos más usados en tu `~/.bashrc` o `~/.zshrc`:

```bash
alias gh-up='docker-compose up -d'
alias gh-down='docker-compose down'
alias gh-logs='docker-compose logs -f'
alias gh-ps='docker-compose ps'
alias gh-restart='docker-compose restart'
```
