/**
 * Kampanya modülü için ortak sabitler
 */

// Facebook CTA (Call to Action) buton tipleri
// Bu değerler Facebook Ads API tarafından belirlenen sabit enum'lardır.
// Custom metin yazılamaz - Facebook kullanıcının diline göre otomatik çevirir.
export const ctaChoices = [
  { id: 'LEARN_MORE', name: 'Daha Fazla Bilgi' },
  { id: 'CONTACT_US', name: 'İletişime Geç' },
  { id: 'SHOP_NOW', name: 'Hemen Al' },
  { id: 'SIGN_UP', name: 'Kaydol' },
  { id: 'GET_QUOTE', name: 'Teklif Al' },
  { id: 'BOOK_NOW', name: 'Randevu Al' },
  { id: 'APPLY_NOW', name: 'Başvur' },
  { id: 'CALL_NOW', name: 'Şimdi Ara' },
  { id: 'SEND_MESSAGE', name: 'Mesaj Gönder' },
  { id: 'WHATSAPP_MESSAGE', name: 'WhatsApp Mesajı' },
  { id: 'GET_OFFER', name: 'Teklifi Al' },
  { id: 'ORDER_NOW', name: 'Sipariş Ver' },
  { id: 'WATCH_MORE', name: 'Daha Fazla İzle' },
  { id: 'SUBSCRIBE', name: 'Abone Ol' },
  { id: 'DOWNLOAD', name: 'İndir' },
  { id: 'NO_BUTTON', name: 'Buton Yok' },
];

// CTA id → Türkçe label map (Show sayfasında MenuItem yerine kullanılır)
export const ctaLabels: Record<string, string> = Object.fromEntries(
  ctaChoices.map((c) => [c.id, c.name])
);

