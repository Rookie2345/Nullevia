/**
 * NULLEVIA Unified API Service
 * 
 * Handles resilient communications with the backend, detects sleeping instances,
 * and maintains continuous UI responsiveness without full-screen blocking.
 */

(function () {
  const statusListeners = [];
  let currentUplinkState = {
    status: 'checking', // 'online' | 'waking' | 'offline' | 'checking'
    details: 'Initiating archive uplink...',
    database: null,
  };

  function notifyStatus(state) {
    currentUplinkState = { ...currentUplinkState, ...state };
    statusListeners.forEach((listener) => {
      try {
        listener(currentUplinkState);
      } catch (err) {
        console.error('[API Listener Error]', err);
      }
    });
  }

  /**
   * Safe fetch with configurable timeout and abort controller
   */
  async function safeFetch(endpoint, options = {}, timeoutMs = 7000) {
    const config = window.NULLEVIA_CONFIG || { API_BASE_URL: 'http://localhost:5000' };
    const url = `${config.API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Server may be spinning up.');
      }
      throw err;
    }
  }

  /**
   * Health Check with automatic uplink status update
   */
  async function checkHealth() {
    notifyStatus({ status: 'checking', details: 'Contacting archive...' });
    try {
      // Allow up to 10s for health check in case backend is spinning up
      const data = await safeFetch('/api/health', {}, 10000);
      
      const isHealthy = data.status === 'healthy';
      const dbConnected = data.database && data.database.connected;

      let statusMsg = 'Archive Uplink: Operational';
      if (!dbConnected) {
        statusMsg = 'Archive Uplink: Cache Only (DB Standby)';
      }

      notifyStatus({
        status: 'online',
        details: statusMsg,
        database: data.database,
      });

      return data;
    } catch (err) {
      const isTimeout = err.message.includes('timed out');
      notifyStatus({
        status: isTimeout ? 'waking' : 'offline',
        details: isTimeout ? 'Archive Reawakening (Render spin-up)...' : 'Archive Offline (Standalone mode active)',
      });
      return null;
    }
  }

  /**
   * Get Featured Artifact
   */
  async function getFeaturedArtifact() {
    try {
      const res = await safeFetch('/api/artifacts/featured', {}, 6000);
      return res.data;
    } catch (err) {
      console.warn('[Nullevia API] Featured artifact fetch notice:', err.message);
      return null; // Signals main.js to use built-in graceful fallback
    }
  }

  /**
   * Get Collections
   */
  async function getCollections() {
    try {
      const res = await safeFetch('/api/collections', {}, 6000);
      return res.data;
    } catch (err) {
      console.warn('[Nullevia API] Collections fetch notice:', err.message);
      return null;
    }
  }

  window.NulleviaAPI = {
    checkHealth,
    getFeaturedArtifact,
    getCollections,
    getStatus: () => ({ ...currentUplinkState }),
    onStatusChange: (callback) => {
      statusListeners.push(callback);
      callback(currentUplinkState);
      return () => {
        const idx = statusListeners.indexOf(callback);
        if (idx !== -1) statusListeners.splice(idx, 1);
      };
    },
  };
})();
