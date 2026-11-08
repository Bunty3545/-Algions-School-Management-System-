import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import swaggerDocument from './docs/swagger.json';

const app = express();

app.use(cors());
app.use(express.json());

// API Documentation Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount routes under both /api and /api/v1 for seamless API compatibility
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

// Centralized error handling
app.use(errorHandler);

export default app;
