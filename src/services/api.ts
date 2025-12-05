const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
  ): Promise<{ data: T }> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'Request failed');
    }

    const responseData = await response.json();
    return { data: responseData };
  }

  get<T>(endpoint: string): Promise<{ data: T }> {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, data?: unknown): Promise<{ data: T }> {
    return this.request<T>('POST', endpoint, data);
  }

  patch<T>(endpoint: string, data?: unknown): Promise<{ data: T }> {
    return this.request<T>('PATCH', endpoint, data);
  }

  delete<T>(endpoint: string): Promise<{ data: T }> {
    return this.request<T>('DELETE', endpoint);
  }

  put<T>(endpoint: string, data?: unknown): Promise<{ data: T }> {
    return this.request<T>('PUT', endpoint, data);
  }
}

const api = new ApiClient();
export default api;

export { api };

export const legacyApi = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: (refreshToken: string) =>
    fetchApi('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  // Restaurants
  getRestaurants: (params?: { categoryId?: string; search?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    const query = searchParams.toString();
    return fetchApi(`/restaurants${query ? `?${query}` : ''}`);
  },

  getRestaurantBySlug: (slug: string) => fetchApi(`/restaurants/${slug}`),

  getRestaurantMenu: (id: string) => fetchApi(`/restaurants/${id}/menu`),

  getCategories: () => fetchApi('/restaurants/categories'),

  // Orders
  createOrder: (data: any, token: string) =>
    fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getOrders: (token: string, page = 1) =>
    fetchApi(`/orders?page=${page}`, { token }),

  getOrder: (id: string, token: string) =>
    fetchApi(`/orders/${id}`, { token }),

  // User
  getProfile: (token: string) => fetchApi('/users/me', { token }),

  updateProfile: (data: { name?: string; phone?: string }, token: string) =>
    fetchApi('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),
};
