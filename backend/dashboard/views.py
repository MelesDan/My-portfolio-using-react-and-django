from django.db.models import Count, F, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from catalog.models import Product
from core.permissions import IsAdminRole
from orders.models import Order


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        fulfilled_statuses = [
            Order.Status.PAID,
            Order.Status.PROCESSING,
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
        ]
        total_sales = (
            Order.objects.filter(status__in=fulfilled_statuses).aggregate(value=Sum("total_amount"))["value"] or 0
        )
        top_products = (
            Product.objects.filter(is_active=True)
            .order_by("-units_sold", "name")
            .values("id", "name", "stock_qty", "units_sold")[:5]
        )
        low_stock = (
            Product.objects.filter(is_active=True, stock_qty__lte=F("stock_alert_threshold"))
            .order_by("stock_qty", "name")
            .values("id", "name", "stock_qty")[:8]
        )
        orders_by_status = (
            Order.objects.values("status")
            .annotate(total=Count("id"))
            .order_by("status")
        )
        recent_orders = (
            Order.objects.select_related("user")
            .order_by("-created_at")[:5]
            .values("order_reference", "status", "total_amount", "user__full_name", "created_at")
        )

        payload = {
            "metrics": {
                "total_sales": total_sales,
                "total_orders": Order.objects.count(),
                "active_users": User.objects.filter(is_active=True, role=User.Role.CUSTOMER).count(),
                "featured_products": Product.objects.filter(is_featured=True, is_active=True).count(),
            },
            "orders_by_status": list(orders_by_status),
            "top_products": list(top_products),
            "low_stock": list(low_stock),
            "recent_orders": list(recent_orders),
        }
        return Response(payload)
