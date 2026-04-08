export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

export const fetchData = async (endpoint, options = {}) => {
  const url = `${API_URL}/${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
