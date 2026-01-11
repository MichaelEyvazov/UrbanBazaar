// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';

import seedRouter from './routes/seedRoutes.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/urbanbazaar';
mongoose
  .connect(MONGODB_URI, { dbName: process.env.DB_NAME || undefined })
  .then(() => console.log('connected to db'))
  .catch((err) => console.error(err.message));

app.use('/api/seed', seedRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/keys/paypal',(req,res)=>{
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
})

app.use((req, res, next) => {
  res.status(404).send({ message: 'Route Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  res.status(500).send({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`serve at http://localhost:${PORT}`);
});