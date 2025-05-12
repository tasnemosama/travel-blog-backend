import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';
import connectDB from './db';

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: 'admin@travelblog.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@travelblog.com',
      password: 'admin123',
      isAdmin: true
    });

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin(); 