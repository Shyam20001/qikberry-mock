import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/dbmodels';
import { AppError } from '../utils';

const signToken = (user: any) =>
  jwt.sign(
    { id: Number(user.id), email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );

export const registerUser = async (input: { name: string; email: string; password: string }) => {
  const existing = await UserModel.findOne({ where: { email: input.email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    password: hashed,
    role: 'user'
  });

  return {
    token: signToken(user),
    user: user.toJSON()
  };
};

export const loginUser = async (input: { email: string; password: string }) => {
  const user = await UserModel.findOne({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) throw new AppError('Invalid credentials', 401);

  return {
    token: signToken(user),
    user: user.toJSON()
  };
};
