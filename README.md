# Node.js REST API Boilerplate

A production-ready, modern REST API template built with Node.js, Express, and JWT authentication. This template follows industry best practices and provides a solid foundation for building scalable web applications.

## Features

- **JWT Authentication** - Secure access and refresh token flow with automatic token expiration
- **Password Security** - Bcrypt hashing with configurable rounds
- **Rate Limiting** - Protection against brute force and DDoS attacks
- **Request Validation** - Comprehensive input validation using express-validator
- **Centralized Error Handling** - Consistent error responses across all endpoints
- **Repository Pattern** - Clean separation of data access logic
- **Service Layer** - Business logic isolated from controllers
- **Generic Database Layer** - Abstract database interface supporting PostgreSQL, MySQL, MongoDB, or in-memory storage
- **Structured Logging** - Winston logger with environment-specific configuration
- **API Versioning** - Built-in support for API versioning (/api/v1)
- **Request Tracing** - Unique request IDs for debugging and monitoring
- **Docker Support** - Multi-stage Docker builds with development and production targets
- **CI/CD Ready** - GitHub Actions workflow for automated testing and builds
- **Comprehensive Testing** - Jest and Supertest for unit and integration tests
- **Postman Collection** - Ready-to-use API testing collection
- **OpenAPI/Swagger** - Complete API documentation

## Tech Stack

| Category         | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Runtime          | Node.js 20+ (LTS)                              |
| Framework        | Express.js                                     |
| Database         | Pluggable (PostgreSQL/MySQL/MongoDB/In-Memory) |
| Authentication   | JWT (jsonwebtoken)                             |
| Password Hashing | bcrypt                                         |
| Validation       | express-validator                              |
| Logging          | Winston + Morgan                               |
| Security         | Helmet + CORS                                  |
| Rate Limiting    | express-rate-limit                             |
| Testing          | Jest + Supertest                               |
| Code Quality     | ESLint + Prettier                              |
| Containerization | Docker                                         |

## Installation

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker (optional)
- Database (PostgreSQL, MySQL, MongoDB - or use in-memory for development)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd nodejs-rest-api-template

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`

### Docker

```bash
# Development
docker-compose up app

# Production
docker-compose --profile production up app-prod
```

## Environment Variables

| Variable                  | Description                                   | Default       |
| ------------------------- | --------------------------------------------- | ------------- |
| `PORT`                    | Server port                                   | `3000`        |
| `NODE_ENV`                | Environment (development/production/test)     | `development` |
| `JWT_SECRET`              | Secret key for JWT signing                    | Required      |
| `JWT_EXPIRES_IN`          | Access token expiration                       | `1d`          |
| `JWT_REFRESH_EXPIRES_IN`  | Refresh token expiration                      | `7d`          |
| `BCRYPT_ROUNDS`           | Bcrypt hashing rounds                         | `10`          |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window in milliseconds             | `900000`      |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window                       | `100`         |
| `DATABASE_TYPE`           | Database type (postgres/mysql/mongodb/memory) | `memory`      |
| `DATABASE_URL`            | Database connection URL                       | Optional      |

## Database Configuration

The template uses a generic database interface (`IDatabaseClient`) that can be implemented for any database:

### Using In-Memory (Default)

The default configuration uses an in-memory database for quick development:

```env
DATABASE_TYPE=memory
```

### Using PostgreSQL

1. Create a PostgreSQL database
2. Implement the `IDatabaseClient` interface in `src/config/database.ts`
3. Set environment variables:

```env
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Database Interface

The `IDatabaseClient` interface provides these methods:

```typescript
interface IDatabaseClient {
    findAll<T>(table: string, options?: QueryOptions): Promise<IPaginatedResult<T>>;
    findById<T>(table: string, id: string): Promise<T | null>;
    findOne<T>(table: string, field: string, value: FilterValue): Promise<T | null>;
    findMany<T>(table: string, filters?: Filters, options?: QueryOptions): Promise<T[]>;
    create<T>(table: string, data: Record<string, unknown>): Promise<T>;
    update<T>(table: string, id: string, data: Record<string, unknown>): Promise<T | null>;
    delete(table: string, id: string): Promise<boolean>;
    count(table: string, filters?: Filters): Promise<number>;
    exists(table: string, id: string): Promise<boolean>;
}
```

To implement a custom database:

