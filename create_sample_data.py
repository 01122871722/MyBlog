# fix_issues.py
# ملف شامل لإصلاح المشاكل الشائعة وتحسين الأداء

import os
import sys
import django
from pathlib import Path
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog_backend.settings')
django.setup()

from django.contrib.auth.models import User
from blog.models import Post, Category, Tag, Comment
from django.conf import settings
from django.utils.text import slugify
from django.core.management import call_command

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_step(msg):
    print(f"\n{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}  {msg}{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*70}{Colors.RESET}\n")

def print_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.RESET}")

def print_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.RESET}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.RESET}")

def fix_slugs():
    """إصلاح جميع slugs المفقودة"""
    print_step("🔧 إصلاح Slugs")
    
    fixed_count = 0
    
    # Fix Post slugs
    posts_no_slug = Post.objects.filter(slug='')
    if posts_no_slug.exists():
        print_info(f"إصلاح {posts_no_slug.count()} مقالات...")
        for post in posts_no_slug:
            post.save()
            fixed_count += 1
        print_success(f"تم إصلاح slugs لـ {posts_no_slug.count()} مقالات")
    
    # Fix Category slugs
    cats_no_slug = Category.objects.filter(slug='')
    if cats_no_slug.exists():
        print_info(f"إصلاح {cats_no_slug.count()} فئات...")
        for cat in cats_no_slug:
            cat.save()
            fixed_count += 1
        print_success(f"تم إصلاح slugs لـ {cats_no_slug.count()} فئات")
    
    # Fix Tag slugs
    tags_no_slug = Tag.objects.filter(slug='')
    if tags_no_slug.exists():
        print_info(f"إصلاح {tags_no_slug.count()} وسوم...")
        for tag in tags_no_slug:
            tag.save()
            fixed_count += 1
        print_success(f"تم إصلاح slugs لـ {tags_no_slug.count()} وسوم")
    
    # Check for duplicate slugs
    print_info("فحص Slugs المكررة...")
    
    # Check posts
    from django.db.models import Count
    duplicate_post_slugs = Post.objects.values('slug').annotate(count=Count('id')).filter(count__gt=1)
    if duplicate_post_slugs.exists():
        print_error(f"وجد {duplicate_post_slugs.count()} slugs مكررة في المقالات!")
        for dup in duplicate_post_slugs:
            posts = Post.objects.filter(slug=dup['slug'])
            print_info(f"  Slug مكرر: {dup['slug']} ({posts.count()} مقالات)")
            # Fix duplicates
            for i, post in enumerate(posts[1:], 1):
                post.slug = f"{dup['slug']}-{i}"
                post.save()
                print_success(f"    تم تغيير إلى: {post.slug}")
                fixed_count += 1
    
    if fixed_count == 0:
        print_success("جميع Slugs صحيحة ✓")
    else:
        print_success(f"تم إصلاح {fixed_count} slug")
    
    return fixed_count

def fix_posts_data():
    """إصلاح بيانات المقالات"""
    print_step("📝 إصلاح بيانات المقالات")
    
    fixed_count = 0
    
    # Fix posts without excerpts
    posts_no_excerpt = Post.objects.filter(excerpt='')
    if posts_no_excerpt.exists():
        print_info(f"إضافة ملخصات لـ {posts_no_excerpt.count()} مقالات...")
        for post in posts_no_excerpt:
            if post.content:
                post.excerpt = post.content[:300]
                post.save(update_fields=['excerpt'])
                fixed_count += 1
        print_success(f"تم إضافة ملخصات لـ {posts_no_excerpt.count()} مقالات")
    
    # Fix published posts without published_at
    from django.utils import timezone
    posts_no_pub_date = Post.objects.filter(status='published', published_at__isnull=True)
    if posts_no_pub_date.exists():
        print_info(f"إضافة تاريخ نشر لـ {posts_no_pub_date.count()} مقالات...")
        for post in posts_no_pub_date:
            post.published_at = post.created_at
            post.save(update_fields=['published_at'])
            fixed_count += 1
        print_success(f"تم إضافة تاريخ نشر لـ {posts_no_pub_date.count()} مقالات")
    
    if fixed_count == 0:
        print_success("جميع بيانات المقالات صحيحة ✓")
    else:
        print_success(f"تم إصلاح {fixed_count} حقل في المقالات")
    
    return fixed_count

