// Multi-Brand Configuration
// URL path'ine göre marka teması ve ayarları belirlenir

export type BrandKey = 'ford' | 'tofas';

export interface BrandColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
}

export interface BrandConfig {
  key: BrandKey;
  name: string;
  displayName: string;
  logo: string;
  whiteLogo: string;
  favicon: string;
  colors: BrandColors;
  titles: {
    backoffice: string;
    dealer: string;
  };
}

export const brands: Record<BrandKey, BrandConfig> = {
  ford: {
    key: 'ford',
    name: 'Ford',
    displayName: 'Ford Otosan',
    logo: '/assets/images/ford-logo.svg',
    whiteLogo: '/assets/images/ford-logo.svg',
    favicon: '/assets/images/ford-favicon.svg',
    colors: {
      primary: '#00095B',      // Ford Navy Blue
      primaryLight: '#1a2a7a',
      primaryDark: '#000640',
      secondary: '#fe5419',    // Ford Orange
      secondaryLight: '#ff7a47',
      secondaryDark: '#c43000',
    },
    titles: {
      backoffice: 'Ford Backoffice',
      dealer: 'Ford Bayi Portalı',
    },
  },
  tofas: {
    key: 'tofas',
    name: 'Tofaş',
    displayName: 'Tofaş Türk Otomobil Fabrikası',
    logo: '/assets/images/tofas-logo.png',
    whiteLogo: '/assets/images/tofas-white-logo.png',
    favicon: '/assets/images/tofas-logo.png',
    colors: {
      primary: '#7A1F2E',      // Tofaş Bordo
      primaryLight: '#952539',
      primaryDark: '#621623',
      secondary: '#952539',    // Tofaş Açık Bordo
      secondaryLight: '#A83347',
      secondaryDark: '#621623',
    },
    titles: {
      backoffice: 'Tofaş Backoffice',
      dealer: 'Tofaş Bayi Portalı',
    },
  },
};

// URL'den brand key çıkar
export const getBrandFromPath = (pathname: string): BrandKey => {
  if (pathname.startsWith('/tofas')) return 'tofas';
  if (pathname.startsWith('/ford')) return 'ford';
  // Default olarak tofas (mevcut production)
  return 'tofas';
};

// Brand config al
export const getBrandConfig = (brandKey: BrandKey): BrandConfig => {
  return brands[brandKey];
};

// Tüm brand key'leri
export const allBrandKeys: BrandKey[] = ['ford', 'tofas'];

