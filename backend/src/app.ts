import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import registrationRoutes from './routes/registration.routes';
import adminRoutes from './routes/admin.routes';
import teamRoutes from './routes/team.routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Security & request logging middlewares
app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin, matched CORS_ORIGIN, Vercel deployments, or localhost in dev
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin === 'https://amongu.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        (env.NODE_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health & System Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'AmongU Backend API',
    isRegistrationOpen: env.REGISTRATION_OPEN,
    feeINR: env.REGISTRATION_FEE_INR,
    timestamp: new Date().toISOString(),
  });
});

// Public Event Schedule & Configuration for Landing Page & Dashboard Timers
import { getEventConfig } from './controllers/admin.controller';
app.get('/api/event/config', getEventConfig);
app.get('/api/api/event/config', getEventConfig);

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);

// 404 Handler for undefined routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
