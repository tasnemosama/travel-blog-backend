import express from 'express';
import {
  createCategory,
  getCategories,
  getFeaturedCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { protect, admin } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/', getCategories);
router.get('/featured', getFeaturedCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

router.post(
  '/',
  protect,
  admin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createCategory
);

router.put(
  '/:id',
  protect,
  admin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  updateCategory
);

router.delete('/:id', protect, admin, deleteCategory);

export default router; 