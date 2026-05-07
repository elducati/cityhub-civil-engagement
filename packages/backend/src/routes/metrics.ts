import { Router, Request, Response } from 'express';

const router = Router();

const httpRequestsTotal = new Map<string, number>();
const httpRequestDurationMs = new Map<string, number[]>();

export function recordHttpRequest(method: string, path: string, statusCode: number, durationMs: number): void {
  const key = `${method}:${path}`;
  httpRequestsTotal.set(key, (httpRequestsTotal.get(key) || 0) + 1);

  const durations = httpRequestDurationMs.get(key) || [];
  durations.push(durationMs);
  if (durations.length > 100) durations.shift();
  httpRequestDurationMs.set(key, durations);
}

export function getAverageDuration(key: string): number {
  const durations = httpRequestDurationMs.get(key) || [];
  if (durations.length === 0) return 0;
  return durations.reduce((a, b) => a + b, 0) / durations.length;
}

router.get('/metrics', (_req: Request, res: Response) => {
  const metrics: string[] = [];

  metrics.push('# HELP http_requests_total Total HTTP requests');
  metrics.push('# TYPE http_requests_total counter');
  for (const [key, count] of httpRequestsTotal.entries()) {
    const [method, path] = key.split(':');
    metrics.push(`http_requests_total{method="${method}",path="${path}"} ${count}`);
  }

  metrics.push('\n# HELP http_request_duration_ms Average HTTP request duration in ms');
  metrics.push('# TYPE http_request_duration_ms gauge');
  for (const key of httpRequestDurationMs.keys()) {
    const [method, path] = key.split(':');
    metrics.push(`http_request_duration_ms{method="${method}",path="${path}"} ${getAverageDuration(key).toFixed(2)}`);
  }

  metrics.push('\n# HELP process_uptime_seconds Process uptime in seconds');
  metrics.push('# TYPE process_uptime_seconds gauge');
  metrics.push(`process_uptime_seconds ${process.uptime()}`);

  metrics.push('\n# HELP nodejs_memory_heap_used_bytes Node.js heap used bytes');
  metrics.push('# TYPE nodejs_memory_heap_used_bytes gauge');
  metrics.push(`nodejs_memory_heap_used_bytes ${process.memoryUsage().heapUsed}`);

  metrics.push('\n# HELP nodejs_memory_heap_total_bytes Node.js heap total bytes');
  metrics.push('# TYPE nodejs_memory_heap_total_bytes gauge');
  metrics.push(`nodejs_memory_heap_total_bytes ${process.memoryUsage().heapTotal}`);

  res.setHeader('Content-Type', 'text/plain');
  res.send(metrics.join('\n'));
});

export default router;
