from django.apps import AppConfig


class CampaignsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.campaigns'
    verbose_name = 'Campaigns'
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.campaigns.signals





