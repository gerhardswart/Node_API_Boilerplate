# Node.js REST API Template

A production-ready, modern REST API template built with Node.js, Express, and JWT authentication. This template follows industry best practices and provides a solid foundation for building scalable web applications.

## Features

- **JWT Authentication** - Secure access and refresh token flow with automatic token expiration
- **Password Security** - Bcrypt hashing with configurable rounds
- **Rate Limiting** - Protection against brute force and DDoS attacks
- **Request Validation** - Comprehensive input validation using express-validator
- **Centralized Error Handling** - Consistent error responses across all endpoints
- **Repository Pattern** - Clean separation of data access logic
- **Service Layer** - Business logic isolated from controllers
- **Row Level Security** - Database-level security with Supabase/PostgreSQL
- **Structured Logging** - Winston logger with environment-specific configuration
- **API Versioning** - Built-in support for API versioning (/api/v1)
- **Request Tracing** - Unique request IDs for debugging and monitoring
- **Docker Support** - Multi-stage Docker builds with development and production targets
- **CI/CD Ready** - GitHub Actions workflow for automated testing and builds
- **Comprehensive Testing** - Jest and Supertest for unit and integration tests
- **Postman Collection** - Ready-to-use API testing collection
- **OpenAPI/Swagger** - Complete API documentation

## Tech Stack

| Category         | Technology            |
| ---------------- | --------------------- |
| Runtime          | Node.js 20+ (LTS)     |
| Framework        | Express.js            |
| Database         | Supabase (PostgreSQL) |
| Authentication   | JWT (jsonwebtoken)    |
| Password Hashing | bcrypt                |
| Validation       | express-validator     |
| Logging          | Winston + Morgan      |
| Security         | Helmet + CORS         |
| Rate Limiting    | express-rate-limit    |
| Testing          | Jest + Supertest      |
| Code Quality     | ESLint + Prettier     |
| Containerization | Docker                |

## Installation

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker (optional)

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
# The Supabase credentials are pre-configured

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

| Variable                    | Description                               | Default        |
| --------------------------- | ----------------------------------------- | -------------- |
| `PORT`                      | Server port                               | `3000`         |
| `NODE_ENV`                  | Environment (development/production/test) | `development`  |
| `JWT_SECRET`                | Secret key for JWT signing                | Required       |
| `JWT_EXPIRES_IN`            | Access token expiration                   | `1d`           |
| `JWT_REFRESH_EXPIRES_IN`    | Refresh token expiration                  | `7d`           |
| `BCRYPT_ROUNDS`             | Bcrypt hashing rounds                     | `10`           |
| `RATE_LIMIT_WINDOW_MS`      | Rate limit window in milliseconds         | `900000`       |
| `RATE_LIMIT_MAX_REQUESTS`   | Max requests per window                   | `100`          |
| `SUPABASE_URL`              | Supabase project URL                      | Pre-configured |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key                    | Pre-configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key                 | Pre-configured |

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
│   │   ├── index.js            # App configuration
│   │   ├── database.js        # Database connection
│   │   └── logger.js           # Winston logger
│   ├── controllers/
│   │   ├── AuthController.js   # Authentication endpoints
│   │   └── HealthController.js # Health check endpoints
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   ├── errorHandler.js    # Error handling middleware
│   │   ├── rateLimiter.js     # Rate limiting middleware
│   │   └── validate.js        # Validation middleware
│   ├── models/
│   │   └── User.js             # User model
│   ├── repositories/
│   │   ├── BaseRepository.js   # Generic CRUD operations
│   │   └── UserRepository.js   # User-specific operations
│   ├── routes/
│   │   ├── index.js            # Route aggregator
│   │   ├── auth.route.js       # Auth routes
│   │   └── health.route.js     # Health routes
│   ├── services/
│   │   └── UserService.js      # Business logic
│   ├── tests/
│   │   ├── setup.js            # Test setup and utilities
│   │   ├── auth.test.js       # Auth endpoint tests
│   │   ├── health.test.js     # Health check tests
│   │   └── errorHandling.test.js
│   ├── utils/
│   │   ├── index.js            # Utils aggregator
│   │   ├── asyncHandler.js     # Async error wrapper
│   │   ├── jwt.js              # JWT utilities
│   │   ├── password.js        # Password utilities
│   │   ├── requestId.js        # Request ID middleware
│   │   └── response.js         # Response helpers
│   ├── validators/
│   │   └── auth.js             # Auth validation rules
│   ├── app.js                  # Express app setup
│   └── server.js               # Server entry point
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package.json
├── README.md
└── swagger.yaml
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

Tests use the pre-configured Supabase instance. The test setup automatically creates and cleans up test data.

## Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
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
- **Row Level Security** - Database-level access control

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

1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Check that the database migration has been applied
3. Verify RLS policies are correctly configured

### JWT Token Invalid

- Verify `JWT_SECRET` matches across all environments
- Check token expiration
- Ensure `Authorization: Bearer <token>` header format

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Express.js framework
- Authentication powered by JWT
- Database managed by Supabase
- Testing with Jest and Supertest
