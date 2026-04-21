from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.serializers import (
    AdminUserStatusSerializer,
    AuthResponseSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
from core.permissions import IsAdminRole
from core.utils import log_activity


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(AuthResponseSerializer.build(user), status=status.HTTP_201_CREATED, headers=headers)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(AuthResponseSerializer.build(user))


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = User.objects.all()


class AdminUserStatusView(generics.UpdateAPIView):
    serializer_class = AdminUserStatusSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = User.objects.all()

    def perform_update(self, serializer):
        user = serializer.save()
        log_activity(
            actor=self.request.user,
            action="user_status_updated",
            instance=user,
            notes={"is_active": user.is_active},
        )
