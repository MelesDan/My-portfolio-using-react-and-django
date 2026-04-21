from django.db.models import Q
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated

from catalog.models import Category, Product
from catalog.serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductWriteSerializer,
)
from core.permissions import IsAdminRole
from core.utils import log_activity
from recommendations.models import Interaction


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related("category")
        params = self.request.query_params
        search = params.get("search")
        category = params.get("category")
        featured = params.get("featured")
        min_price = params.get("min_price")
        max_price = params.get("max_price")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(brand__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
            )
        if category:
            queryset = queryset.filter(Q(category__slug=category) | Q(category__id=category))
        if featured in {"true", "1"}:
            queryset = queryset.filter(is_featured=True)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    queryset = Product.objects.filter(is_active=True).select_related("category")
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        if request.user.is_authenticated:
            Interaction.objects.create(
                user=request.user,
                product=self.get_object(),
                action=Interaction.Action.VIEW,
            )
        return response


class AdminCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = Category.objects.all()

    def perform_create(self, serializer):
        category = serializer.save()
        log_activity(self.request.user, "category_created", category)

    def perform_update(self, serializer):
        category = serializer.save()
        log_activity(self.request.user, "category_updated", category)

    def perform_destroy(self, instance):
        log_activity(self.request.user, "category_deleted", instance)
        instance.delete()


class AdminProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = Product.objects.select_related("category").all()

    def get_serializer_class(self):
        if self.action in {"list", "retrieve"}:
            return ProductDetailSerializer
        return ProductWriteSerializer

    def perform_create(self, serializer):
        product = serializer.save()
        log_activity(self.request.user, "product_created", product)

    def perform_update(self, serializer):
        product = serializer.save()
        log_activity(self.request.user, "product_updated", product)

    def perform_destroy(self, instance):
        log_activity(self.request.user, "product_deleted", instance)
        instance.delete()
