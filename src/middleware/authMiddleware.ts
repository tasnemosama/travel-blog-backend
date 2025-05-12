import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.jwt || req.cookies.token || req.headers.authorization) {
    try {
      token = req.cookies.jwt || req.cookies.token || req.headers.authorization?.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as DecodedToken;

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error:any) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const protectWithDashboard = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.jwt || req.cookies.token || req.headers.authorization) {
    try {
      token = req.cookies.jwt || req.cookies.token || req.headers.authorization?.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as DecodedToken;

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error:any) {
      console.error(error);
      return res.redirect('/dashboard/login');
    }
  }

  if (!token) {
    return res.redirect('/dashboard/login');
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
}; 