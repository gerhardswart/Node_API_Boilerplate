import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import config from './config';
import { errorHandler, notFoundHandler, apiLimiter } from './middleware';
import { requestIdMiddleware } from './utils';
import routes from './routes';
import logger from './config/logger';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();
const swaggerDocument = YAML.load(path.resolve(__dirname, '..', 'swagger.yaml'));

app.set('strict routing', true);

// Security headers
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: config.isDevelopment ? '*' : process.env.CORS_ORIGIN?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
        credentials: true,
    })
);

// Compression
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID for tracing
app.use(requestIdMiddleware);

// Logging
if (config.isDevelopment) {
    app.use(morgan('dev'));
} else {
    app.use(
        morgan('combined', {
            skip: (_req: Request, res: Response) => res.statusCode < 400,
            stream: {
                write: (message: string) => logger.info(message.trim()),
            },
        })
    );
}

// Rate limiting for API routes
app.use('/api', apiLimiter);

// Health check (no auth required)
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Service is healthy',
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});

// Swagger documentation
app.get('/api/v1/swagger', (_req: Request, res: Response) => {
    res.redirect('/api/v1/swagger/');
});
app.get('/api/v1/swagger/', (_req: Request, res: Response) => {
    res.send(swaggerUi.generateHTML(swaggerDocument));
});
app.use('/api/v1/swagger/', swaggerUi.serve);
app.get('/api/v1/swagger.json', (_req: Request, res: Response) => {
    res.json(swaggerDocument);
});

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Welcome to the REST API',
        data: {
            documentation: '/api/v1/health',
            version: '1.0.0',
        },
    });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
