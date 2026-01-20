import dotenv from 'dotenv';
dotenv.config(); // Load .env paling atas

import app from './app';
import connectDB from './config/database';
import './config/redis'; // Execute file redis

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});