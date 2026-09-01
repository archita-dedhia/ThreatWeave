const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchLogs() {
  const response = await fetch(`${API_BASE_URL}/logs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSummary() {
  const response = await fetch(`${API_BASE_URL}/summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch summary: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchThreats() {
  const response = await fetch(`${API_BASE_URL}/threats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch threats: ${response.statusText}`);
  }
  return response.json();
}
