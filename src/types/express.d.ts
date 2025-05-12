import { Express } from 'express-serve-static-core';
import { UserDocument } from '../models/userModel';
import 'express-session';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }

    namespace Multer {
      interface File {
        path: string;
      }
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      _id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    };
  }
} 