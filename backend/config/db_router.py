"""
Multi-tenant Database Router

Bu modül, brand bazlı veritabanı yönlendirmesi için gerekli
thread-local storage ve database router içerir.

Akış:
1. Request gelir → BrandMiddleware Host header'dan brand belirler
2. Brand, thread-local storage'a kaydedilir
3. DB Router, her query için thread-local'dan brand okur
4. Doğru veritabanına yönlendirir (ford veya tofas)
"""
import threading
from typing import Optional

# Thread-local storage for brand context
# Her request/thread için ayrı brand değeri tutulur
_brand_context = threading.local()


def set_current_brand(brand: str) -> None:
    """
    Set the current brand for this request/thread.
    
    Args:
        brand: 'ford' veya 'tofas'
    """
    _brand_context.brand = brand


def get_current_brand() -> str:
    """
    Get the current brand for this request/thread.
    
    Returns:
        Current brand
    
    Raises:
        RuntimeError: Brand seçilmemişse hata fırlatır
    """
    brand = getattr(_brand_context, 'brand', None)
    if brand is None:
        raise RuntimeError(
            "Brand context not set! "
            "Use set_current_brand('ford') or set_current_brand('tofas') before database operations. "
            "For management commands, add --brand parameter."
        )
    return brand


def clear_current_brand() -> None:
    """
    Clear the brand context after request is complete.
    Memory leak önleme için request sonrası çağrılmalı.
    """
    if hasattr(_brand_context, 'brand'):
        del _brand_context.brand


class BrandDatabaseRouter:
    """
    Database router that directs all queries to the appropriate database
    based on the current brand context.
    
    Usage:
        settings.py'de DATABASE_ROUTERS = ['config.db_router.BrandDatabaseRouter']
    
    Databases:
        - 'ford': Ford veritabanı
        - 'tofas': Tofaş veritabanı (default)
    """
    
    def db_for_read(self, model, **hints) -> str:
        """
        Return the database alias to use for read operations.
        """
        return get_current_brand()
    
    def db_for_write(self, model, **hints) -> str:
        """
        Return the database alias to use for write operations.
        """
        return get_current_brand()
    
    def allow_relation(self, obj1, obj2, **hints) -> bool:
        """
        Allow relations only within the same database.
        Cross-database relations are not supported.
        """
        # Her iki object da aynı brand'in DB'sinde olmalı
        return True
    
    def allow_migrate(self, db: str, app_label: str, model_name: Optional[str] = None, **hints) -> bool:
        """
        Allow migrations on all databases.
        Her iki DB'de de aynı şema olmalı.
        """
        return True

