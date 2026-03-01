# 🧩 Todo Chat Bot – Full-Stack Kubernetes Deployment

![Project Banner](./Screenshot%20(11).png)

A production-style full-stack **Todo Chat Bot** application deployed locally using **Docker**, **Kubernetes (Minikube)**, and **Helm**.

This project demonstrates containerized frontend and backend services orchestrated through Kubernetes with Helm-based deployment.

---

## 🚀 Project Overview

| Layer            | Technology Used |
|------------------|----------------|
| Frontend         | React.js |
| Backend          | Node.js + Express |
| Database         | PostgreSQL (Neon / Persistent Volume) |
| Containerization | Docker |
| Orchestration    | Kubernetes (Minikube) |
| Deployment       | Helm |

---

## 🌐 Application Access

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:3000 |
| Backend   | http://localhost:8001 |
| Health Check | http://localhost:8001/health |

---

## 📦 Container Images

| Service | Image Name | Status |
|----------|------------|--------|
| Backend | `todo-backend:latest` | Running |
| Frontend | `todo-frontend:latest` | Running |
| Minikube Base | `gcr.io/k8s-minikube/kicbase:v0.0.50` | Running |

Docker images are built locally and loaded into Minikube for deployment.

---

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|------------|
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | User login |
| `/tasks/` | GET / POST | Fetch or create tasks |

---

## ⚙️ Local Minikube Deployment

### 1️⃣ Start Minikube

```bash
minikube start --driver=docker
```

2️⃣ Build Docker Images

cd backend
docker build -t todo-backend:latest .

cd ../frontend
docker build -t todo-frontend:latest .

cd ..

3️⃣ Load Images into Minikube

minikube image load todo-backend:latest
minikube image load todo-frontend:latest

4️⃣ Deploy with Helm

helm upgrade --install todo-chat-bot ./todo-chat-bot --wait --timeout=5m

5️⃣ Verify Deployment

kubectl get pods
kubectl get services

6️⃣ Port Forward Services

```bash
kubectl port-forward service/todo-chat-bot-backend 8001:7860 &
kubectl port-forward service/todo-chat-bot-frontend 3000:3000 &
```

🐳 Minikube / Docker Startup Logs

The following logs confirm Docker and system services started successfully inside Minikube:

Starting docker.service - Docker Application Container Engine...

[*     ] Job docker.service/start running (6s / no limit)
[**    ] Job docker.service/start running (6s / no limit)
[***   ] Job docker.service/start running (7s / no limit)
[ ***  ] Job docker.service/start running (7s / no limit)

Starting dbus.service - D-Bus System Message Bus...
[  OK  ] Started dbus.service - D-Bus System Message Bus.
[  OK  ] Started docker.service - Docker Application Container Engine.
[  OK  ] Reached target multi-user.target - Multi-User System.
[  OK  ] Reached target graphical.target - Graphical Interface.
Starting systemd-update-utmp-runlevel...
[  OK  ] Finished systemd-update-utmp-runlevel - Record Runlevel Change in UTMP.

🖼 Screenshots & Assets

📌 Container Images
![Container Screenshot](./Screenshot%20(6).png)

📌 Minikube Cluster
![Minikube Screenshot](./Screenshot%20(12).png)

📌 Frontend UI
![Fronend-Ui Screenshot](./Screenshot%20(11).png)

📌 Backend 
![Backend Screenshot](./Screenshot%20(15).png)

📌 Swagger-UI 
![Swagger-Ui Screenshot](./Screenshot%20(16).png)

```bash
phase_4/
│
├── backend/
│   ├── Dockerfile
│   └── src/
│
├── frontend/
│   ├── Dockerfile
│   └── src/
│
├── todo-chat-bot/        # Helm chart directory
│
├── Screenshot (8).png
├── Screenshot (9).png
├── Screenshot (11).png
├── Screenshot (12).png
├── Screenshot (15).png
├── Screenshot (16).png
└── README.md
```
```bash

✅ Features

User registration & login

Task creation and management

Dockerized frontend & backend

Kubernetes orchestration via Minikube

Helm-based deployment

Local development ready

Production-migration capable structure
```
```bash

📌 Notes

Ensure Docker is running before starting Minikube.

CORS must be enabled in backend for frontend API calls.

Port-forwarding is required for localhost access.

For production deployment, push images to a container registry and deploy to a managed Kubernetes cluster (EKS, GKE, AKS).
```

```bash
👩‍💻 Author

Phase-4 Kubernetes Deployment Project
Full-Stack Containerized Application Demo
```

