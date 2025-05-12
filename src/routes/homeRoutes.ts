import express from 'express';
import {
  getHomePage,
  getBlogListPage,
  getBlogDetailPage,
  getCategoryBlogsPage
} from '../controllers/homeController';

const router = express.Router();

router.get('/', getHomePage);

router.get('/blogs', getBlogListPage);
router.get('/blog/:slug', getBlogDetailPage);

router.get('/category/:slug', getCategoryBlogsPage);

export default router; 