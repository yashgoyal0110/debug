import express from 'express';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ShopKart API is healthy' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
