# accounts/models.py
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True, verbose_name='نبذة عني')
    profile_image = models.ImageField(upload_to='profiles/%Y/%m/', blank=True, null=True, verbose_name='الصورة الشخصية')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'ملف شخصي'
        verbose_name_plural = 'الملفات الشخصية'
    
    def __str__(self):
        return f'Profile of {self.user.username}'