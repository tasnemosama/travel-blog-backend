import express from 'express';
import {
  createBlog,
  getBlogs,
  getFeaturedBlogs,
  getBlogsByCategory,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog
} from '../controllers/blogController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/category/:categoryId', getBlogsByCategory);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);

router.post(
  '/',
  protect,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createBlog
);

router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  updateBlog
);

router.delete('/:id', protect, deleteBlog);

export default router; 