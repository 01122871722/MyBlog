# blog/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

from django.utils.text import slugify
from django.utils import timezone

class Post(models.Model):
    STATUS_CHOICES = (
        ('draft', 'مسودة'),
        ('published', 'منشور'),
    )
    
    title = models.CharField(max_length=200, verbose_name='العنوان')
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name='الرابط')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts', verbose_name='الكاتب')
    content = models.TextField(verbose_name='المحتوى')
    excerpt = models.TextField(max_length=300, blank=True, verbose_name='الملخص')
    image = models.ImageField(upload_to='posts/%Y/%m/%d/', blank=True, null=True, verbose_name='الصورة')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts', verbose_name='الفئة')
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts', verbose_name='الوسوم')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', verbose_name='الحالة')
    views = models.PositiveIntegerField(default=0, verbose_name='المشاهدات')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التعديل')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ النشر')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['-views']),
        ]

    def save(self, *args, **kwargs):
        base_slug = slugify(self.title, allow_unicode=True)
        if not base_slug:
            base_slug = f'post-{timezone.now().timestamp()}'

        # ✅ تحديث slug إذا كان فاضي أو لو العنوان اتغير
        if not self.slug or Post.objects.filter(pk=self.pk).exists() and Post.objects.get(pk=self.pk).title != self.title:
            slug = base_slug
            counter = 1
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug

        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        if not self.excerpt and self.content:
            self.excerpt = self.content[:300]
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def increment_views(self):
        self.views += 1
        self.save(update_fields=['views'])

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_approved = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', '-created_at']),
        ]
    
    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'