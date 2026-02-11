"""
Meta (Facebook) Ads Service
PHP MetaAdsService2.php referans alınarak Python facebook-business SDK'ya dönüştürüldü.

Kullanım:
    from apps.campaigns.services.meta_ads_service import MetaAdsService

    service = MetaAdsService()
    result = service.create_full_campaign(campaign_request)
"""
import logging
import os
import tempfile
import requests
from datetime import datetime, timedelta

from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.adcreative import AdCreative
from facebook_business.adobjects.ad import Ad
from facebook_business.adobjects.adimage import AdImage

logger = logging.getLogger(__name__)


class MetaAdsServiceError(Exception):
    """MetaAdsService özel hata sınıfı"""
    pass


class MetaAdsService:
    """
    Meta (Facebook) Ads API servisi.
    Campaign -> AdSet -> Creative -> Ad zincirini yönetir.
    """

    def __init__(self, config=None):
        """
        Args:
            config: MetaAdsConfig model instance veya None (DB'den otomatik alır)
        """
        if config is None:
            from apps.campaigns.models import MetaAdsConfig
            config = MetaAdsConfig.get_config()

        if not config:
            raise MetaAdsServiceError('Meta Ads konfigürasyonu bulunamadı. Admin panelinden ayarlayın.')

        self.app_id = config.app_id
        self.app_secret = config.app_secret
        self.access_token = config.access_token
        self.ad_account_id = config.ad_account_id
        self.default_objective = config.default_objective
        self.default_billing_event = config.default_billing_event
        self.default_optimization_goal = config.default_optimization_goal

        # Facebook API'yi başlat
        FacebookAdsApi.init(self.app_id, self.app_secret, self.access_token)
        self.api = FacebookAdsApi.get_default_api()
        self.ad_account = AdAccount(self.ad_account_id)

    def create_full_campaign(self, campaign_request):
        """
        Tam bir Facebook kampanyası oluşturur:
        1. Campaign
        2. AdSet (hedefleme, bütçe)
        3. AdCreative (görsel + metin)
        4. Ad (reklam)

        Args:
            campaign_request: CampaignRequest model instance

        Returns:
            dict: {
                'success': True/False,
                'campaign_id': str,
                'adset_id': str,
                'creative_id': str,
                'ad_id': str,
                'error': str (sadece hata durumunda)
            }
        """
        try:
            dealer = campaign_request.dealer

            # Gerekli alanları kontrol et
            page_id = dealer.fb_page_id
            if not page_id:
                raise MetaAdsServiceError(
                    f'Bayi "{dealer.dealer_name}" için Facebook Sayfa ID tanımlanmamış.'
                )

            # Website URL'yi belirle (redirect_type'a göre)
            website_url = campaign_request.website_url
            if not website_url:
                if campaign_request.redirect_type == 'satis' and dealer.sales_url:
                    website_url = dealer.sales_url
                elif campaign_request.redirect_type == 'servis' and dealer.service_url:
                    website_url = dealer.service_url

            if not website_url:
                raise MetaAdsServiceError(
                    'Yönlendirme URL\'si bulunamadı. Kampanyada veya bayi profilinde URL tanımlayın.'
                )

            # Günlük bütçeyi hesapla (kuruş cinsinden)
            days = (campaign_request.end_date - campaign_request.start_date).days or 1
            total_budget_kurus = int(float(campaign_request.budget) * 100)
            daily_budget = max(total_budget_kurus // days, 100)  # Min 1 TL/gün

            # ===== 1. Kampanya Oluştur =====
            logger.info(f'[MetaAds] Kampanya oluşturuluyor: {campaign_request.campaign_name}')

            campaign_params = {
                Campaign.Field.name: campaign_request.campaign_name,
                Campaign.Field.objective: self.default_objective,
                Campaign.Field.status: Campaign.Status.paused,
                'special_ad_categories': ['NONE'],
                'is_adset_budget_sharing_enabled': False,
            }

            campaign = self.ad_account.create_campaign(params=campaign_params)
            campaign_id = campaign.get_id()
            logger.info(f'[MetaAds] Kampanya oluşturuldu: {campaign_id}')

            # ===== 2. AdSet Oluştur =====
            adset_name = f'{campaign_request.campaign_name} - Reklam Seti'

            # Optimization goal'a göre bid_amount belirle
            # REACH + IMPRESSIONS => bid_amount zorunlu (kuruş cinsinden, min 100 = 1 TL)
            optimization_goal = self.default_optimization_goal
            billing_event = self.default_billing_event
            bid_amount = None

            if optimization_goal == 'REACH' and billing_event == 'IMPRESSIONS':
                # CPM bazlı: 1000 gösterim başına teklif (kuruş cinsinden)
                bid_amount = max(daily_budget // 10, 100)  # Günlük bütçenin ~%10'u, min 1 TL

            adset_params = {
                AdSet.Field.name: adset_name,
                AdSet.Field.optimization_goal: optimization_goal,
                AdSet.Field.billing_event: billing_event,
                AdSet.Field.daily_budget: daily_budget,
                AdSet.Field.campaign_id: campaign_id,
                AdSet.Field.targeting: {
                    'geo_locations': {
                        'countries': ['TR'],
                    },
                    'age_min': 18,
                    'age_max': 65,
                },
                AdSet.Field.status: AdSet.Status.paused,
                'start_time': campaign_request.start_date.strftime('%Y-%m-%dT00:00:00Z'),
                'end_time': campaign_request.end_date.strftime('%Y-%m-%dT23:59:59Z'),
            }

            if bid_amount:
                adset_params[AdSet.Field.bid_amount] = bid_amount

            adset = self.ad_account.create_ad_set(params=adset_params)
            adset_id = adset.get_id()
            logger.info(f'[MetaAds] AdSet oluşturuldu: {adset_id}')

            # ===== 3. Görsel yükleme (CampaignCreativeFile'dan) =====
            image_hash = None
            creative_files = campaign_request.creative_files.filter(
                file_type__in=['post', 'story']
            ).order_by('-uploaded_at')

            if creative_files.exists():
                first_image = creative_files.first()
                # file.url Azure Blob / local storage URL'sini verir
                image_url = first_image.file.url
                logger.info(f'[MetaAds] Görsel yükleniyor: {first_image.file_name} ({image_url})')
                image_result = self.upload_image(image_url)
                if image_result.get('success'):
                    image_hash = image_result['hash']
                else:
                    logger.warning(f'[MetaAds] Görsel yükleme başarısız: {image_result.get("error")}')

            # ===== 4. Creative Oluştur =====
            creative_name = f'{campaign_request.campaign_name} - Creative'
            ad_message = campaign_request.ad_message or campaign_request.campaign_name
            cta_type = campaign_request.cta_type or 'LEARN_MORE'

            object_story_spec = {
                'page_id': page_id,
            }

            # Instagram ID varsa ekle
            if dealer.instagram_account_id:
                object_story_spec['instagram_actor_id'] = dealer.instagram_account_id

            # Link data oluştur
            link_data = {
                'message': ad_message,
                'link': website_url,
                'call_to_action': {
                    'type': cta_type,
                },
            }

            if image_hash:
                link_data['image_hash'] = image_hash

            object_story_spec['link_data'] = link_data

            creative_params = {
                AdCreative.Field.name: creative_name,
                AdCreative.Field.object_story_spec: object_story_spec,
            }

            # Creative oluştur, Instagram ID hata verirse onsuz dene
            try:
                creative = self.ad_account.create_ad_creative(params=creative_params)
            except Exception as e:
                if 'instagram_actor_id' in str(e) and 'instagram_actor_id' in object_story_spec:
                    logger.warning('[MetaAds] Instagram ID hatası, onsuz tekrar deneniyor...')
                    del object_story_spec['instagram_actor_id']
                    creative_params[AdCreative.Field.object_story_spec] = object_story_spec
                    creative = self.ad_account.create_ad_creative(params=creative_params)
                else:
                    raise

            creative_id = creative.get_id()
            logger.info(f'[MetaAds] Creative oluşturuldu: {creative_id}')

            # ===== 5. Ad Oluştur =====
            ad_name = f'{campaign_request.campaign_name} - Reklam'

            ad_params = {
                Ad.Field.name: ad_name,
                Ad.Field.adset_id: adset_id,
                Ad.Field.creative: {'creative_id': creative_id},
                Ad.Field.status: Ad.Status.paused,
            }

            ad = self.ad_account.create_ad(params=ad_params)
            ad_id = ad.get_id()
            logger.info(f'[MetaAds] Ad oluşturuldu: {ad_id}')

            return {
                'success': True,
                'campaign_id': campaign_id,
                'adset_id': adset_id,
                'creative_id': creative_id,
                'ad_id': ad_id,
            }

        except MetaAdsServiceError:
            raise
        except Exception as e:
            logger.error(f'[MetaAds] Kampanya oluşturma hatası: {e}', exc_info=True)
            return {
                'success': False,
                'error': str(e),
            }

    def upload_image(self, image_path_or_url):
        """
        Görsel yükle ve image_hash döndür.

        Args:
            image_path_or_url: Yerel dosya yolu veya URL

        Returns:
            dict: {'success': True, 'hash': str} veya {'success': False, 'error': str}
        """
        try:
            temp_file = None

            # URL ise önce indir
            if image_path_or_url.startswith(('http://', 'https://')):
                response = requests.get(image_path_or_url, timeout=30)
                response.raise_for_status()

                ext = os.path.splitext(image_path_or_url)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
                    ext = '.jpg'

                temp_file = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
                temp_file.write(response.content)
                temp_file.close()
                file_path = temp_file.name
            else:
                file_path = image_path_or_url

            # Dosya uzantısı kontrolü
            ext = os.path.splitext(file_path)[1].lower()
            if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
                raise MetaAdsServiceError(
                    f'Desteklenmeyen dosya uzantısı: {ext}. Sadece jpg, jpeg, png ve gif.'
                )

            # Facebook'a yükle
            image = AdImage(parent_id=self.ad_account_id)
            image[AdImage.Field.filename] = file_path
            image.remote_create()

            image_hash = image[AdImage.Field.hash]
            logger.info(f'[MetaAds] Görsel yüklendi, hash: {image_hash}')

            return {
                'success': True,
                'hash': image_hash,
            }

        except MetaAdsServiceError:
            raise
        except Exception as e:
            logger.error(f'[MetaAds] Görsel yükleme hatası: {e}', exc_info=True)
            return {
                'success': False,
                'error': str(e),
            }
        finally:
            # Geçici dosyayı temizle
            if temp_file and os.path.exists(temp_file.name):
                os.unlink(temp_file.name)

    def check_campaign_status(self, fb_campaign_id):
        """
        Facebook kampanyasının durumunu sorgula.

        Args:
            fb_campaign_id: Facebook Campaign ID

        Returns:
            dict: {'status': str, 'effective_status': str, ...}
        """
        try:
            campaign = Campaign(fb_campaign_id)
            campaign_data = campaign.api_get(fields=[
                Campaign.Field.name,
                Campaign.Field.status,
                Campaign.Field.effective_status,
                Campaign.Field.configured_status,
            ])

            return {
                'success': True,
                'name': campaign_data.get('name'),
                'status': campaign_data.get('status'),
                'effective_status': campaign_data.get('effective_status'),
                'configured_status': campaign_data.get('configured_status'),
            }

        except Exception as e:
            logger.error(f'[MetaAds] Kampanya durum sorgulama hatası: {e}', exc_info=True)
            return {
                'success': False,
                'error': str(e),
            }

