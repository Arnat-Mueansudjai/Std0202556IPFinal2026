import { Platform } from "react-native";

// Server Backend API URL on Teacher's Server (Port 3051)
export const DEFAULT_API_URL = "http://119.59.102.161:3051/api";

let currentBaseUrl = DEFAULT_API_URL;

export const setCustomBaseUrl = (url) => {
  currentBaseUrl = url.trim();
};

export const getBaseUrl = () => currentBaseUrl;

// Helper to make API requests with timeout
async function apiRequest(endpoint, options = {}) {
  const url = `${currentBaseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Connection timed out. Check that backend server is running.");
    }
    throw error;
  }
}

// 1. Authentication
export const loginApi = async (username, password) => {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
};

// 2. Employee CRUD
export const getEmployeesApi = async () => {
  return apiRequest("/employees", { method: "GET" });
};

export const addEmployeeApi = async (employeeData) => {
  return apiRequest("/employees", {
    method: "POST",
    body: JSON.stringify(employeeData)
  });
};

export const updateEmployeeApi = async (id, employeeData) => {
  return apiRequest(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(employeeData)
  });
};

export const toggleEmployeeStatusApi = async (id) => {
  return apiRequest(`/employees/${id}/status`, {
    method: "PUT"
  });
};

export const deleteEmployeeApi = async (id) => {
  return apiRequest(`/employees/${id}`, {
    method: "DELETE"
  });
};

// 3. Phase 2: K-Means Salary Analytics
export const getSalaryClustersApi = async () => {
  return apiRequest("/employees/salary-clusters", {
    method: "GET"
  });
};