1. Create a class implementing `IDatabaseClient`
2. Update `getDatabaseClient()` in `src/config/database.ts` to return your implementation

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── .husky/
│   └── pre-commit              # Pre-commit hooks
├── postman/
│   ├── API.postman_collection.json
│   └── API.postman_environment.json
├── src/
│   ├── config/
│   │   ├── index.ts            # App configuration
│   │   ├── database.ts        # Database client interface
│   │   └── logger.ts          # Winston logger
│   ├── controllers/
│   │   ├── AuthController.ts   # Authentication endpoints
│   │   └── HealthController.ts # Health check endpoints
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication middleware
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   ├── rateLimiter.ts     # Rate limiting middleware
│   │   └── validate.ts        # Validation middleware
│   ├── models/
│   │   └── User.ts             # User model
│   ├── repositories/
│   │   ├── BaseRepository.ts   # Generic CRUD operations
│   │   └── UserRepository.ts   # User-specific operations
│   ├── routes/
│   │   ├── index.ts            # Route aggregator
│   │   ├── auth.route.ts       # Auth routes
│   │   └── health.route.ts     # Health routes
│   ├── services/
│   │   └── UserService.ts      # Business logic
│   ├── tests/
│   │   ├── setup.ts            # Test setup and utilities
│   │   ├── auth.test.ts       # Auth endpoint tests
│   │   ├── health.test.ts     # Health check tests
│   │   └── errorHandling.test.ts
│   ├── types/
│   │   ├── index.ts            # TypeScript interfaces
│   │   └── express.d.ts        # Express type augmentation
│   ├── utils/
│   │   ├── index.ts            # Utils aggregator
│   │   ├── asyncHandler.ts     # Async error wrapper
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── password.ts        # Password utilities
│   │   ├── requestId.ts        # Request ID middleware
│   │   └── response.ts         # Response helpers
│   ├── validators/
│   │   └── auth.ts             # Auth validation rules
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── Dockerfile
├── docker-compose.yml
├── jest.config.ts
├── package.json
├── README.md
├── swagger.yaml
└── tsconfig.json
```

## API Endpoints

### Authentication

| Method | Endpoint                       | Description          | Auth |
| ------ | ------------------------------ | -------------------- | ---- |
| POST   | `/api/v1/auth/register`        | Register new user    | No   |
| POST   | `/api/v1/auth/login`           | Login user           | No   |
| POST   | `/api/v1/auth/refresh`         | Refresh access token | No   |
| POST   | `/api/v1/auth/logout`          | Logout user          | Yes  |
| GET    | `/api/v1/auth/profile`         | Get user profile     | Yes  |
| PUT    | `/api/v1/auth/profile`         | Update profile       | Yes  |
| PUT    | `/api/v1/auth/change-password` | Change password      | Yes  |
| DELETE | `/api/v1/auth/account`         | Deactivate account   | Yes  |

### Health

| Method | Endpoint                  | Description           | Auth |
| ------ | ------------------------- | --------------------- | ---- |
| GET    | `/health`                 | Basic health check    | No   |
| GET    | `/api/v1/health`          | API health check      | No   |
| GET    | `/api/v1/health/detailed` | Detailed health check | No   |

## Authentication Flow

### 1. Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "uuid",
            "email": "john@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "user",
            "createdAt": "2024-01-15T10:00:00.000Z"
        },
        "accessToken": "eyJhbGc...",
        "refreshToken": "eyJhbGc..."
    }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Access Protected Routes

```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer <accessToken>"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "<refreshToken>" }'
```

## Response Format

All endpoints follow a consistent response format.

### Success Response

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        // Response data
    }
}
```

### Error Response

```json
{
    "success": false,
    "message": "Error description",
    "errors": [
        {
            "field": "email",
            "message": "Please provide a valid email address"
        }
    ]
}
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Type check
npm run typecheck
```

Pre-commit hooks automatically lint and format staged files.

## Importing Postman Collection

1. Open Postman
2. Click Import
3. Select the `postman/API.postman_collection.json` file
4. Import the environment: `postman/API.postman_environment.json`
5. The token will be automatically saved after successful login/register

## Docker Commands

```bash
# Build image
docker build -t nodejs-rest-api .

# Run development container
docker-compose up app

# Run production container
docker-compose --profile production up app-prod

# View logs
docker logs nodejs-api-dev

# Stop containers
docker-compose down
```

## Security Features

- **Helmet** - Sets security-related HTTP headers
- **CORS** - Cross-Origin Resource Sharing configuration
- **Rate Limiting** - Prevents brute force attacks
- **bcrypt** - Secure password hashing with 10+ rounds
- **JWT** - Stateless authentication with token expiration
- **Input Validation** - Request payload validation

## Health Monitoring

The API provides multiple health check endpoints for monitoring:

- `/health` - Simple endpoint for load balancer checks
- `/api/v1/health` - API version with metadata
- `/api/v1/health/detailed` - Full dependency status including database connectivity

Each response includes:

- Service status
- Application version
- Environment name
- Current timestamp
- Uptime

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

1. Verify `DATABASE_URL` in `.env`
2. Ensure your database is running
3. Check that the database user has proper permissions

### JWT Token Invalid

- Verify `JWT_SECRET` matches across all environments
- Check token expiration
- Ensure `Authorization: Bearer <token>` header format

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Express.js framework
- Authentication powered by JWT
- Testing with Jest and Supertest
