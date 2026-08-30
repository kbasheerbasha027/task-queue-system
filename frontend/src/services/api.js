const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  getHealth: () => request('/api/health'),
  getMetrics: () => request('/api/metrics/dashboard'),
  getJobs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.append(key, value);
    });
    const queryString = query.toString();
    return request(`/api/jobs/history${queryString ? `?${queryString}` : ''}`);
  },
  getJobById: (jobId) => request(`/api/jobs/${jobId}`),
  submitJob: (payload) => request('/api/jobs/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  cancelJob: (jobId) => request(`/api/jobs/${jobId}/cancel`, {
    method: 'POST',
  }),
};
