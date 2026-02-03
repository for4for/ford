import React, { createContext, useContext, useMemo, ReactNode, useEffect, useState } from 'react';
import { brands, BrandConfig, BrandKey } from '../config/brands';
import { detectBrand, persistBrand, buildBrandUrl, getBrandBasePath } from '../utils/brandUtils';

interface BrandContextType {
  brand: BrandConfig;
  brandKey: BrandKey;
  setBrand: (brand: BrandKey) => void;
  buildUrl: (path: string) => string;
  basePath: string;
}

const defaultBrandKey = detectBrand();

const BrandContext = createContext<BrandContextType>({
  brand: brands[defaultBrandKey],
  brandKey: defaultBrandKey,
  setBrand: () => {},
  buildUrl: (path: string) => path,
  basePath: '',
});

// Hook to use brand context
export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

interface BrandProviderProps {
  children: ReactNode;
}

// Auto-detecting brand provider
export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  const [brandKey, setBrandKeyState] = useState<BrandKey>(detectBrand);
  const brandConfig = brands[brandKey];

  // Re-detect on location change
  useEffect(() => {
    const handleLocationChange = () => {
      const detected = detectBrand();
      setBrandKeyState(detected);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update document title and favicon when brand changes
  useEffect(() => {
    document.title = `${brandConfig.name} Bayi Otomasyonu`;
    
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon) {
      favicon.href = brandConfig.favicon;
    }
  }, [brandConfig]);

  const value = useMemo(() => {
    const setBrand = (newBrand: BrandKey) => {
      persistBrand(newBrand);
      setBrandKeyState(newBrand);
    };

    return {
      brand: brands[brandKey],
      brandKey,
      setBrand,
      buildUrl: (path: string) => buildBrandUrl(path, brandKey),
      basePath: getBrandBasePath(brandKey),
    };
  }, [brandKey]);

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

// Static brand provider for cases where we know the brand
interface StaticBrandProviderProps {
  brandKey: BrandKey;
  children: ReactNode;
}

export const StaticBrandProvider: React.FC<StaticBrandProviderProps> = ({ brandKey, children }) => {
  const brandConfig = brands[brandKey];
  
  // Persist the brand and update document title/favicon
  useEffect(() => {
    persistBrand(brandKey);
    
    // Update document title
    document.title = `${brandConfig.name} Bayi Otomasyonu`;
    
    // Update favicon
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon) {
      favicon.href = brandConfig.favicon;
    }
  }, [brandKey, brandConfig]);

  const value = useMemo(() => ({
    brand: brands[brandKey],
    brandKey,
    setBrand: (newBrand: BrandKey) => persistBrand(newBrand),
    buildUrl: (path: string) => buildBrandUrl(path, brandKey),
    basePath: getBrandBasePath(brandKey),
  }), [brandKey]);

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

export default BrandContext;