def optimize_database():
    """تحسين قاعدة البيانات"""
    print_step("⚡ تحسين قاعدة البيانات")
    
    # Update posts_count for categories
    print_info("تحديث عدد المقالات للفئات...")
    for category in Category.objects.all():
        count = category.posts.filter(status='published').count()
        print_info(f"  {category.name}: {count} مقالات")
    print_success("تم تحديث عدد المقالات للفئات")
    
    # Update posts_count for tags
    print_info("تحديث عدد المقالات للوسوم...")
    for tag in Tag.objects.all():
        count = tag.posts.filter(status='published').count()
        if count > 0:
            print_info(f"  {tag.name}: {count} مقالات")
    print_success("تم تحديث عدد المقالات للوسوم")
    
    return True

def check_and_create_directories():
    """التحقق من وإنشاء المجلدات المطلوبة"""
    print_step("📁 التحقق من المجلدات")
    
    base_dir = Path(settings.BASE_DIR)
    
    required_dirs = [
        'media',
        'media/posts',
        'staticfiles',
    ]
    
    created = []
    for dir_path in required_dirs:
        full_path = base_dir / dir_path
        if not full_path.exists():
            full_path.mkdir(parents=True, exist_ok=True)
            created.append(dir_path)
            print_success(f"تم إنشاء: {dir_path}")
        else:
            print_info(f"موجود: {dir_path}")
    
    if created:
        print_success(f"تم إنشاء {len(created)} مجلد")
    else:
        print_success("جميع المجلدات موجودة ✓")
    
    return len(created)

def validate_relationships():
    """التحقق من صحة العلاقات بين الجداول"""
    print_step("🔗 التحقق من العلاقات")
    
    issues = []
    
    # Check posts without authors
    posts_no_author = Post.objects.filter(author__isnull=True)
    if posts_no_author.exists():
        print_error(f"{posts_no_author.count()} مقالات بدون كاتب!")
        issues.append("posts_no_author")
    else:
        print_success("جميع المقالات لها كُتاب ✓")
    
    # Check comments without posts
    comments_no_post = Comment.objects.filter(post__isnull=True)
    if comments_no_post.exists():
        print_error(f"{comments_no_post.count()} تعليقات بدون مقالات!")
        issues.append("comments_no_post")
    else:
        print_success("جميع التعليقات مرتبطة بمقالات ✓")
    
    # Check comments without authors
    comments_no_author = Comment.objects.filter(author__isnull=True)
    if comments_no_author.exists():
        print_error(f"{comments_no_author.count()} تعليقات بدون كاتب!")
        issues.append("comments_no_author")
    else:
        print_success("جميع التعليقات لها كُتاب ✓")
    
    if issues:
        print_error(f"وجد {len(issues)} مشكلة في العلاقات")
        print_info("ملاحظة: بعض المشاكل قد تحتاج إصلاح يدوي")
    else:
        print_success("جميع العلاقات صحيحة ✓")
    
    return len(issues)

def create_sample_superuser():
    """إنشاء مستخدم مدير تجريبي إذا لم يوجد"""
    print_step("👤 فحص المستخدم المدير")
    
    if User.objects.filter(is_superuser=True).exists():
        print_success("يوجد مستخدم مدير بالفعل ✓")
        return False
    
    print_info("لا يوجد مستخدم مدير، جاري الإنشاء...")
    
    try:
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@blog.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print_success("تم إنشاء مستخدم مدير تجريبي:")
        print_info(f"  Username: admin")
        print_info(f"  Password: admin123")
        print_info(f"  Email: admin@blog.com")
        return True
    except Exception as e:
        print_error(f"فشل إنشاء المستخدم: {str(e)}")
        return False

def run_migrations():
    """تشغيل migrations"""
    print_step("🔄 فحص Migrations")
    
    try:
        print_info("فحص migrations المعلقة...")
        call_command('migrate', '--check', verbosity=0)
        print_success("جميع migrations محدثة ✓")
        return True
    except:
        print_info("يوجد migrations معلقة، جاري التطبيق...")
        try:
            call_command('migrate', verbosity=1)
            print_success("تم تطبيق جميع migrations")
            return True
        except Exception as e:
            print_error(f"فشل تطبيق migrations: {str(e)}")
            return False

