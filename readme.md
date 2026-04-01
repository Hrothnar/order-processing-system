# Order Validation System
A cluster of backend services for validating orders in a reliable chain.

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka) ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

[Introduction](#introduction) | [Features](#features) | [Tech Stack](#tech-stack) | [Installation](#installation) | [Quick start](#quick-start) | [Usage](#usage) | [Known issues and limitations](#known-issues-and-limitations) | [Getting help](#getting-help) | [Contributing](#contributing) | [License](#license)


## Introduction
This service exposes a set of REST API endpoints, with the primary endpoint responsible for scoring financial transactions and returning a validation result that includes a risk level and a final decision. The API is stateless, uses PostgreSQL for persistence, and provides OpenAPI documentation for straightforward integration by upstream systems.


## Features
- Extensible rule-based scoring pipeline with initial validation rules, including amount thresholds, nighttime activity, high-risk countries, high-risk merchant categories, velocity checks, and country mismatch detection.
- Persistent storage of transactions, validation results, and outbox events for audit and history tracking.
- REST API for querying validation history with pagination and filtering.
- OpenAPI specification and Swagger UI for interactive API documentation.
- Outbox-based message publishing for validation completed events.


## Tech stack
- Java 25
- Spring Boot 3.5.x
    - Spring Web (Tomcat)
    - Spring Data JPA (Hibernate, HikariCP)
    - Jackson
    - Jakarta Bean Validation
- Maven
- PostgreSQL 17.x
- Liquibase
- Kafka
- Testcontainers


## Installation

### Prerequisites

- **Option A — Container run:** Docker + Docker Compose
- **Option B — Local run:** Java 25, Maven (optional), PostgreSQL, Kafka
- **Option C — Hybrid run:** Java 25, Maven (optional), Docker + Docker Compose

---

### Option A: Docker Compose (recommended)

Runs the application together with all required infrastructure in an isolated environment, with the application, database, and message broker running in separate containers.

```sh
docker compose up --build
```

### Option B: Running locally

For this approach, PostgreSQL and Kafka must be running on the host machine, and the application connection parameters must be configured accordingly.

After the infrastructure is ready, run the application locally:

```sh
./mvnw spring-boot:run
```
or, if Maven is installed globally:

```sh
mvn spring-boot:run
```

### Option C: Hybrid run

PostgreSQL and Kafka are started in containers, while the application itself runs locally and connects to the containerized infrastructure.

Start PostgreSQL and Kafka using Docker Compose:

```sh
docker compose up -d postgres kafka
```

Then run the application locally:

```sh
./mvnw spring-boot:run
```
or

```sh
mvn spring-boot:run
```


## Quick start

Run the service and submit a transaction for validation:

```sh
curl -X POST "http://localhost:3000/api/v1/transaction/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": 1,
    "userId": "c1c3a7c0-1c3b-4a2b-9e5a-7b3c1b2a9f11",
    "merchantId": "9a1d6f88-0f93-4e58-9dd7-1c9d4a7d6c22",
    "deviceId": "android-13-pixel-7",
    "amount": 12000.00,
    "currency": "USD",
    "initialized": 1735689600,
    "merchantCategory": "GROCERIES",
    "channel": "WEB",
    "ipAddress": "203.0.113.10",
    "country": "NGA",
    "cardFingerprint": "fp_9d82kdk29d"
  }'
```

Example response:

```json
{
  "id": 843,
  "transactionId": 1021,
  "score": 90,
  "riskLevel": "HIGH",
  "decision": "BLOCK",
  "validationResults": [
    {
      "code": "VERY_HIGH_AMOUNT",
      "description": "The transaction is above 9999 USD",
      "scoreDelta": 60
    },
    {
      "code": "HIGH_RISK_COUNTRY",
      "description": "The transaction was made in high-risk country NGA",
      "scoreDelta": 30
    }
  ],
  "createdAt": "2026-12-01T11:22:33Z",
  "updatedAt": "2026-12-01T11:22:33Z"
}
```


## Usage

### Base URL

All endpoints are served under the `/api` context path.

### API endpoints

- `POST /api/v1/transaction/validate` - validate a transaction and return score, risk level, decision, and triggered validators.
- `GET /api/v1/validation/{id}` - fetch a validation result by id.
- `GET /api/v1/validation` - list validation results with optional filters (`userId`, `riskLevel`, `decision`, `from`, `to`, `page`, `size`).
- `GET /api/v1/utility/health/liveness` - liveness probe.
- `GET /api/v1/utility/health/readiness` - readiness probe.

OpenAPI and Swagger UI:

- `GET /api/v1/openapi` - raw OpenAPI spec.
- `GET /api/swagger` - Swagger UI.

### Scoring rules

The default pipeline applies these validators and sums their score deltas:

- High amount: amount > 4999 adds +40.
- Very high amount: amount > 9999 adds +60.
- Nighttime: 02:00-05:00 UTC adds +15.
- High-risk country: country code is in `RiskCountry` list (ISO alpha-3) adds +30.
- High-risk merchant: category in `GAMBLING`, `CRYPTO`, or `ADULT` adds +35.
- Velocity: more than 3 validations in the last 5 minutes adds +25.
- Country mismatch: user's recent history shows current country < 50% of last 30 days adds +20.

### Risk level mapping

Scores are mapped to risk levels and decisions using the configured thresholds:

- `properties.risk.threshold.low` (default 30) => `LOW` / `ALLOW`
- `properties.risk.threshold.medium` (default 70) => `MEDIUM` / `REVIEW`
- Above the medium threshold => `HIGH` / `BLOCK`

### Configuration

Configuration lives under `src/main/resources/application*.yaml`. Key settings include:

- Server: port `3000`, context path `/api`.
- Database: `spring.datasource.*` (overridden by Docker Compose env vars).
- Kafka: `spring.kafka.*` and `properties.kafka.*`.
- Scoring thresholds: `properties.risk.threshold.*`.

To run with production settings:

```sh
SPRING_PROFILES_ACTIVE=prod \
DB_HOST=localhost \
DB_PORT=5432 \
DB_USER=postgres \
DB_PASSWORD=postgres \
./mvnw spring-boot:run
```

### Kafka outbox

Each validation writes an outbox row and the scheduled publisher ships it to Kafka (topic `transaction.validation.completed`). The consumer is optional and only logs messages when `properties.kafka.consumer.enabled=true`.


## Known issues and limitations

- No load or stress testing is included.
- Authentication and authorization are not implemented.
- Some rule thresholds are currently defined in code (e.g. amount limits, velocity window, country mismatch window).
- Kafka consumer logic is intentionally minimal and intended for demonstration purposes only.


## Getting help

If you encounter a bug or have a question about the project, please use the repository issue tracker or reach me out directly.


## Contributing

Pull requests are welcome. For substantial changes, please open an issue first to discuss the proposed approach.


## License

This project is licensed under the MIT License. See the `LICENSE` file for details.