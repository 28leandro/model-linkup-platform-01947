/** Only app-shell workers are managed here; messaging workers remain untouched. */
export function isAppWorker(scriptURL: string, origin: string): boolean {
  const url = new URL(scriptURL, origin);
  return url.origin === origin && url.pathname === '/sw.js';
}

export function shouldDisablePwa({ production, iframe, hostname, search }: {
  production: boolean;
  iframe: boolean;
  hostname: string;
  search: string;
}): boolean {
  const host = hostname.toLowerCase();
  if (!production || iframe || new URLSearchParams(search).get('sw') === 'off') return true;
  const lovableDomain = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host);
  const label = host.split('.')[0];
  if (lovableDomain && (
    /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label) ||
    /^project--.+-dev$/.test(label)
  )) return true;
  return ['lovableproject.com', 'lovableproject-dev.com', 'beta.lovable.dev']
    .some(domain => host === domain || host.endsWith(`.${domain}`));
}