# Mutual Fund Tracker

A comprehensive application to track and analyze Indian Mutual Fund investments. This project consists of a **Flutter Web Client** and a **Bun/ElysiaJS Server**.

## Features

- **Portfolio Tracking**: Add and manage your mutual fund holdings.
- **Real-time NAV Updates**: Automatically syncs daily NAVs from external APIs.
- **Performance Analytics**: View XIRR, total returns, and portfolio composition.
- **Secure Authentication**: User management with secure storage.
- **Responsive Design**: Built with Flutter for a seamless experience on web and mobile.

## Architecture

- **Client**: Flutter (Web/Mobile)
- **Server**: Bun runtime, ElysiaJS framework
- **Database**: PostgreSQL (managed via Drizzle ORM)
- **Infrastructure**: Docker & Docker Compose

## Prerequisites

- **Docker** & **Docker Compose**
- **Flutter SDK** (for client development)
- **Bun** (for server development)

## Getting Started

### 1. Environment Setup

Copy the example environment file and configure your secrets:

```bash
cp .env.example .env
```

Update `.env` with your preferred database credentials.

### 2. Run with Docker (Recommended)

The easiest way to run the entire stack is with Docker Compose:

```bash
docker-compose up -d --build
```

This will spin up:

- PostgreSQL Database
- API Server (Port 9001)
- Sync Service
- Nginx Web Server (Port 80) serving the Flutter app

### 3. Local Development

#### Server

navigate to the `Server` directory:

```bash
cd Server
bun install
bun run db:generate
bun run db:migrate
bun run api:dev
```

#### Client

Navigate to the `Client` directory:

```bash
cd Client
flutter pub get
flutter run -d chrome
```

## Documentation

For detailed deployment instructions, see [DEPLOY.md](DEPLOY.md).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
