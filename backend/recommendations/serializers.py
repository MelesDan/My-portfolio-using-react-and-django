from rest_framework import serializers

from recommendations.models import Interaction


class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        fields = ("id", "product", "action", "search_query", "created_at")
        read_only_fields = ("id", "created_at")
