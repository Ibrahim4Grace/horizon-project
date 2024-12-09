import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { corsOptions, startServer } from './src/configs/index.js';
import { router } from './src/routes/index.js';
import {
  notFoundMIiddleware,
  errorHandler,
  setupMiddleware,
} from './src/middlewares/index.js';

const app = express();

app.use(cors(corsOptions));

// Set no-cache headers middleware
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

app.use(morgan('tiny'));
app.disable('x-powered-by');

setupMiddleware(app);
app.use(router);

app.use(notFoundMIiddleware);
app.use(errorHandler);

// Create an HTTP server instance
const server = http.createServer(app);

// Start the server
startServer(server);
