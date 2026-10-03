/**
 * Defense-in-depth URL validator for links and media sources.
 * Only allows http:, https:, mailto:, tel:, or site-relative paths (/path, not //).
 * Scheme-less domain values (e.g. "example.com", "github.com/user") are normalized with https://.
 * Blocks dangerous schemes (javascript:, data:, vbscript:) at render time.
 */
export function safeHref(url, fallback = '#') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Allow site-relative paths starting with / (disallow protocol-relative //)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Allow same-page anchor hashes
  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  // Check if it has an explicit valid protocol
  try {
    const parsed = new URL(trimmed);
    const proto = parsed.protocol.toLowerCase();
    if (proto === 'http:' || proto === 'https:' || proto === 'mailto:' || proto === 'tel:') {
      return trimmed;
    }
    return fallback;
  } catch {
    // No scheme present. Check if it looks like a domain name (e.g. "example.com", "github.com/user")
    if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+($|[/?#].*$)/.test(trimmed)) {
      try {
        const parsed = new URL('https://' + trimmed);
        if (parsed.protocol === 'https:') {
          return 'https://' + trimmed;
        }
      } catch {
        return fallback;
      }
    }
  }

  return fallback;
}

/**
 * Defense-in-depth image/media source validator.
 * Allows http:, https:, site-relative (/uploads/...), blob:, and data:image/.
 * Rejects javascript:, data:text/html, etc.
 */
export function safeImageSrc(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Site-relative paths starting with / (excluding //)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Allow blob: for local object URLs created by URL.createObjectURL
  if (trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Allow safe image data URLs (e.g. data:image/png;base64,...)
  if (/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const proto = parsed.protocol.toLowerCase();
    if (proto === 'http:' || proto === 'https:') {
      return trimmed;
    }
  } catch {
    // Scheme-less domain image (e.g. images.unsplash.com/...)
    if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+($|[/?#].*$)/.test(trimmed)) {
      try {
        const parsed = new URL('https://' + trimmed);
        if (parsed.protocol === 'https:') {
          return 'https://' + trimmed;
        }
      } catch {
        return fallback;
      }
    }
  }

  return fallback;
}
