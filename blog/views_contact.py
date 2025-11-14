# blog/views_contact.py
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

class ContactFormView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        name = request.data.get('name', '')
        email = request.data.get('email', '')
        message = request.data.get('message', '')
        
        if not all([name, email, message]):
            return Response(
                {'error': 'جميع الحقول مطلوبة'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # إرسال إيميل إلى Admin
            subject = f'رسالة جديدة من {name}'
            email_message = f'''
رسالة جديدة من نموذج التواصل:

الاسم: {name}
البريد الإلكتروني: {email}

الرسالة:
{message}

---
تم الإرسال تلقائياً من مدونتك.
            '''
            
            send_mail(
                subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.ADMIN_EMAIL],
                fail_silently=False,
            )
            
            # إرسال إيميل تأكيد للمرسل
            confirmation_subject = 'تم استلام رسالتك'
            confirmation_message = f'''
مرحباً {name},

شكراً لتواصلك معنا!

تم استلام رسالتك وسنرد عليك في أقرب وقت ممكن.

مع تحياتنا،
فريق المدونة
            '''
            
            send_mail(
                confirmation_subject,
                confirmation_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'تم إرسال رسالتك بنجاح! سنرد عليك قريباً.',
                'name': name,
                'email': email
            })
            
        except Exception as e:
            return Response(
                {'error': f'حدث خطأ في الإرسال: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )