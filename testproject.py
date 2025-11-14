# test_project.py
# اختبار شامل للمشروع - ضعه في المجلد الرئيسي وشغله بـ: python test_project.py

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog_backend.settings')
django.setup()

from django.contrib.auth.models import User
from blog.models import Post, Category, Tag, Comment
from django.conf import settings

def print_section(title):
    """طباعة عنوان مميز"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_models():
    """اختبار Models"""
    print_section("🧪 اختبار Models")
    
    tests = []
    
    # Test 1: User Model
    user_count = User.objects.count()
    tests.append(("Users", user_count > 0, f"✅ وجد {user_count} مستخدمين"))
    if user_count == 0:
        tests[-1] = ("Users", False, "❌ لا يوجد مستخدمين! قم بإنشاء superuser")
    
    # Test 2: Category Model
    cat_count = Category.objects.count()
    tests.append(("Categories", cat_count > 0, f"✅ وجد {cat_count} فئات"))
    if cat_count == 0:
        tests[-1] = ("Categories", False, "⚠️  لا توجد فئات! شغل create_sample_data.py")
    
    # Test 3: Tag Model
    tag_count = Tag.objects.count()
    tests.append(("Tags", tag_count > 0, f"✅ وجد {tag_count} وسوم"))
    if tag_count == 0:
        tests[-1] = ("Tags", False, "⚠️  لا توجد وسوم! شغل create_sample_data.py")
    
    # Test 4: Post Model
    post_count = Post.objects.count()
    tests.append(("Posts", post_count > 0, f"✅ وجد {post_count} مقالات"))
    if post_count == 0:
        tests[-1] = ("Posts", False, "⚠️  لا توجد مقالات! شغل create_sample_data.py")
    
    # Test 5: Published Posts
    published_count = Post.objects.filter(status='published').count()
    tests.append(("Published Posts", published_count > 0, f"✅ وجد {published_count} مقالات منشورة"))
    if published_count == 0:
        tests[-1] = ("Published Posts", False, "⚠️  لا توجد مقالات منشورة!")
    
    # Test 6: Posts with slugs
    posts_with_slugs = Post.objects.exclude(slug='').count()
    tests.append(("Posts with Slugs", posts_with_slugs == post_count, f"✅ جميع المقالات لها slugs"))
    if posts_with_slugs != post_count:
        tests[-1] = ("Posts with Slugs", False, f"❌ {post_count - posts_with_slugs} مقالات بدون slugs!")
    
    # Print results
    for name, passed, message in tests:
        print(f"   {message}")
    
    return all(t[1] for t in tests)

def test_settings():
    """اختبار Settings"""
    print_section("⚙️  اختبار Settings")
    
    tests = []
    
    # Test INSTALLED_APPS
    required_apps = ['rest_framework', 'corsheaders', 'blog', 'accounts']
    for app in required_apps:
        if app in settings.INSTALLED_APPS:
            tests.append((app, True, f"✅ {app} موجود"))
        else:
            tests.append((app, False, f"❌ {app} غير موجود في INSTALLED_APPS!"))
    
    # Test MEDIA settings
    media_ok = hasattr(settings, 'MEDIA_URL') and hasattr(settings, 'MEDIA_ROOT')
    tests.append(("MEDIA Settings", media_ok, "✅ إعدادات MEDIA صحيحة" if media_ok else "❌ MEDIA_URL أو MEDIA_ROOT غير موجود!"))
    
    # Test STATIC settings
    static_ok = hasattr(settings, 'STATIC_URL')
    tests.append(("STATIC Settings", static_ok, "✅ إعدادات STATIC صحيحة" if static_ok else "❌ STATIC_URL غير موجود!"))
    
    # Test TEMPLATES
    templates_ok = len(settings.TEMPLATES) > 0
    tests.append(("TEMPLATES", templates_ok, "✅ TEMPLATES محددة" if templates_ok else "❌ TEMPLATES غير محددة!"))
    
    # Print results
    for name, passed, message in tests:
        print(f"   {message}")
    
    return all(t[1] for t in tests)

def test_directories():
    """اختبار المجلدات"""
    print_section("📁 اختبار المجلدات")
    
    tests = []
    base_dir = settings.BASE_DIR
    
    required_dirs = [
        ('templates', 'مجلد Templates'),
        ('static', 'مجلد Static'),
        ('static/css', 'مجلد CSS'),
        ('static/js', 'مجلد JavaScript'),
        ('media', 'مجلد Media'),
    ]
    
    for dir_path, name in required_dirs:
        full_path = os.path.join(base_dir, dir_path)
        exists = os.path.exists(full_path)
        tests.append((name, exists, f"✅ {name} موجود" if exists else f"❌ {name} غير موجود في {dir_path}"))
    
    # Test template files
    template_files = [
        'base.html', 'index.html', 'post_detail.html', 
        'login.html', 'register.html', 'create_post.html'
    ]
    
    for template in template_files:
        path = os.path.join(base_dir, 'templates', template)
        exists = os.path.exists(path)
        tests.append((f"Template: {template}", exists, 
                     f"✅ {template}" if exists else f"❌ {template} غير موجود!"))
    
    # Test CSS files
    css_path = os.path.join(base_dir, 'static', 'css', 'style.css')
    exists = os.path.exists(css_path)
    tests.append(("style.css", exists, "✅ style.css موجود" if exists else "❌ style.css غير موجود!"))
    
    # Test JS files
    js_files = ['main.js', 'index.js', 'post-detail.js']
    for js_file in js_files:
        path = os.path.join(base_dir, 'static', 'js', js_file)
        exists = os.path.exists(path)
        tests.append((f"JS: {js_file}", exists, 
                     f"✅ {js_file}" if exists else f"❌ {js_file} غير موجود!"))
    
    # Print results
    for name, passed, message in tests:
        print(f"   {message}")
    
    return all(t[1] for t in tests)

def test_api_endpoints():
    """اختبار API Endpoints"""
    print_section("🌐 اختبار API Endpoints")
    
    from django.urls import reverse, resolve
    
    tests = []
    
    # Test important URLs
    important_urls = [
        ('/', 'index', 'الصفحة الرئيسية'),
        ('/admin/', 'admin:index', 'لوحة الإدارة'),
        ('/login/', 'login', 'صفحة تسجيل الدخول'),
        ('/register/', 'register', 'صفحة التسجيل'),
    ]
    
    for url, name, description in important_urls:
        try:
            if name.startswith('admin:'):
                resolved = resolve(url)
                tests.append((description, True, f"✅ {description} ({url})"))
            else:
                reversed_url = reverse(name)
                tests.append((description, True, f"✅ {description} ({url})"))
        except Exception as e:
            tests.append((description, False, f"❌ {description} - خطأ: {str(e)}"))
    
    # Print results
    for name, passed, message in tests:
        print(f"   {message}")
    
    return all(t[1] for t in tests)

def generate_report(all_passed):
    """إنشاء تقرير نهائي"""
    print_section("📊 التقرير النهائي")
    
    if all_passed:
        print("""
   ╔════════════════════════════════════════════════════════╗
   ║                                                        ║
   ║              ✅ المشروع جاهز للتشغيل! ✅               ║
   ║                                                        ║
   ╚════════════════════════════════════════════════════════╝
   
   🎉 كل الاختبارات نجحت!
   
   🚀 خطوات التشغيل:
   
   1. شغل السيرفر:
      python manage.py runserver
   
   2. افتح المتصفح على:
      http://127.0.0.1:8000/
   
   3. لوحة الإدارة:
      http://127.0.0.1:8000/admin/
   
   📝 نصيحة: إذا كانت قاعدة البيانات فارغة، شغل:
      python create_sample_data.py
        """)
    else:
        print("""
   ╔════════════════════════════════════════════════════════╗
   ║                                                        ║
   ║           ⚠️  يوجد مشاكل تحتاج إلى حل ⚠️             ║
   ║                                                        ║
   ╚════════════════════════════════════════════════════════╝
   
   ❌ بعض الاختبارات فشلت!
   
   🔧 راجع الرسائل أعلاه وقم بإصلاح المشاكل
   
   📖 للمساعدة، راجع:
      - README.md
      - TROUBLESHOOTING.md
   
   💡 نصائح سريعة:
   
   1. إذا لم توجد بيانات:
      python create_sample_data.py
   
   2. إذا كان هناك مشاكل في migrations:
      python manage.py makemigrations
      python manage.py migrate
   
   3. إذا كانت المجلدات غير موجودة:
      mkdir -p templates static/css static/js media
        """)

def main():
    """الدالة الرئيسية"""
    print("""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║         🎨 Blog System - اختبار شامل للمشروع 🎨          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    results = []
    
    # Run tests
    results.append(test_settings())
    results.append(test_directories())
    results.append(test_models())
    results.append(test_api_endpoints())
    
    # Generate report
    all_passed = all(results)
    generate_report(all_passed)
    
    # Return exit code
    sys.exit(0 if all_passed else 1)

if __name__ == '__main__':
    main()