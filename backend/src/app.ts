import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';

// Import middleware
import {
  corsMiddleware,
  helmetMiddleware,
  generalRateLimit,
  securityHeadersMiddleware,
  requestTimeoutMiddleware,
} from './middleware/securityMiddleware';
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  morganMiddleware,
  securityLoggingMiddleware,
  performanceLoggingMiddleware,
} from './middleware/loggingMiddleware';
import {
  errorHandler,
  notFoundHandler,
  rateLimitErrorHandler,
} from './middleware/errorMiddleware';
import { sanitizeInput } from './middleware/validationMiddleware';

// Import routes
import routes from './routes';

// Import database
import database from './database/connection';

// Import config
import config from './config';

class App {
  public app: express.Application;
  public server: any;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Trust proxy (for rate limiting and IP detection)
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmetMiddleware);
    this.app.use(corsMiddleware);
    this.app.use(securityHeadersMiddleware);

    // Request ID middleware (must be first)
    this.app.use(requestIdMiddleware);

    // Logging middleware
    this.app.use(morganMiddleware);
    this.app.use(requestLoggingMiddleware);
    this.app.use(securityLoggingMiddleware);
    this.app.use(performanceLoggingMiddleware);

    // Rate limiting
    this.app.use(generalRateLimit);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Input sanitization
    this.app.use(sanitizeInput);

    // Request timeout
    this.app.use(requestTimeoutMiddleware(30000)); // 30 seconds

    // Static files (if needed)
    this.app.use(express.static('public'));
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'ChatZPT API Server',
        data: {
          version: '1.0.0',
          environment: config.NODE_ENV,
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // Error logging middleware
    this.app.use(errorLoggingMiddleware);

    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    // Rate limit error handler
    this.app.use(rateLimitErrorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize database
      await database.initialize();
      console.log('Database initialized successfully');

      // Clean up expired tokens
      const { authService } = await import('./services/authService');
      await authService.cleanupExpiredTokens();
      console.log('Expired tokens cleaned up');

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  public listen(port: number): void {
    this.server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      console.log(`API Documentation: http://localhost:${port}/api/docs`);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): any {
    return this.server;
  }
}

export default App;
