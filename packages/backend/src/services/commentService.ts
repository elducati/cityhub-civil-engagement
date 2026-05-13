import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';

export interface Comment {
  id: string;
  proposalId: string;
  parentId: string | null;
  authorId: string;
  authorEmail: string;
  body: string;
  createdAt: Date;
  replies?: Comment[];
}

export async function getComments(proposalId: string): Promise<Comment[]> {
  const db = getDatabase();

  const rows = await db('comments')
    .select('comments.id', 'comments.proposal_id', 'comments.parent_id', 'comments.author_id', 'comments.body', 'comments.created_at', 'users.email as author_email')
    .join('users', 'comments.author_id', 'users.id')
    .where('comments.proposal_id', proposalId)
    .orderBy('comments.created_at', 'asc');

  const comments: Comment[] = rows.map(r => ({
    id: r.id,
    proposalId: r.proposal_id,
    parentId: r.parent_id,
    authorId: r.author_id,
    authorEmail: r.author_email,
    body: r.body,
    createdAt: r.created_at,
  }));

  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies!.push(map.get(c.id)!);
    } else {
      roots.push(map.get(c.id)!);
    }
  }

  return roots;
}

export async function createComment(proposalId: string, authorId: string, body: string, parentId?: string): Promise<Comment> {
  const db = getDatabase();

  const proposal = await db('proposals').where('id', proposalId).first();
  if (!proposal) throw createError('Proposal not found', 404);

  if (parentId) {
    const parent = await db('comments').where('id', parentId).where('proposal_id', proposalId).first();
    if (!parent) throw createError('Parent comment not found', 404);
  }

  const [row] = await db('comments').insert({
    proposal_id: proposalId,
    author_id: authorId,
    body,
    parent_id: parentId || null,
  }).returning('*');

  const user = await db('users').select('email').where('id', authorId).first();

  return {
    id: row.id,
    proposalId: row.proposal_id,
    parentId: row.parent_id,
    authorId: row.author_id,
    authorEmail: user?.email || 'unknown',
    body: row.body,
    createdAt: row.created_at,
  };
}
