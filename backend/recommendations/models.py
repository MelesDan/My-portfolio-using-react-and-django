from django.conf import settings
from django.db import models

from catalog.models import Product


class Interaction(models.Model):
    class Action(models.TextChoices):
        VIEW = "view", "View"
        SEARCH = "search", "Search"
        CART = "cart", "Cart"
        PURCHASE = "purchase", "Purchase"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interactions",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="interactions",
        null=True,
        blank=True,
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    search_query = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.user_id}:{self.action}"
