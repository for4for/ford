from django.apps import AppConfig


class DealersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.dealers'
    verbose_name = 'Bayiler'
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.dealers.signals







