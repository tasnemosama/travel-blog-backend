import * as express from 'express';
import * as session from 'express-session';
import * as mongoose from 'mongoose';

declare module 'connect-mongo' {
  interface MongoStoreOptions {
    mongoUrl?: string;
    clientPromise?: Promise<any>;
    client?: any;
    mongooseConnection?: mongoose.Connection;
    ttl?: number;
    touchAfter?: number;
    crypto?: {
      secret: string;
    };
    autoRemove?: string;
    autoRemoveInterval?: number;
    collectionName?: string;
  }

  function create(options: MongoStoreOptions): session.Store;
  
  export default {
    create
  };
} 