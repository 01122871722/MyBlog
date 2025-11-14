# blog/views_frontend.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Post, Category, Tag

def index(request):
    """الصفحة الرئيسية"""
    return render(request, 'index.html')

def post_detail(request, slug):
    """صفحة تفاصيل المقال"""
    return render(request, 'post_detail.html', {'slug': slug})

def category_posts(request, slug):
    """صفحة مقالات الفئة"""
    return render(request, 'category_posts.html', {'slug': slug})

def tag_posts(request, slug):
    """صفحة مقالات الوسم"""
    return render(request, 'tag_posts.html', {'slug': slug})

def login_view(request):
    """صفحة تسجيل الدخول"""
    return render(request, 'login.html')

def register_view(request):
    """صفحة التسجيل"""
    return render(request, 'register.html')

@login_required
def create_post_view(request):
    """صفحة إنشاء مقال جديد"""
    return render(request, 'create_post.html')

@login_required
def my_posts_view(request):
    """صفحة مقالاتي"""
    return render(request, 'my_posts.html')
def password_reset_view(request):
    """صفحة نسيت كلمة المرور"""
    return render(request, 'password_reset.html')
def forgot_password_view(request):
    return render(request, 'forgot-password.html')

def reset_password_view(request, uidb64, token):
    return render(request, 'password_reset.html', {
        'uidb64': uidb64,
        'token': token
    })

@login_required
def edit_post_view(request, slug):
    """صفحة تعديل المقال"""
    return render(request, 'edit_post.html', {'slug': slug})

def about_view(request):
    """صفحة عن المدونة"""
    return render(request, 'about.html')
def profile_view(request):
    """صفحة الملف الشخصي"""
    return render(request, 'profile.html')