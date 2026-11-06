import { NextResponse } from 'next/server';
import { clientIp, hashIp, isAllowedOrigin } from '../contact';
import { hashUserAgent } from './crypto';

export function jsonResponse(body, init) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...(init?.headers || {}),
    },
  });
}

export function requestContext(request) {
  const ip = clientIp(request);
  return {
    ip,
    ipHash: hashIp(`seo:${ip}`),
    userAgentHash: hashUserAgent(request.headers.get('user-agent') || ''),
    originAllowed: isAllowedOrigin(request),
  };
}

export function readBearerToken(request) {
  const header = request.headers.get('authorization') || '';
  if (header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  const url = new URL(request.url);
  return url.searchParams.get('token') || '';
}

export function isValidAuditId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value || ''),
  );
}
