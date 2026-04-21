from django.urls import path

from accounts.views import (
    AdminUserListView,
    AdminUserStatusView,
    LoginView,
    ProfileView,
    RegisterView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", ProfileView.as_view(), name="profile"),
    path("admin/users/<int:pk>/", AdminUserStatusView.as_view(), name="admin-user-status"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
]
