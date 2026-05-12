export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

class ApiClient {
  private authToken: string | null = null;

  private getBaseUrl(): string {
    if (typeof window === 'undefined') {
      return process.env.API_URL_FOR_SERVER || 'http://api:3000';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getAuthToken(): string | null {
    if (this.authToken) return this.authToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.getBaseUrl()}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          error: 'Unknown Error',
          message: 'An unexpected error occurred',
        }));
        throw new Error(error.message || error.error);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
