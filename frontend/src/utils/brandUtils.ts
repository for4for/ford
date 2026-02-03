import { BrandKey, brands } from '../config/brands';

const BRAND_STORAGE_KEY = 'app_brand';

// Domain to brand mapping for production
const domainBrandMap: Record<string, BrandKey> = {
  // Production domains
  'ford.bayiler.com': 'ford',
  'tofas.bayiler.com': 'tofas',
  'ford.intechno360.com': 'ford',
  'tofas.intechno360.com': 'tofas',
  // Azure domains
  'ford-bayiler.azurewebsites.net': 'ford',
  'tofas-bayiler.azurewebsites.net': 'tofas',
  // Add more production domains as needed
};

/**
 * Detect brand from various sources in priority order:
 * 
 * ÖNEMLI: localStorage EN ÖNCE kontrol edilir.
 * Bir kez login olduktan sonra brand değişmemeli.
 * JWT token'da brand claim var ve backend buna göre DB seçiyor.
 * 
 * Priority:
 * 1. localStorage (login sonrası persist edilen brand)
 * 2. Domain/subdomain (production - ilk giriş)
 * 3. URL path (/ford/..., /tofas/... - development ilk giriş)
 * 4. URL query param (?brand=ford)
 * 5. Environment variable (VITE_DEFAULT_BRAND)
 * 6. Default fallback (tofas)
 */
export const detectBrand = (): BrandKey => {
  // 1. ÖNCE localStorage'a bak - login olduysa değişmemeli
  const storedBrand = localStorage.getItem(BRAND_STORAGE_KEY);
  if (storedBrand === 'ford' || storedBrand === 'tofas') {
    return storedBrand;
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // 2. Check domain mapping (production)
  const domainBrand = domainBrandMap[hostname];
  if (domainBrand) {
    persistBrand(domainBrand);
    return domainBrand;
  }

  // 3. Check subdomain (e.g., ford.localhost, tofas.example.com)
  const subdomain = hostname.split('.')[0];
  if (subdomain === 'ford' || subdomain === 'tofas') {
    persistBrand(subdomain);
    return subdomain;
  }

  // 4. Check URL path (development: /ford/..., /tofas/...)
  const pathMatch = pathname.match(/^\/(ford|tofas)(\/|$)/);
  if (pathMatch) {
    const pathBrand = pathMatch[1] as BrandKey;
    persistBrand(pathBrand);
    return pathBrand;
  }

  // 5. Check query param (?brand=ford)
  const queryBrand = searchParams.get('brand');
  if (queryBrand === 'ford' || queryBrand === 'tofas') {
    persistBrand(queryBrand);
    return queryBrand;
  }

  // 6. Check environment variable
  const envBrand = import.meta.env.VITE_DEFAULT_BRAND;
  if (envBrand === 'ford' || envBrand === 'tofas') {
    return envBrand;
  }

  // 7. Default fallback
  return 'tofas';
};

/**
 * Persist brand to localStorage
 */
export const persistBrand = (brand: BrandKey): void => {
  localStorage.setItem(BRAND_STORAGE_KEY, brand);
};

/**
 * Get persisted brand from localStorage
 */
export const getPersistedBrand = (): BrandKey | null => {
  const stored = localStorage.getItem(BRAND_STORAGE_KEY);
  if (stored === 'ford' || stored === 'tofas') {
    return stored;
  }
  return null;
};

/**
 * Clear persisted brand
 */
export const clearPersistedBrand = (): void => {
  localStorage.removeItem(BRAND_STORAGE_KEY);
};

/**
 * Get brand config by key
 */
export const getBrandConfig = (brandKey: BrandKey) => {
  return brands[brandKey];
};

/**
 * Check if current environment is production
 */
export const isProduction = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname !== 'localhost' &&
    !hostname.startsWith('127.') &&
    !hostname.startsWith('192.168.')
  );
};

/**
 * Get base path for current brand (for routing)
 * In production with domain-based routing, returns empty string
 * In development with path-based routing, returns /brand
 */
export const getBrandBasePath = (brand: BrandKey): string => {
  // If production domain-based routing
  if (isProduction() && domainBrandMap[window.location.hostname]) {
    return '';
  }
  // Development path-based routing
  return `/${brand}`;
};

/**
 * Build URL with brand prefix if needed
 */
export const buildBrandUrl = (path: string, brand?: BrandKey): string => {
  const currentBrand = brand || detectBrand();
  const basePath = getBrandBasePath(currentBrand);
  
  // If path already starts with brand prefix, don't add again
  if (path.startsWith(`/${currentBrand}/`) || path.startsWith(`/${currentBrand}`)) {
    return path;
  }
  
  // If production (no path prefix needed)
  if (!basePath) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // Development with path prefix
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
};

