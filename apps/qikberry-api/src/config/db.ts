import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'event_ticket_system',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    timezone: '+05:30'
  }
);

export const connectMongo = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI missing');
  }

  await mongoose.connect(uri);
};