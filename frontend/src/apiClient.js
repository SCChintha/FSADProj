// Simple API helper for calling the Java backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
let globalToken = null;

// Ability to globally set token for 'api' default object calls
export const setAuthToken = (token) => {
  globalToken = token;
};

export async function apiRequest(path, { method = "GET", token, headers = {}, body } = {}) {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[api] ${method} ${url}`, body ?? "");

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const finalHeaders = {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...headers,
  };

  if (!isFormData && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const activeToken = token || globalToken || localStorage.getItem("authToken");
  if (activeToken) {
    finalHeaders["Authorization"] = `Bearer ${activeToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    cache: "no-store",
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  console.log(`[api] response ${response.status} ${url}`);

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let message = `Request failed with status ${response.status}`;

    if (contentType.includes("application/json")) {
      const errorPayload = await response.json();
      message =
        errorPayload?.message ||
        errorPayload?.error ||
        errorPayload?.details ||
        message;
    } else {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  // Some endpoints might return no content
  if (response.status === 204) {
    console.log(`[api] empty response ${url}`);
    return null;
  }

  const data = await response.json();
  console.log(`[api] payload ${url}`, data);
  return data;
}

// Axios-like wrapper used by newer components
const api = {
  get: async (url, config = {}) => {
    const data = await apiRequest(url, { method: 'GET', token: config.token, headers: config.headers });
    return { data };
  },
  post: async (url, body, config = {}) => {
    const data = await apiRequest(url, { method: 'POST', body, token: config.token, headers: config.headers });
    return { data };
  },
  put: async (url, body, config = {}) => {
    const data = await apiRequest(url, { method: 'PUT', body, token: config.token, headers: config.headers });
    return { data };
  },
  patch: async (url, body, config = {}) => {
    const data = await apiRequest(url, { method: 'PATCH', body, token: config.token, headers: config.headers });
    return { data };
  },
  delete: async (url, config = {}) => {
    const data = await apiRequest(url, { method: 'DELETE', token: config.token, headers: config.headers });
    return { data };
  }
};

export { API_BASE_URL };
export default api;
