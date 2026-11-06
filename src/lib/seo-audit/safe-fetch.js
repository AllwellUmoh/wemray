import { promises as dns } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import zlib from 'node:zlib';

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 12_000;
const USER_AGENT =
  'WemrayRaySEOAnalyzer/1.0 (+https://wemray.com/tools/ray-seo-analyser/crawler)';

const blockedHostnames = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'metadata',
  'metadata.google.internal',
  'instance-data',
  'instance-data.ec2.internal',
]);

const blockedSuffixes = ['.localhost', '.local', '.internal', '.home.arpa', '.lan'];

const blockList = new net.BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) {
  blockList.addSubnet(network, prefix, 'ipv4');
}
blockList.addAddress('255.255.255.255', 'ipv4');

for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
  ['2001:db8::', 32],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001:2::', 48],
  ['2001:10::', 28],
  ['2001:20::', 28],
  // NOTE: Do not add `::ffff:0:0/96` (IPv4-mapped IPv6) here. Node's
  // net.BlockList treats that subnet as covering the entire IPv4 space, so
  // adding it makes every public IPv4 address (e.g. 69.46.46.46) match as
  // blocked. IPv4-mapped addresses are rejected explicitly in
  // isBlockedAddress() instead.
]) {
  blockList.addSubnet(network, prefix, 'ipv6');
}

export class AuditFetchError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'AuditFetchError';
    this.code = code;
    this.status = status;
  }
}

function bareHostname(hostname) {
  return String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
}

function isBlockedHostname(hostname) {
  if (!hostname) return true;
  if (blockedHostnames.has(hostname)) return true;
  return blockedSuffixes.some((suffix) => hostname.endsWith(suffix));
}

function isBlockedAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return blockList.check(address, 'ipv4');
  if (family === 6) {
    const lower = address.toLowerCase();
    if (lower.startsWith('::ffff:')) return true;
    return blockList.check(lower, 'ipv6');
  }
  return true;
}

export function normalizeTargetUrl(input) {
  let value = String(input || '').trim();
  if (!value) throw new AuditFetchError('invalid_url', 'Enter a website URL.');

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new AuditFetchError('invalid_url', 'That does not look like a valid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new AuditFetchError('unsupported_scheme', 'Only HTTP and HTTPS URLs are supported.');
  }
  if (url.username || url.password) {
    throw new AuditFetchError('invalid_url', 'URLs with credentials are not supported.');
  }
  if (url.port) {
    const expected = url.protocol === 'http:' ? '80' : '443';
    if (url.port !== expected) {
      throw new AuditFetchError('unsupported_port', 'Only ports 80 and 443 are supported.');
    }
  }

  const hostname = bareHostname(url.hostname);
  if (!hostname || hostname.length > 253) {
    throw new AuditFetchError('invalid_url', 'The URL hostname is not valid.');
  }
  if (isBlockedHostname(hostname)) {
    throw new AuditFetchError('blocked_host', 'That hostname is not allowed.');
  }

  url.hash = '';
  if (url.href.length > 2048) {
    throw new AuditFetchError('invalid_url', 'The URL is too long.');
  }
  return url;
}

export async function resolvePublicAddress(url) {
  const hostname = bareHostname(url.hostname);
  const literalFamily = net.isIP(hostname);

  if (literalFamily) {
    if (isBlockedAddress(hostname)) {
      throw new AuditFetchError('blocked_host', 'That address is not allowed.');
    }
    return { address: hostname, family: literalFamily };
  }

  let records;
  try {
    records = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new AuditFetchError('dns_failed', 'We could not resolve that hostname.', 422);
  }

  if (!records.length) {
    throw new AuditFetchError('dns_failed', 'We could not resolve that hostname.', 422);
  }

  for (const record of records) {
    if (isBlockedAddress(record.address)) {
      throw new AuditFetchError(
        'blocked_host',
        'This URL points to a private or local address, so it cannot be audited. Please enter a publicly reachable website.',
        422,
      );
    }
  }

  return records.find((record) => record.family === 4) || records[0];
}

export async function validateTargetUrl(input) {
  const url = normalizeTargetUrl(input);
  await resolvePublicAddress(url);
  return url;
}

function requestOnce(url, address, family, signal) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const transport = url.protocol === 'https:' ? https : http;
    const hostname = bareHostname(url.hostname);

    const options = {
      method: 'GET',
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      agent: false,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en',
        Connection: 'close',
      },
      lookup(_host, lookupOptions, callback) {
        if (lookupOptions?.all) {
          callback(null, [{ address, family }]);
          return;
        }
        callback(null, address, family);
      },
    };

    if (url.protocol === 'https:' && !net.isIP(hostname)) {
      options.servername = hostname;
    }

    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    const request = transport.request(options, (response) => {
      const chunks = [];
      let total = 0;

      const encoding = String(response.headers['content-encoding'] || '').toLowerCase();
      let stream = response;
      if (encoding.includes('br')) stream = response.pipe(zlib.createBrotliDecompress());
      else if (encoding.includes('gzip')) stream = response.pipe(zlib.createGunzip());
      else if (encoding.includes('deflate')) stream = response.pipe(zlib.createInflate());

      stream.on('data', (chunk) => {
        total += chunk.length;
        if (total > MAX_BYTES) {
          request.destroy(
            new AuditFetchError('response_too_large', 'The page response is too large.', 422),
          );
          return;
        }
        chunks.push(chunk);
      });

      stream.on('error', (error) => {
        finish(reject, error);
      });

      stream.on('end', () => {
        finish(resolve, {
          requestedUrl: url.href,
          finalUrl: url.href,
          status: response.statusCode || 0,
          statusText: response.statusMessage || '',
          headers: response.headers,
          body: Buffer.concat(chunks),
          bytes: total,
          fetchMs: Date.now() - startedAt,
          redirects: 0,
        });
      });
    });

    request.setTimeout(TIMEOUT_MS, () => {
      request.destroy(new AuditFetchError('timeout', 'The page took too long to respond.', 504));
    });

    request.on('error', (error) => {
      finish(
        reject,
        error instanceof AuditFetchError
          ? error
          : new AuditFetchError('fetch_failed', 'We could not fetch that page.', 502),
      );
    });

    if (signal) {
      if (signal.aborted) {
        request.destroy(new AuditFetchError('aborted', 'The audit was cancelled.', 499));
      } else {
        signal.addEventListener(
          'abort',
          () => request.destroy(new AuditFetchError('aborted', 'The audit was cancelled.', 499)),
          { once: true },
        );
      }
    }

    request.end();
  });
}

export async function safeFetch(input, { signal } = {}) {
  let current = normalizeTargetUrl(input);
  const requestedUrl = current.href;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const { address, family } = await resolvePublicAddress(current);
    const response = await requestOnce(current, address, family, signal);

    const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
    const location = response.headers.location;

    if (isRedirect && location) {
      if (redirects === MAX_REDIRECTS) {
        throw new AuditFetchError('too_many_redirects', 'The page redirected too many times.', 422);
      }
      let next;
      try {
        next = normalizeTargetUrl(new URL(location, current).href);
      } catch {
        throw new AuditFetchError('invalid_redirect', 'The page redirected to an invalid URL.', 422);
      }
      current = next;
      continue;
    }

    return {
      ...response,
      requestedUrl,
      finalUrl: current.href,
      redirects,
    };
  }

  throw new AuditFetchError('too_many_redirects', 'The page redirected too many times.', 422);
}
