import { Router, Response } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import * as analyticsService from '../services/analyticsService';

const router = Router();

router.get('/proposals', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const analytics = await analyticsService.getProposalAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

router.get('/voting', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response, next) => {
  try {
    const analytics = await analyticsService.getVotingAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;