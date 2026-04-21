from django.urls import path

from recommendations.views import ForYouView, InteractionCreateView, TrendingView


urlpatterns = [
    path("for-you/", ForYouView.as_view(), name="for-you"),
    path("trending/", TrendingView.as_view(), name="trending"),
    path("interactions/", InteractionCreateView.as_view(), name="interaction-create"),
]
