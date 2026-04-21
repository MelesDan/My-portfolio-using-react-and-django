from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.serializers import ProductListSerializer
from recommendations.models import Interaction
from recommendations.serializers import InteractionSerializer
from recommendations.services import get_recommendations_for_user, get_trending_products


class InteractionCreateView(generics.CreateAPIView):
    serializer_class = InteractionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ForYouView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = get_recommendations_for_user(request.user)
        return Response(ProductListSerializer(products, many=True).data)


class TrendingView(APIView):
    def get(self, request):
        products = get_trending_products()
        return Response(ProductListSerializer(products, many=True).data)
