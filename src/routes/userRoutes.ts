import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  getUsers
} from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/', protect, admin, getUsers);

export default router; 