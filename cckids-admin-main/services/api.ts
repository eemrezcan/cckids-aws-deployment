import { TokenResponse } from '../types';

// Determine the API base URL from environment variables or use the default provided
const BASE_URL = (import.meta as any).env?.VITE_API_URL || 
                 (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
                 'https://api.cckkids.com';

const API_BASE = `${BASE_URL}/admin`;

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.detail || 'API Request Failed';
    
    // If errorMessage is an object/array (common with Pydantic/FastAPI validation errors), stringify it
    if (typeof errorMessage === 'object') {
        errorMessage = JSON.stringify(errorMessage, null, 2);
    }
    
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const api = {
  login: async (payload: any): Promise<TokenResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  get: async <T>(endpoint: string, params: Record<string, any> = {}): Promise<T> => {
    const url = new URL(`${API_BASE}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, String(params[key]));
        }
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  patch: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint: string): Promise<void> => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  upload: async <T>(endpoint: string, file: File): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(true), // Content-Type is auto-set by browser for FormData
        body: formData,
    });
    return handleResponse(res);
  },

  uploadWithFormData: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  }
};