def collect_static():
    """جمع ملفات static"""
    print_step("📦 جمع ملفات Static")
    
    if not settings.DEBUG:
        print_info("جاري جمع ملفات static...")
        try:
            call_command('collectstatic', '--noinput', verbosity=1)
            print_success("تم جمع ملفات static")
            return True
        except Exception as e:
            print_error(f"فشل جمع ملفات static: {str(e)}")
            return False
    else:
        print_info("وضع DEBUG مفعل - تخطي collectstatic")
        return True

def generate_statistics():
    """إنشاء إحصائيات عن المشروع"""
    print_step("📊 إحصائيات المشروع")
    
    users_count = User.objects.count()
    superusers_count = User.objects.filter(is_superuser=True).count()
    categories_count = Category.objects.count()
    tags_count = Tag.objects.count()
    posts_count = Post.objects.count()
    published_posts = Post.objects.filter(status='published').count()
    draft_posts = Post.objects.filter(status='draft').count()
    comments_count = Comment.objects.count()
    approved_comments = Comment.objects.filter(is_approved=True).count()
    
    print(f"""
{Colors.BOLD}المستخدمون:{Colors.RESET}
  • إجمالي: {users_count}
  • مدراء: {superusers_count}

{Colors.BOLD}المحتوى:{Colors.RESET}
  • الفئات: {categories_count}
  • الوسوم: {tags_count}
  • المقالات: {posts_count}
    - منشورة: {published_posts}
    - مسودات: {draft_posts}
  • التعليقات: {comments_count}
    - موافق عليها: {approved_comments}
    """)
    
    # Most viewed posts
    if posts_count > 0:
        print(f"{Colors.BOLD}أكثر المقالات مشاهدة:{Colors.RESET}")
        top_posts = Post.objects.filter(status='published').order_by('-views')[:5]
        for i, post in enumerate(top_posts, 1):
            print(f"  {i}. {post.title[:50]}... ({post.views} مشاهدة)")
    
    # Most active authors
    if users_count > 0:
        print(f"\n{Colors.BOLD}الكُتاب الأكثر نشاطاً:{Colors.RESET}")
        from django.db.models import Count
        active_authors = User.objects.annotate(
            posts_count=Count('posts')
        ).filter(posts_count__gt=0).order_by('-posts_count')[:5]
        
        for i, author in enumerate(active_authors, 1):
            print(f"  {i}. {author.username}: {author.posts_count} مقالات")

def main():
    """الدالة الرئيسية"""
    print(f"""
{Colors.BLUE}{Colors.BOLD}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║         🔧 Blog System - إصلاح وتحسين شامل 🔧            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
{Colors.RESET}
    """)
    
    fixes_applied = 0
    
    try:
        # Run migrations first
        if run_migrations():
            fixes_applied += 1
        
        # Create directories
        fixes_applied += check_and_create_directories()
        
        # Create superuser if needed
        if create_sample_superuser():
            fixes_applied += 1
        
        # Fix slugs
        fixes_applied += fix_slugs()
        
        # Fix posts data
        fixes_applied += fix_posts_data()
        
        # Validate relationships
        issues = validate_relationships()
        
        # Optimize database
        if optimize_database():
            fixes_applied += 1
        
        # Collect static (if not DEBUG)
        if collect_static():
            fixes_applied += 1
        
        # Generate statistics
        generate_statistics()
        
        # Final summary
        print_step("✨ ملخص العمليات")
        
        if fixes_applied > 0:
            print_success(f"تم تطبيق {fixes_applied} إصلاح/تحسين")
        
        if issues > 0:
            print(f"\n{Colors.YELLOW}⚠️  تنبيه: وجد {issues} مشكلة قد تحتاج إصلاح يدوي{Colors.RESET}")
        else:
            print(f"\n{Colors.GREEN}✅ جميع الفحوصات نجحت!{Colors.RESET}")
        
        print(f"""
{Colors.BOLD}الخطوات التالية:{Colors.RESET}

1. شغل الاختبار الشامل:
   {Colors.BLUE}python comprehensive_test.py{Colors.RESET}

2. شغل السيرفر:
   {Colors.BLUE}python manage.py runserver{Colors.RESET}

3. افتح المتصفح على:
   {Colors.BLUE}http://127.0.0.1:8000/{Colors.RESET}

4. لوحة الإدارة:
   {Colors.BLUE}http://127.0.0.1:8000/admin/{Colors.RESET}
        """)
        
        return 0
        
    except Exception as e:
        print_error(f"خطأ غير متوقع: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)