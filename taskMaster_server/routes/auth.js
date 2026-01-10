import express from 'express';
const router = express.Router();
import authenticateUser from '../middleware/authentication.js';
import { register, login, deleteAccount } from '../controllers/auth.js';


router.post('/register', register);
router.post('/login', login);
router.delete('/deleteAccout', authenticateUser, deleteAccount);

export default router;