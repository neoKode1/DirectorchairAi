/**
 * Health check endpoint — /api/health
 *
 * Returns service connectivity status for monitoring and alerting.
 * Does NOT require auth (must remain public for uptime monitoring tools).
 */
import { NextResponse } from 'next/server';

type ServiceStatus = 'ok' | 'degraded' | 'down' | 'unconfigured';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: Record<string, { status: ServiceStatus; latency?: number; error?: string }>;
}

const startTime = Date.now();

async function checkFal(): Promise<{ status: ServiceStatus; latency?: number; error?: string }> {
  if (!process.env.FAL_KEY) return { status: 'unconfigured' };
  const start = Date.now();
  try {
    // Lightweight check — just verify the key format is valid
    // A full API call would cost money on every health check
    const keyValid = process.env.FAL_KEY.length > 10;
    return { status: keyValid ? 'ok' : 'degraded', latency: Date.now() - start };
  } catch (e: any) {
    return { status: 'down', latency: Date.now() - start, error: e.message };
  }
}

async function checkAnthropic(): Promise<{ status: ServiceStatus; latency?: number; error?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) return { status: 'unconfigured' };
  const start = Date.now();
  try {
    const keyValid = process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-');
    return { status: keyValid ? 'ok' : 'degraded', latency: Date.now() - start };
  } catch (e: any) {
    return { status: 'down', latency: Date.now() - start, error: e.message };
  }
}

async function checkUpstash(): Promise<{ status: ServiceStatus; latency?: number; error?: string }> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return { status: 'unconfigured' };
  }
  const start = Date.now();
  try {
    // Lightweight ping to Upstash REST API
    const res = await fetch(`${process.env.KV_REST_API_URL}/ping`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      signal: AbortSignal.timeout(3000),
    });
    return {
      status: res.ok ? 'ok' : 'degraded',
      latency: Date.now() - start,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return { status: 'down', latency: Date.now() - start, error: e.message };
  }
}

export async function GET() {
  const [fal, anthropic, upstash] = await Promise.all([
    checkFal(),
    checkAnthropic(),
    checkUpstash(),
  ]);

  const services = { fal, anthropic, upstash };
  const statuses = Object.values(services).map(s => s.status);

  let overall: HealthCheck['status'] = 'healthy';
  if (statuses.includes('down')) overall = 'unhealthy';
  else if (statuses.includes('degraded') || statuses.includes('unconfigured')) overall = 'degraded';

  const health: HealthCheck = {
    status: overall,
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '0.0.0',
    services,
  };

  return NextResponse.json(health, {
    status: overall === 'unhealthy' ? 503 : 200,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
