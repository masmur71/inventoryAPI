import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import productRoutes from './routes/product.routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/products', productRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Inventory API is running (TypeScript)...' });
});

export default app;