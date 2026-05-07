import { getDatabase } from '../config/database';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const db = getDatabase();

  await db('audit_logs').insert({
    user_id: entry.userId || null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId || null,
    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
  });
}

export async function getAuditLogs(
  options: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Array<{
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}>> {
  const db = getDatabase();
  const { entityType, entityId, userId, limit = 50, offset = 0 } = options;

  let query = db('audit_logs').select('*').orderBy('created_at', 'desc').limit(limit).offset(offset);

  if (entityType) query = query.where('entity_type', entityType);
  if (entityId) query = query.where('entity_id', entityId);
  if (userId) query = query.where('user_id', userId);

  const rows = await query;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  }));
}