import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import path from 'path';

const app: Application = express();

// Parsers
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Application Routes
app.use('/api/v1', router);

// Root Route / Health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'HireHub Server is running smoothly!',
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Fallback for route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found',
  });
});

export default app;