from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from core.permissions import IsAdminRole
from core.utils import log_activity
from orders.models import CartItem, Order
from orders.serializers import (
    AddCartItemSerializer,
    AdminOrderStatusSerializer,
    CartItemSerializer,
    CheckoutSerializer,
    OrderSerializer,
    PaymentSimulationSerializer,
    UpdateCartItemSerializer,
)
from orders.services import create_order_from_cart, simulate_payment
from recommendations.models import Interaction


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = CartItem.objects.filter(user=request.user).select_related("product", "product__category")
        serializer = CartItemSerializer(items, many=True)
        total = sum(item.quantity * item.product.price for item in items)
        return Response({"items": serializer.data, "total": total})

    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = Product.objects.get(pk=serializer.validated_data["product_id"], is_active=True)
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={"quantity": serializer.validated_data["quantity"]},
        )
        if not created:
            cart_item.quantity += serializer.validated_data["quantity"]
            cart_item.save(update_fields=["quantity", "updated_at"])

        Interaction.objects.create(
            user=request.user,
            product=product,
            action=Interaction.Action.CART,
        )
        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = CartItem.objects.get(pk=pk, user=request.user)
        item.quantity = serializer.validated_data["quantity"]
        item.save(update_fields=["quantity", "updated_at"])
        return Response(CartItemSerializer(item).data)

    def delete(self, request, pk):
        item = CartItem.objects.get(pk=pk, user=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            order = create_order_from_cart(
                user=request.user,
                shipping_address=serializer.validated_data["shipping_address"],
                payment_method=serializer.validated_data["payment_method"],
                notes=serializer.validated_data.get("notes", ""),
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        log_activity(request.user, "order_created", order, {"total": str(order.total_amount)})
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class PaymentSimulationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_reference):
        serializer = PaymentSimulationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = Order.objects.get(order_reference=order_reference, user=request.user)
        try:
            order = simulate_payment(
                order=order,
                acting_user=request.user,
                success=serializer.validated_data["success"],
                method=serializer.validated_data["method"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data)


class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items", "payment")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "order_reference"

    def get_queryset(self):
        queryset = Order.objects.prefetch_related("items", "payment")
        user = self.request.user
        if user.is_staff or user.role == "admin":
            return queryset
        return queryset.filter(user=user)


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = Order.objects.select_related("user").prefetch_related("items", "payment")
        search = self.request.query_params.get("search")
        status_value = self.request.query_params.get("status")
        if search:
            queryset = queryset.filter(
                Q(order_reference__icontains=search)
                | Q(user__full_name__icontains=search)
                | Q(user__email__icontains=search)
            )
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset


class AdminOrderStatusView(generics.UpdateAPIView):
    serializer_class = AdminOrderStatusSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = Order.objects.all()
    lookup_field = "order_reference"

    def perform_update(self, serializer):
        order = serializer.save()
        log_activity(
            self.request.user,
            "order_status_updated",
            order,
            {"status": order.status},
        )
