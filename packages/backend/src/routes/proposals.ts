import { Router, Response } from 'express';
import { z } from 'zod';
import * as proposalService from '../services/proposalService';
import * as voteService from '../services/voteService';
import { authenticate, requireRole, optionalAuth, AuthRequest } from '../middleware/auth';
import { getDatabase } from '../config/database';

const router = Router();

const createProposalSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().min(10).max(10000),
  category: z.string().min(1).max(50).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const updateProposalSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().min(10).max(10000).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'ARCHIVED']).optional(),
});

router.get('/export/csv', authenticate, requireRole('ADMIN', 'MODERATOR'), async (_req: AuthRequest, res: Response, next) => {
  try {
    const db = getDatabase();
    const rows = await db('proposals')
      .select('p.id', 'p.title', 'p.description', 'p.status', 'p.vote_count', 'p.category', 'p.created_at', 'u.email as author_email')
      .from('proposals as p')
      .join('users as u', 'p.author_id', 'u.id')
      .orderBy('p.created_at', 'desc');

    const header = 'ID,Title,Description,Status,Votes,Category,Author,Date';
    const csv = rows.map(r =>
      `"${r.id}","${(r.title || '').replace(/"/g, '""')}","${(r.description || '').replace(/"/g, '""')}","${r.status}",${r.vote_count},"${r.category || ''}","${r.author_email}","${r.created_at}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="proposals.csv"');
    res.send(`${header}\n${csv}`);
  } catch (error) {
    next(error);
  }
});

router.get('/trending', async (_req, res: Response, next) => {
  try {
    const limit = parseInt(_req.query.limit as string, 10) || 10;
    const trending = await proposalService.getTrendingProposals(limit);
    res.json({ data: trending });
  } catch (error) {
    next(error);
  }
});

router.get('/', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as 'OPEN' | 'CLOSED' | 'ARCHIVED' | undefined;
    const category = req.query.category as string | undefined;
    const sort = (req.query.sort as 'createdAt' | 'voteCount') || 'createdAt';
    const search = req.query.search as string | undefined;

    const result = await proposalService.listProposals(
      { page, limit, status, category, sort, search },
      req.user?.id
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next) => {
  try {
    const proposal = await proposalService.getProposalById(req.params.id, req.user?.id);
    res.json(proposal);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createProposalSchema.parse(req.body);
    const proposal = await proposalService.createProposal(data, req.user!.id);
    res.status(201).json(proposal);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateProposalSchema.parse(req.body);
    const proposal = await proposalService.updateProposal(req.params.id, data, req.user!.id, req.user!.role);
    res.json(proposal);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    await proposalService.deleteProposal(req.params.id, req.user!.id, req.user!.role);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/vote', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await voteService.castVote(req.params.id, req.user!.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/vote', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = await voteService.removeVote(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;