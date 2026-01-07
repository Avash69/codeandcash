// Simple API client using fetch
export const apiClient = {
  get: async (url, options = {}) => {
    const response = await fetch(url, { ...options, method: "GET" });
    if (!response.ok) throw new Error(await response.text());
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
  post: async (url, data, options = {}) => {
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
  put: async (url, data, options = {}) => {
    const response = await fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
  delete: async (url, options = {}) => {
    const response = await fetch(url, { ...options, method: "DELETE" });
    if (!response.ok) throw new Error(await response.text());
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
};

// Wrapper to handle errors and optionally add more logic
export const apiWrapper = async (fn) => {
  return await fn();
};
