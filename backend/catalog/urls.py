from django.urls import include, path
from rest_framework.routers import DefaultRouter

from catalog.views import (
    AdminCategoryViewSet,
    AdminProductViewSet,
    CategoryListView,
    ProductDetailView,
    ProductListView,
)


router = DefaultRouter()
router.register("admin/categories", AdminCategoryViewSet, basename="admin-category")
router.register("admin/products", AdminProductViewSet, basename="admin-product")

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="categories"),
    path("products/", ProductListView.as_view(), name="products"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
    path("", include(router.urls)),
]
