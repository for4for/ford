import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRedirect } from 'react-admin';

/**
 * Smart Back Navigation Hook
 * 
 * Kullanıcının nereden geldiğini otomatik algılar:
 * - Uygulama içi navigasyon varsa (location.key !== "default"): navigate(-1) ile geri gider
 * - Direkt URL ile geldiyse (location.key === "default"): fallback sayfaya yönlendir
 * 
 * @param fallbackPath - Geri gidilecek varsayılan yol (ör: '/backoffice/campaigns/requests')
 * @param fallbackResource - React-admin resource adı (ör: 'campaigns/requests')
 * @returns goBack fonksiyonu
 */
export const useSmartBack = (options?: {
  fallbackPath?: string;
  fallbackResource?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = useRedirect();

  const goBack = useCallback(() => {
    // location.key "default" ise kullanıcı direkt URL ile gelmiştir (sayfa yenilemesi, bookmark vb.)
    // Aksi halde uygulama içi navigasyon geçmişi var demektir
    const hasHistory = location.key !== 'default';

    if (hasHistory) {
      navigate(-1);
    } else if (options?.fallbackResource) {
      redirect('list', options.fallbackResource);
    } else if (options?.fallbackPath) {
      navigate(options.fallbackPath);
    } else {
      // Son çare: tarayıcı geçmişine dön
      navigate(-1);
    }
  }, [location.key, navigate, redirect, options?.fallbackPath, options?.fallbackResource]);

  return goBack;
};

export default useSmartBack;

