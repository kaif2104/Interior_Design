# 🏗️ Production Multi-Server DevSecOps Environment on AWS EC2

An enterprise-grade, shift-left DevSecOps architecture running on AWS EC2. This repository demonstrates automated secret scanning, Static Application Security Testing (SAST), Docker multi-stage release pipelines, sequential zero-downtime rolling deployments, automated database migrations, real-time telemetry (Prometheus & Grafana), and autonomous SRE self-healing watchdogs.
'/Users/mohammedkaifdudhwala/Desktop/Untitled - Visual 1.jpg'

## 🖥️ Server Inventory & Infrastructure Specs

| Server Name | Instance Type | OS | Role | Public IP | Private VPC IP |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`jenkins-interior`** | `c7i-flex.large` | Ubuntu 24.04 LTS | **Control Hub**: Jenkins, SonarQube, PostgreSQL 15, Prometheus, Grafana | `13.126.192.40` | `172.31.234.75` |
| **`web-interior1`** | `c7i-flex.large` | Ubuntu 24.04 LTS | **Edge Proxy & Node 1**: Nginx Layer 7 LB + App Container 1 | `13.127.148.208` | `172.31.142.43` |
| **`web-interior2`** | `c7i-flex.large` | Ubuntu 24.04 LTS | **Node 2**: App Container 2 + SRE Watchdog Daemon | `13.204.235.216` | `172.31.150.255` |

---

## 🔒 Security Hardening & Zero-Trust Network Controls

1. **VPC Subnet Isolation**:
   - The PostgreSQL database port (`5432`) is locked strictly to the private VPC subnet CIDR (`172.31.0.0/16`) and bound exclusively to `172.31.234.75:5432`. It is completely unreachable from the public internet.
   - Raw container application ports (`8080`) are restricted to internal VPC traffic (`172.31.0.0/16`).
   - Only the Nginx Load Balancer on `web-interior1` exposes public HTTP (`80`).
2. **Inter-Server Authentication**:
   - Passwordless 4096-bit RSA SSH deployment key pair generated on Server 1.
   - Jenkins runs non-interactive remote commands using private key injection (`/var/jenkins_home/.ssh/id_rsa`).
   - Strict host key checking bypassed with automated `accept-new` policy.

---

## 🚀 Shift-Left DevSecOps CI/CD Pipeline (Jenkinsfile)

The automated Jenkins pipeline enforces continuous verification across 6 sequential stages:

```
[ Git Checkout ] 
       ⬇
[ Gitleaks Secret Scan ] (Fail-fast in < 1s if credentials detected)
       ⬇
[ SonarQube SAST Analysis ] (Java 21 JRE, quality profiles & vulnerability detection)
       ⬇
[ Docker Build & Push ] (Builds release image tagged with ${BUILD_NUMBER} to Docker Hub)
       ⬇
[ Zero-Downtime Rolling Deployment ] (Deploy Node 1 ➔ Health Check ➔ DB Migration ➔ Deploy Node 2 ➔ Health Check)
       ⬇
[ Promote to :latest ] (Only executed if all nodes pass post-deployment validation)
```

### Key Pipeline Features:
- **Fail-Fast Secret Scanning**: Gitleaks CLI scans repository commits and trees; any API key, password, or AWS credential aborts the pipeline within 1 second before artifacts are compiled.
- **Static Application Security Testing (SAST)**: SonarQube Scanner CLI container inspects the codebase for code smells, CVEs, and insecure patterns, pushing metrics to SonarQube Server.
- **Docker-out-of-Docker (DooD)**: Jenkins runs with the host Docker socket mounted (`/var/run/docker.sock`), building isolated release containers without privileged Docker-in-Docker overhead.
- **Automatic Image Promotion**: The release tag `kaif03/interior:${BUILD_NUMBER}` is promoted to `kaif03/interior:latest` on Docker Hub only after both production nodes respond with `HTTP 200` on `/health`.

---

## 🔄 Zero-Downtime Rolling Deployment & Auto-Rollback

Deployments are coordinated sequentially across the instance pool to ensure zero user disruption:

1. **Pre-Deployment Backup**:
   The deployment script (`/opt/interior/deploy.sh`) captures the currently running container image tag:
   ```bash
   PREVIOUS_IMAGE=$(docker inspect --format='{{.Config.Image}}' interior-app)
   ```
2. **Graceful Drain & Container Replacement**:
   - The new release image is pulled.
   - The active container is stopped with a graceful 10-second termination timeout (`docker stop -t 10`).
   - The new container starts with database environment variables injected.
3. **Health Check Loop**:
   - The script polls `http://127.0.0.1:8080/health` up to 15 times (2-second retry delay).
   - If `HTTP 200` is returned, the node deployment succeeds.
4. **Automated Rollback Engine**:
   - If health checks fail after 15 retries:
     - The failed container is stopped and removed.
     - The previous stable image (`$PREVIOUS_IMAGE`) is automatically redeployed.
     - The script exits with status `1`, halting the Jenkins pipeline immediately to protect remaining healthy nodes.
5. **PostgreSQL Migration**:
   - Automated schema migrations run safely on Node 1 after verified health, before rolling to Node 2.

---

## 🛡️ SRE Autonomous Self-Healing Watchdog Daemon

Each production instance runs a background watchdog daemon (`/opt/interior/watchdog.sh`) configured via cron every 60 seconds:

```bash
* * * * * /opt/interior/watchdog.sh
```

### Self-Healing Logic:
1. Queries `http://127.0.0.1:8080/health` with a 3-second connect timeout.
2. If the application crashes, hangs, or experiences an Out-Of-Memory kill (OOMKilled), the watchdog detects HTTP `000` or `502`.
3. Records incident timestamp to `/var/log/app_monitor.log`.
4. Executes autonomous recovery:
   ```bash
   docker restart interior-app
   ```
5. Verifies post-healing status and logs recovery completion without engineer intervention.

---

## 📊 Real-Time Observability & Telemetry

The telemetry stack runs on Server 1 and scrapes production targets over the AWS VPC private network every 15 seconds:

- **Prometheus** (`http://13.126.192.40:9090`):
  - Scrapes `172.31.142.43:8080` (Node 1) and `172.31.150.255:8080` (Node 2).
  - Collects target health (`up`), scrape duration (`scrape_duration_seconds`), and HTTP throughput.
- **Grafana** (`http://13.126.192.40:3000`):
  - **Node Availability Dashboard**: Live Stat panel displaying `1` (Healthy) or `0` (Outage) per instance.
  - **HTTP Request Rate**: Time-series visualization of request volume per second.
  - **Node Scrape Latency**: Monitors internal network latency and event-loop lag.

---

## 🛠️ Operational Diagnostics & Troubleshooting Runbook

### Check Container Status & Logs:
```bash
# View active container
docker ps

# Stream application logs
docker logs -f interior-app

# Inspect exit code of a crashed container
docker inspect interior-app --format='{{.State.ExitCode}}'
# (ExitCode 137 = OOMKilled by kernel; ExitCode 1 = Uncaught Application Exception)
```

### Inspect SRE Watchdog Activity:
```bash
tail -f /var/log/app_monitor.log
```

### Verify Nginx Load Balancer Routing:
```bash
# Health endpoint via Load Balancer
curl -i http://13.127.148.208/health

# Check Nginx access and error logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 👤 Author & Maintainer
- **Kaif Dudhwala**
- **Docker Hub**: [kaif03/interior](https://hub.docker.com/r/kaif03/interior)
- **GitHub**: [kaif2104/Interior_Design](https://github.com/kaif2104/Interior_Design)
