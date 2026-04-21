from decimal import Decimal

from rest_framework import serializers

from catalog.models import Product
from catalog.serializers import ProductListSerializer
from orders.models import CartItem, Order, OrderItem, Payment


class OrderUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ("id", "product", "quantity", "subtotal", "created_at")

    def get_subtotal(self, obj):
        return Decimal(obj.quantity) * obj.product.price


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate_product_id(self, value):
        if not Product.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError("Product not found.")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField()
    payment_method = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)


class PaymentSimulationSerializer(serializers.Serializer):
    success = serializers.BooleanField(default=True)
    method = serializers.CharField(default="telebirr")


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product_name", "quantity", "price_at_sale")


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ("tx_ref", "method", "status", "verified_at", "gateway_response")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "order_reference",
            "shipping_address",
            "payment_method",
            "total_amount",
            "status",
            "notes",
            "estimated_delivery",
            "created_at",
            "items",
            "payment",
        )

    def get_user(self, obj):
        return {
            "id": obj.user_id,
            "full_name": obj.user.full_name,
            "email": obj.user.email,
        }


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status", "estimated_delivery")
