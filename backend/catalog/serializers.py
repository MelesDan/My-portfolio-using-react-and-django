from rest_framework import serializers

from catalog.models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description")


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "brand",
            "description",
            "price",
            "stock_qty",
            "image_url",
            "is_featured",
            "is_low_stock",
            "units_sold",
            "category",
        )


class ProductDetailSerializer(ProductListSerializer):
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ("specifications", "stock_alert_threshold", "is_active")


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "name",
            "sku",
            "brand",
            "description",
            "specifications",
            "price",
            "stock_qty",
            "stock_alert_threshold",
            "image_url",
            "is_featured",
            "is_active",
        )
