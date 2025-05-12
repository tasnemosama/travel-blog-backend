import express from 'express';
import { 
  getDashboardHome,
  getLogin, 
  postLogin,
  getLogout,
  getCategories,
  getCreateCategory,
  postCreateCategory,
  getEditCategory,
  putEditCategory,
  deleteCategory,
  getBlogs,
  getCreateBlog,
  postCreateBlog,
  getEditBlog,
  putEditBlog,
  deleteBlog
} from '../controllers/dashboardController';
import { protect, admin, protectWithDashboard } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/logout", getLogout);

router.get("/", protectWithDashboard, getDashboardHome);

router.get("/categories", protectWithDashboard, admin, getCategories);
router.get('/categories/create', protectWithDashboard, admin, getCreateCategory);
router.post(
  '/categories/create',
  protect,
  admin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  postCreateCategory
);
router.get('/categories/edit/:id', protectWithDashboard, admin, getEditCategory);
router.put(
  '/categories/edit/:id',
  protect,
  admin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  putEditCategory
);
router.delete('/categories/:id', protect, admin, deleteCategory);

router.get('/blogs', protectWithDashboard, admin, getBlogs);
router.get('/blogs/create', protectWithDashboard, admin, getCreateBlog);
router.post(
  '/blogs',
  protect,
  admin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  postCreateBlog
);
router.get('/blogs/edit/:id', protectWithDashboard, admin, getEditBlog);
router.put(
  '/blogs/:id',
  protect,
  admin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  putEditBlog
);
router.delete('/blogs/:id', protect, admin, deleteBlog);

export default router; 