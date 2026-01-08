import { fetchUtils, DataProvider } from 'react-admin';
import { stringify } from 'query-string';
import { getCurrentToken } from './authProvider';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8084/api';

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  
  // Add auth token - uses the correct token based on current portal (admin or dealer)
  const token = getCurrentToken();
  if (token) {
    (options.headers as Headers).set('Authorization', `Bearer ${token}`);
  }
  
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider: DataProvider = {
  getList: (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = 'id', order = 'ASC' } = params.sort || {};
    
    // React-admin 'q' parametresini Django REST Framework 'search' parametresine dönüştür
    const { q, ...restFilter } = params.filter || {};
    
    const query: Record<string, any> = {
      page,
      page_size: perPage,
      ordering: order === 'DESC' ? `-${field}` : field,
      ...restFilter,
    };
    
    // Arama parametresi varsa ekle
    if (q) {
      query.search = q;
    }
    
    const url = `${API_URL}/${resource}/?${stringify(query)}`;
    
    return httpClient(url).then(({ json }) => ({
      data: json.results,
      total: json.count,
    }));
  },

  getOne: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}/`).then(({ json }) => ({
      data: json,
    })),

  getMany: (resource, params) => {
    const query = {
      id__in: params.ids.join(','),
    };
    const url = `${API_URL}/${resource}/?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json.results }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    
    const query = {
      page,
      page_size: perPage,
      ordering: order === 'DESC' ? `-${field}` : field,
      [params.target]: params.id,
      ...params.filter,
    };
    
    const url = `${API_URL}/${resource}/?${stringify(query)}`;
    
    return httpClient(url).then(({ json }) => ({
      data: json.results,
      total: json.count,
    }));
  },

  create: (resource, params) =>
    httpClient(`${API_URL}/${resource}/`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id } as any,
    })),

  update: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}/`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json })),

  updateMany: (resource, params) => {
    const query = {
      id__in: params.ids.join(','),
    };
    return httpClient(`${API_URL}/${resource}/?${stringify(query)}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  delete: (resource, params) =>
    httpClient(`${API_URL}/${resource}/${params.id}/`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) => {
    const query = {
      id__in: params.ids.join(','),
    };
    return httpClient(`${API_URL}/${resource}/?${stringify(query)}`, {
      method: 'DELETE',
    }).then(({ json }) => ({ data: json }));
  },

  // Custom request for non-standard endpoints (e.g., reports)
  customRequest: (_resource: string, params: { method?: string; url: string; data?: any }) =>
    httpClient(`${API_URL}/${params.url}`, {
      method: params.method || 'GET',
      body: params.data ? JSON.stringify(params.data) : undefined,
    }).then(({ json }) => ({ data: json })),
};

