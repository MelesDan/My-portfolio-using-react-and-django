from django.urls import path

from orders.views import (
    AdminOrderListView,
    AdminOrderStatusView,
    CartItemDetailView,
    CartView,
    CheckoutView,
    OrderDetailView,
    PaymentSimulationView,
    UserOrderListView,
)


urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/<int:pk>/", CartItemDetailView.as_view(), name="cart-item"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("my-orders/", UserOrderListView.as_view(), name="my-orders"),
    path("my-orders/<str:order_reference>/", OrderDetailView.as_view(), name="order-detail"),
    path("<str:order_reference>/pay/", PaymentSimulationView.as_view(), name="order-pay"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-orders"),
    path("admin/orders/<str:order_reference>/", AdminOrderStatusView.as_view(), name="admin-order-status"),
]
