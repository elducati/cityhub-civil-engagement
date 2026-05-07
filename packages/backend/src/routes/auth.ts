import { Router, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', rateLimiter('auth'), async (req, res: Response, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', rateLimiter('auth'), async (req, res: Response, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await authService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;