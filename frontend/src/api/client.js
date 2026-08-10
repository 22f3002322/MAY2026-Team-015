const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const getTokens = () => {
  try {
    const authData = localStorage.getItem("auth-storage");
    if (authData) {
      const parsed = JSON.parse(authData);
      return {
        accessToken: parsed?.state?.accessToken || null,
        refreshToken: parsed?.state?.refreshToken || null,
      };
    }
  } catch (e) {
    console.error("Error reading tokens from localStorage:", e);
  }
  return { accessToken: null, refreshToken: null };
};

export async function apiRequest(endpoint, options = {}) {
  const { accessToken } = getTokens();
  const headers = {
    ...options.headers,
  };

  // Set Content-Type to application/json unless body is FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new Error(netErr.message || "Network error. Backend server unreachable.");
  }

  // Handle 401 Token Refresh flow
  if (response.status === 401 && !options._retry && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
    const { refreshToken } = getTokens();
    if (refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newTok) => {
          options._retry = true;
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${newTok}`,
          };
          return apiRequest(endpoint, options);
        });
      }

      options._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.success && refreshData.data?.access_token) {
          const newAccessToken = refreshData.data.access_token;
          const newRefreshToken = refreshData.data.refresh_token;

          // Update storage
          const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
          if (authData.state) {
            authData.state.accessToken = newAccessToken;
            authData.state.refreshToken = newRefreshToken;
            localStorage.setItem("auth-storage", JSON.stringify(authData));
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry original request
          headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiRequest(endpoint, { ...options, headers });
        } else {
          localStorage.removeItem("auth-storage");
          processQueue(new Error("Refresh failed"), null);
          isRefreshing = false;
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      } catch (err) {
        localStorage.removeItem("auth-storage");
        processQueue(err, null);
        isRefreshing = false;
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    } else {
      localStorage.removeItem("auth-storage");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export { BASE_URL };
