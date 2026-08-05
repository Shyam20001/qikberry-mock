import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import swaggerUi from 'swagger-ui-express';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import router from './routes';
import { errorHandler, notFound } from './middleware';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || '*').split(',').map((value) => value.trim()),
    credentials: true
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);
if (process.env.NODE_ENV === 'development') {
  const openApiPath = path.join(process.cwd(), 'openapi.yaml');
  const openApiDoc = yaml.parse(fs.readFileSync(openApiPath, 'utf8'));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
}
app.get('/healthz', (_req, res) => {
  res.json({ success: true, message: 'OK', date: Date.now() });
});

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

export default app;
