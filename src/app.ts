import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import methodOverride from 'method-override';

dotenv.config();

import userRoutes from './routes/userRoutes';
import categoryRouter from './routes/categoryRoutes';
import blogRouter from './routes/blogRoutes';

import homeRoutes from './routes/homeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secure_session_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/travelblog',
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.use('/api/categories', categoryRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/users', userRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/', homeRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use((req: Request, res: Response) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    error: 'The page you are looking for does not exist'
  });
});

export default app; 