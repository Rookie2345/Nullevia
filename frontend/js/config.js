/**
 * NULLEVIA Configuration
 * 
 * Centralized configuration for frontend API communication.
 * To update your production backend URL, simply change PRODUCTION_API_URL below,
 * or inject it via <meta name="nullevia-api-url" content="https://your-backend.onrender.com">.
 */

(function () {
  // Set your deployed Render backend URL here once created:
  const PRODUCTION_API_URL = ''; // e.g. 'https://nullevia-api.onrender.com'

  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.protocol === 'file:'
  );

  // Check for override from meta tag
  const metaTag = document.querySelector('meta[name="nullevia-api-url"]');
  const metaUrl = metaTag ? metaTag.getAttribute('content') : null;

  // Determine active API base URL
  let resolvedUrl;
  if (metaUrl && metaUrl.trim() !== '') {
    resolvedUrl = metaUrl.trim();
  } else if (isLocalhost) {
    resolvedUrl = 'http://localhost:5000';
  } else if (PRODUCTION_API_URL && PRODUCTION_API_URL.trim() !== '') {
    resolvedUrl = PRODUCTION_API_URL.trim();
  } else {
    // If not configured yet in production, default to relative or same-origin fallback
    resolvedUrl = window.location.origin;
  }

  // Remove trailing slashes
  resolvedUrl = resolvedUrl.replace(/\/+$/, '');

  window.NULLEVIA_CONFIG = Object.freeze({
    API_BASE_URL: resolvedUrl,
    IS_LOCAL: isLocalhost,
    HEALTH_CHECK_INTERVAL_MS: 30000,
    REQUEST_TIMEOUT_MS: 8000,
  });

  console.log(`[Nullevia Config] Active API Base URL: ${window.NULLEVIA_CONFIG.API_BASE_URL} (Localhost: ${isLocalhost})`);
})();
