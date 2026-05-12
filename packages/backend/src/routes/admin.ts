import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import * as adminService from '../services/adminService';

const router = Router();

router.get('/dashboard', authenticate, requireRole('ADMIN', 'MODERATOR'), async (_req: AuthRequest, res: Response, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/users', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await adminService.getUsers(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']),
});

router.put('/users/:id/role', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { role } = updateRoleSchema.parse(req.body);
    await adminService.updateUserRole(req.params.id, role, req.user!.role);
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const result = await adminService.getAuditLogs(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
