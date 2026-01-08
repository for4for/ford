// API Configuration
// Production'da VITE_API_URL kullan, yoksa environment'a göre belirle
const getApiUrl = (): string => {
  // Build sırasında inject edilen değer
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production domain kontrolü
  const hostname = window.location.hostname;
  
  // Production domains
  if (
    hostname.includes('azurewebsites.net') || 
    hostname.includes('bayiler-frontend') ||
    hostname.includes('intechno360.com') ||
    hostname.includes('bayiler.')
  ) {
    return 'https://bayiler-backend.blackfield-af7b499c.westeurope.azurecontainerapps.io/api';
  }
  
  // Local development
  return 'http://localhost:8084/api';
};

export const API_URL = getApiUrl();

// Base URL (without /api) for media files
export const BASE_URL = API_URL.replace('/api', '');

