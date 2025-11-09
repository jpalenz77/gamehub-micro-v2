# GitHub Actions CI/CD

Este directorio contiene los workflows de CI/CD para GameHub.

## 📋 Workflows

### 1. CI - Tests and Build (`ci.yml`)

**Trigger:** Push a `main`, `develop`, `kubernetes-with-hpa` o Pull Requests

**Jobs:**
- **test-backend-services**: Ejecuta tests unitarios para auth, score y ranking services
  - Setup de PostgreSQL y Redis
  - Ejecución de linter
  - Cobertura de código con Codecov
  
- **test-frontend**: Valida el frontend
  - Linter
  - Audit de seguridad (npm audit)
  
- **build-images**: Construye imágenes Docker
  - auth-service, score-service, ranking-service
  - frontend-production, cdn
  - Push a GitHub Container Registry (ghcr.io)
  - Cache con GitHub Actions Cache
  
- **integration-tests**: Tests de integración en Minikube (solo en main)
  - Despliega toda la arquitectura
  - Verifica health endpoints
  - Tests de smoke
  
- **notify**: Notifica el resultado del CI

### 2. CD - Deploy to Kubernetes (`deploy.yml`)

**Trigger:** 
- Push a `main`
- Tags `v*`
- Manual dispatch

**Features:**
- Deploy automático a staging/production
- Soporte para AWS EKS
- Update de image tags dinámico
- Rollout verification
- Smoke tests post-deployment

## 🚀 Uso

### Ejecutar tests localmente

```bash
# Auth service
cd services/auth-service
npm install
npm test

# Score service
cd services/score-service
npm install
npm test

# Ranking service
cd services/ranking-service
npm install
npm test
```

### Ver resultados de CI

Los resultados están disponibles en:
- GitHub Actions tab del repositorio
- Pull Request checks
- Codecov dashboard (coverage)

### Deploy manual

```bash
# Via GitHub UI
1. Ve a Actions > CD - Deploy to Kubernetes
2. Click en "Run workflow"
3. Selecciona environment (staging/production)
4. Click "Run workflow"
```

## 🔧 Configuración necesaria

### Secrets requeridos (GitHub Repository Settings)

#### Para builds:
- `GITHUB_TOKEN` (automático)

#### Para deployment a AWS EKS:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: us-east-1)
- `EKS_CLUSTER_NAME`

#### Para Codecov (opcional):
- `CODECOV_TOKEN`

### Environments

Configura environments en GitHub:
- **staging**: Para deploys de prueba
- **production**: Para deploys productivos

Cada environment puede tener:
- Approval requerido
- Branch protection
- Secrets específicos

## 📊 Status Badges

Añade a tu README.md:

```markdown
![CI Status](https://github.com/jpalenz77/gamehub_micro/actions/workflows/ci.yml/badge.svg)
![Deploy Status](https://github.com/jpalenz77/gamehub_micro/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/jpalenz77/gamehub_micro/branch/main/graph/badge.svg)](https://codecov.io/gh/jpalenz77/gamehub_micro)
```

## 🐛 Troubleshooting

### Tests fallan localmente pero pasan en CI

```bash
# Asegúrate de tener las mismas versiones
node --version  # debe ser 18.x
npm --version

# Limpia cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Builds fallan por falta de memoria

Ajusta en el workflow:
```yaml
- name: Build with more memory
  run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Deploy falla en EKS

```bash
# Verifica credentials
aws sts get-caller-identity

# Verifica kubeconfig
kubectl config current-context

# Verifica namespace
kubectl get ns gamehub
```

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Testing Framework](https://jestjs.io/)
- [Supertest API Testing](https://github.com/visionmedia/supertest)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
