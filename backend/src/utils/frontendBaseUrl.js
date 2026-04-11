const LOCAL_HOST_PATTERNS = ['localhost', '127.0.0.1', '::1'];

const isLocalHostUrl = (value = '') => {
  const normalized = String(value).trim().toLowerCase();
  return LOCAL_HOST_PATTERNS.some((item) => normalized.includes(item));
};

const splitOrigins = (value = '') =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const resolveFrontendBaseUrl = () => {
  const explicitUrl = process.env.FRONTEND_PUBLIC_URL || process.env.FRONTEND_APP_URL;
  if (explicitUrl) {
    return explicitUrl.trim().replace(/\/$/, '');
  }

  const fallbackOrigins = splitOrigins(process.env.FRONTEND_URL);
  if (!fallbackOrigins.length) {
    return '#';
  }

  if (process.env.NODE_ENV === 'production') {
    const nonLocal = fallbackOrigins.find((origin) => !isLocalHostUrl(origin));
    if (nonLocal) {
      return nonLocal.replace(/\/$/, '');
    }
  }

  return fallbackOrigins[0].replace(/\/$/, '');
};

module.exports = {
  resolveFrontendBaseUrl,
};
