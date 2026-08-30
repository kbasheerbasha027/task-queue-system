# 🚀 TaskFlow — Distributed Task Queue & Job Scheduler

> A production-style distributed task processing platform for submitting, queuing, scheduling, monitoring, and executing background jobs across multiple workers.

![TaskFlow](https://img.shields.io/badge/TaskFlow-Distributed%20Task%20Queue-0ea5e9?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge\&logo=python\&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-REST%20API-000000?style=for-the-badge\&logo=flask\&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Queue-DC382D?style=for-the-badge\&logo=redis\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

---

## 📌 Overview

**TaskFlow** is a distributed task queue and job scheduler designed to demonstrate how modern systems process background workloads using a queue-based architecture.

Instead of executing every task directly inside the API server, TaskFlow separates:

```text
Client
   │
   ▼
Flask API
   │
   ▼
Redis Queue
   │
   ├──────────────┐
   ▼              ▼
Worker 01      Worker 02
   │              │
   └──────┬───────┘
          ▼
     PostgreSQL
```

A client submits a job through the REST API. The API places the job into a Redis queue, and an available worker consumes and executes it. PostgreSQL stores job state and execution information.

This architecture demonstrates important distributed-system concepts such as:

* Asynchronous processing
* Queue-based architecture
* Worker-based execution
* Job state management
* Fault isolation
* Horizontal worker scaling
* Monitoring and observability

---

# ✨ Features

## ⚡ Distributed Job Processing

Submit background jobs through a REST API and process them asynchronously using dedicated workers.

## 📦 Redis Queue

Redis acts as the message queue between the API and worker processes.

```text
API → Redis Queue → Worker
```

## 👷 Multiple Workers

The architecture supports multiple worker processes that can consume jobs from the queue.

Example:

```text
                 Redis
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
     Worker 1  Worker 2  Worker 3
```

This allows the system to scale processing capacity by adding workers.

## 🗄️ PostgreSQL Job Storage

PostgreSQL stores job information such as:

* Job ID
* Task name
* Status
* Payload
* Priority
* Queue
* Worker
* Timestamps
* Execution result

## 📊 Monitoring & Metrics

TaskFlow exposes metrics including:

* Total jobs
* Queue depth
* Status breakdown
* Success rate
* Average execution time

Example:

```text
Total Jobs:                3
Queue Depth:               0
Success Rate:             100%
Average Execution Time:  1.03s
```

## ❤️ Health Monitoring

The API provides a health endpoint to verify the status of:

* Application
* PostgreSQL
* Redis

```text
GET /api/health
```

## 🔄 Job Lifecycle

Jobs move through a defined lifecycle:

```text
SUBMITTED
    │
    ▼
  QUEUED
    │
    ▼
 RUNNING
    │
    ▼
COMPLETED
```

Failed jobs can be identified and handled separately.

---

# 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │      Client      │
                         │ Browser / API    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Flask REST API │
                         │                  │
                         │ Job Submission   │
                         │ Health Checks    │
                         │ Metrics          │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Redis Queue    │
                         │                  │
                         │   Task Buffer    │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
             ┌────────────┐ ┌────────────┐ ┌────────────┐
             │  Worker 1  │ │  Worker 2  │ │  Worker N  │
             │            │ │            │ │            │
             │ Task Exec. │ │ Task Exec. │ │ Task Exec. │
             └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
                   │              │              │
                   └──────────────┼──────────────┘
                                  ▼
                         ┌──────────────────┐
                         │   PostgreSQL     │
                         │                  │
                         │ Job State        │
                         │ Results          │
                         │ Metrics          │
                         └──────────────────┘
```

---

# 🛠️ Technology Stack

### Backend

* Python
* Flask
* PostgreSQL
* Redis

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript
* Recharts
* Lucide React

### Infrastructure

* Docker
* Docker Compose

### Development

* VS Code
* Git
* GitHub

---

# 📂 Project Structure

```text
task-queue-system/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── utils.py
│
├── workers/
│   ├── __init__.py
│   ├── tasks.py
│   └── job_worker.py
│
├── tests/
│   └── test_api.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── docker-compose.yml
├── requirements.txt
├── .gitignore
├── .env
└── README.md
```

> `.env`, `venv`, and `node_modules` are intentionally excluded from Git using `.gitignore`.

---

# 🚀 Getting Started

## Prerequisites

Install:

* Python 3.13+
* Docker Desktop
* Node.js
* npm
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/kbasheerbasha027/task-queue-system.git
cd task-queue-system
```

---

## 2. Create Virtual Environment

### Windows PowerShell

```powershell
python -m venv venv
```

Activate:

```powershell
.\venv\Scripts\Activate.ps1
```

---

## 3. Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create a `.env` file in the project root.

Use the environment configuration required by the application.

> Never commit your `.env` file or expose database credentials/API keys publicly.

---

# 🐳 5. Start Infrastructure

Start PostgreSQL and Redis:

```powershell
docker-compose up -d
```

Check their status:

```powershell
docker-compose ps
```

Both services should show as healthy/running.

---

# 🖥️ 6. Start the Backend API

Open a new terminal:

```powershell
cd "C:\Users\K basheer\OneDrive\Desktop\task-queue-system"
.\venv\Scripts\Activate.ps1
python -m app.main
```

The API runs on:

```text
http://localhost:5000
```

---

# 👷 7. Start a Worker

Open another terminal:

```powershell
cd "C:\Users\K basheer\OneDrive\Desktop\task-queue-system"
.\venv\Scripts\Activate.ps1
python -m workers.job_worker worker-1
```

Expected output:

```text
🚀 Worker worker-1 started
⏰ Listening for jobs on queue: default
```

You can start additional workers using different worker IDs.

Example:

```powershell
python -m workers.job_worker worker-2
```

---

# 🌐 8. Start the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Then open the URL displayed by Vite, usually:

```text
http://localhost:5173
```

---

# 🧪 API Testing

## Health Check

```text
GET /api/health
```

PowerShell:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Example response:

```text
database : connected
redis    : connected
status   : healthy
```

---

## Dashboard Metrics

```text
GET /api/metrics/dashboard
```

PowerShell:

```powershell
Invoke-RestMethod http://localhost:5000/api/metrics/dashboard
```

---

## Submit a Job

```text
POST /api/jobs/submit
```

PowerShell:

```powershell
$body = @{
  name = "send_email"
  payload = @{
    email = "user@example.com"
    subject = "Welcome"
  }
  priority = 1
} | ConvertTo-Json -Compress

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5000/api/jobs/submit" `
  -ContentType "application/json" `
  -Body $body
```

The job should enter the queue and be picked up by the worker.

---

# 🔄 Job Processing Flow

```text
1. Client submits job
          ↓
2. Flask API validates request
          ↓
3. Job stored in PostgreSQL
          ↓
4. Job pushed to Redis
          ↓
5. Worker consumes job
          ↓
6. Worker executes task
          ↓
7. Job status updated
          ↓
8. Result stored in PostgreSQL
          ↓
9. Metrics updated
```

---

# 📊 Example Dashboard

The frontend provides a visual control center for monitoring the distributed task system.

It is designed around:

* Real-time job activity
* Queue monitoring
* Worker status
* Job execution
* System health
* Metrics
* Observability

---

# 🧪 Testing

Run the API tests with:

```powershell
python -m pytest -q tests/test_api.py
```

---

# 🔐 Security Notes

Never commit sensitive information such as:

* Database passwords
* API keys
* Authentication tokens
* `.env` files
* Private credentials

The repository uses `.gitignore` to prevent environment-specific and generated files from being committed.

---

# 🚧 Future Improvements

Potential future improvements include:

* Advanced job scheduling
* Cron-based recurring jobs
* Worker auto-scaling
* Dead-letter queues
* Retry policies
* Priority queues
* Distributed locking
* Authentication and authorization
* WebSocket-based real-time updates
* Advanced worker metrics
* Prometheus/Grafana integration
* Centralized logging
* Alerting
* Kubernetes deployment
* Horizontal worker scaling
* Fault-injection testing

---

# 🎯 Project Goals

TaskFlow was built to explore practical distributed-system concepts including:

* Asynchronous processing
* Queue-based architectures
* Distributed workers
* Database-backed job state
* Fault isolation
* Scalability
* Observability
* Containerized infrastructure

---

# 👨‍💻 Author

**Basheer Basha**

Computer Science Engineering Student

---

# ⭐ Support

If you find this project interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is intended for educational and portfolio purposes.
