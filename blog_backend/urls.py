# blog_backend/urls.py
from django.contrib import admin
from accounts.views import TestEmailView
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from blog.views import PostViewSet, CategoryViewSet, TagViewSet, CommentViewSet
from blog import views_frontend
from accounts.views import RegisterView, LoginView, LogoutView, UserDetailView, PasswordResetRequestView,PasswordResetValidateView,PasswordResetConfirmView
from blog.views_frontend import  reset_password_view,forgot_password_view
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='api-register'),
    path('api/auth/login/', LoginView.as_view(), name='api-login'),
    path('api/auth/logout/', LogoutView.as_view(), name='api-logout'),
    path('api/auth/user/', UserDetailView.as_view(), name='api-user-detail'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='api-password-reset'),
    # Password Reset URLs
    path('api/auth/password-reset/request/', 
         PasswordResetRequestView.as_view(), 
         name='password-reset-request'),
    
    path('api/auth/password-reset/validate/<uidb64>/<token>/', 
         PasswordResetValidateView.as_view(), 
         name='password-reset-validate'),
    
    path('api/auth/password-reset/confirm/<uidb64>/<token>/', 
         PasswordResetConfirmView.as_view(), 
         name='password-reset-confirm'),
    
    # Frontend URLs
    path('forgot-password/', 
         views_frontend.forgot_password_view, 
         name='forgot-password'),
    
    path('reset-password/<uidb64>/<token>/', 
         views_frontend.reset_password_view, 
         name='reset-password'),
    # Frontend Routes
    path('', views_frontend.index, name='index'),
    path('post/<slug:slug>/', views_frontend.post_detail, name='post-detail'),
    path('category/<slug:slug>/', views_frontend.category_posts, name='category-posts'),
    path('tag/<slug:slug>/', views_frontend.tag_posts, name='tag-posts'),
    path('login/', views_frontend.login_view, name='login'),
    path('register/', views_frontend.register_view, name='register'),
     path('password-reset/', views_frontend.password_reset_view, name='password-reset'),
    path('create-post/', views_frontend.create_post_view, name='create-post'),
    path('edit-post/<slug:slug>/', views_frontend.edit_post_view, name='edit-post'),
    path('profile/', views_frontend.profile_view, name='profile'),
    path('about/', views_frontend.about_view, name='about'),
    



    # روابطك القديمة
    path('test-email/', TestEmailView.as_view(), name='test-email'),


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)