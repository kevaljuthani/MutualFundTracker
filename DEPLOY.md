# Deployment Guide

This guide details how to deploy the Mutual Fund Tracker (Client + Server) to a production environment.

## Prerequisites

- **Docker** and **Docker Compose** installed on the target machine.
- **Git** (optional, for cloning the repo).

## Deployment Steps

### 1. Build Client (Flutter Web)

On your development machine (where Flutter is installed), run:

```bash
cd Client
flutter build web --release
```

This will generate the static files in `Client/build/web`. These files are mounted into the Nginx container.

### 2. Configure Environment

Create a `.env` file in the root directory based on the example:

```bash
cp .env.example .env
```

Edit the `.env` file to set your secure credentials:

```ini
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=mf_tracker
DATABASE_URL=postgres://your_user:your_secure_password@postgres:5432/mf_tracker
```

### 3. Deploy with Docker Compose

From the root directory (`d:\Development\MutualFundTracker`), run:

```bash
docker-compose up -d --build
```

This command will:

1.  Start PostgreSQL (`postgres`).
2.  Start Adminer (`adminer`) on port 8080.
3.  Build and start the API (`api`) on port 9001 (internal).
4.  Build and start the Sync service (`sync`).
5.  Start Nginx (`web`) on port 80.

### 4. Database Migration

On the first run, you need to apply database migrations. Run this command **after** the containers are up:

```bash
docker-compose exec api bun run db:migrate
```

### 5. Access the Application

- **Web App**: http://localhost (or your server IP)
- **API**: http://localhost/api/
- **Adminer** (DB UI): http://localhost:8080

## Maintenance

### Updating Code

1.  Pull latest changes.
2.  Rebuild client: `flutter build web --release`.
3.  Rebuild containers: `docker-compose up -d --build`.

### Viewing Logs

```bash
docker-compose logs -f
```
