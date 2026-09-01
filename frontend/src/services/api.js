const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Helper to handle fetch responses and errors uniformly
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch summary statistics from backend
 */
export async function getSummary() {
  return request('/summary');
}

/**
 * Fetch all security logs from backend
 */
export async function getLogs() {
  return request('/logs');
}

/**
 * Fetch detected threats from backend with optional filters
 * @param {Object} [params]
 * @param {string} [params.severity]
 * @param {string} [params.threat_type]
 */
export async function getThreats(params = {}) {
  const query = new URLSearchParams();
  if (params.severity) {
    query.append('severity', params.severity);
  }
  if (params.threat_type) {
    query.append('threat_type', params.threat_type);
  }
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/threats${queryString}`);
}

/**
 * Fetch details of a single threat by ID
 * @param {string} id
 */
export async function getThreat(id) {
  return request(`/threats/${encodeURIComponent(id)}`);
}

export default {
  getSummary,
  getLogs,
  getThreats,
  getThreat,
};
