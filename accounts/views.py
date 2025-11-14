# # accounts/views.py
# from rest_framework import status, generics
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from django.contrib.auth import authenticate, login, logout
# from django.contrib.auth.models import User
# from django.contrib.auth.tokens import default_token_generator
# from django.utils.http import urlsafe_base64_encode
# from django.utils.encoding import force_bytes
# from django.core.mail import send_mail
# from django.conf import settings
# from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
# from .models import UserProfile

# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     permission_classes = [AllowAny]
#     serializer_class = RegisterSerializer
    
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.save()
        
#         # Auto login after registration
#         login(request, user)
        
#         return Response({
#             'user': UserSerializer(user).data,
#             'message': 'User registered successfully'
#         }, status=status.HTTP_201_CREATED)

# class LoginView(APIView):
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         username = serializer.validated_data['username']
#         password = serializer.validated_data['password']
        
#         user = authenticate(request, username=username, password=password)
        
#         if user is not None:
#             login(request, user)
#             return Response({
#                 'user': UserSerializer(user).data,
#                 'message': 'Login successful'
#             })
#         else:
#             return Response({
#                 'error': 'Invalid credentials'
#             }, status=status.HTTP_401_UNAUTHORIZED)

# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         logout(request)
#         return Response({'message': 'Logout successful'})

# class UserDetailView(generics.RetrieveUpdateAPIView):
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self):
#         user = self.request.user
#         # التأكد من وجود profile
#         UserProfile.objects.get_or_create(user=user)
#         return user
    
#     def update(self, request, *args, **kwargs):
#         partial = kwargs.pop('partial', True)
#         instance = self.get_object()
        
#         print("=" * 50)
#         print("Received data:", request.data)
#         print("Files:", request.FILES)
#         print("=" * 50)
        
#         serializer = self.get_serializer(
#             instance, 
#             data=request.data, 
#             partial=partial
#         )
        
#         try:
#             serializer.is_valid(raise_exception=True)
#             self.perform_update(serializer)
            
#             # إعادة تحميل البيانات المحدثة
#             updated_user = self.get_object()
#             response_serializer = self.get_serializer(updated_user)
            
#             return Response(
#                 response_serializer.data,
#                 status=status.HTTP_200_OK
#             )
            
#         except serializers.ValidationError as e:
#             print(f"Validation error: {e.detail}")
#             return Response(
#                 {'detail': e.detail},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             print(f"Update error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response(
#                 {'detail': str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
# class PasswordResetRequestView(APIView):
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         email = request.data.get('email')
        
#         try:
#             user = User.objects.get(email=email)
#             token = default_token_generator.make_token(user)
#             uid = urlsafe_base64_encode(force_bytes(user.pk))
            
#             # In production, send email with reset link
#             # For now, just return success message
#             reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"
            
#             # Uncomment to send real emails
#             # send_mail(
#             #     'Password Reset Request',
#             #     f'Click the link to reset your password: {reset_link}',
#             #     settings.DEFAULT_FROM_EMAIL,
#             #     [email],
#             #     fail_silently=False,
#             # )
            
#             return Response({
#                 'message': 'Password reset email sent',
#                 'reset_link': reset_link  # Remove this in production
#             })
#         except User.DoesNotExist:
#             # Don't reveal if user exists or not
#             return Response({
#                 'message': 'If the email exists, a reset link has been sent'
#             })
# accounts/views.py
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Auto login after registration
        login(request, user)
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)  # Allow PATCH
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class PasswordResetRequestView(APIView):
    """
    خطوة 1: طلب إعادة تعيين كلمة المرور
    المستخدم يدخل الإيميل
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.filter(email=email).first()
            if user is None:
              return Response({
                    'message': 'إذا كان البريد موجوداً، ستتلقى رسالة إعادة التعيين'
               }, status=status.HTTP_200_OK)
            
            # إنشاء token فريد
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # إنشاء رابط إعادة التعيين
            # في الإنتاج، استخدم SITE_URL من settings
            site_url = request.build_absolute_uri('/')[:-1]  # http://127.0.0.1:8000
            reset_link = f"{site_url}/reset-password/{uid}/{token}/"
            
            # إرسال البريد
            try:
                send_mail(
                    subject='🔐 إعادة تعيين كلمة المرور',
                    message=f'''
مرحباً {user.username}،

تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.

لإعادة تعيين كلمة المرور، يرجى الضغط على الرابط التالي:
{reset_link}

⚠️ هذا الرابط صالح لمدة ساعة واحدة فقط.

إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.

مع تحياتنا،
فريق المدونة
                    ''',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                return Response({
                    'message': 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني',
                    'email': email
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': 'حدث خطأ في إرسال البريد. حاول مرة أخرى.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            # لأسباب أمنية، لا نكشف إذا كان البريد موجود أم لا
            return Response({
                'message': 'إذا كان البريد موجوداً، ستتلقى رسالة إعادة التعيين'
            }, status=status.HTTP_200_OK)


class PasswordResetValidateView(APIView):
    """
    خطوة 2: التحقق من صلاحية الرابط
    عند فتح الصفحة، نتحقق أن الرابط صالح
    """
    permission_classes = [AllowAny]
    
    def get(self, request, uidb64, token):
        try:
            # فك تشفير user id
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            # التحقق من صلاحية الـ token
            if default_token_generator.check_token(user, token):
                return Response({
                    'valid': True,
                    'message': 'الرابط صالح',
                    'username': user.username
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'الرابط غير صالح أو منتهي الصلاحية'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'valid': False,
                'error': 'رابط غير صحيح'
            }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    خطوة 3: تأكيد إعادة تعيين كلمة المرور
    المستخدم يدخل كلمة المرور الجديدة
    """
    permission_classes = [AllowAny]
    
    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # فك تشفير user id
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            # التحقق من صلاحية الـ token
            if not default_token_generator.check_token(user, token):
                return Response({
                    'error': 'الرابط غير صالح أو منتهي الصلاحية'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # تعيين كلمة المرور الجديدة
            new_password = serializer.validated_data['new_password']
            user.set_password(new_password)
            user.save()
            
            # إرسال بريد تأكيد
            try:
                send_mail(
                    subject='✅ تم تغيير كلمة المرور بنجاح',
                    message=f'''
مرحباً {user.username}،

تم تغيير كلمة المرور الخاصة بحسابك بنجاح.

إذا لم تقم بهذا التغيير، يرجى الاتصال بنا فوراً.

مع تحياتنا،
فريق المدونة
                    ''',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=True,  # لا نريد فشل العملية إذا فشل البريد
                )
            except:
                pass  # نتجاهل أخطاء البريد هنا
            
            return Response({
                'message': 'تم تغيير كلمة المرور بنجاح',
                'username': user.username
            }, status=status.HTTP_200_OK)
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'رابط غير صحيح'
            }, status=status.HTTP_400_BAD_REQUEST)
# accounts/views.py
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

class TestEmailView(APIView):
    def get(self, request):
        send_mail(
            subject='اختبار البريد',
            message='ده رسالة اختبار من Django',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=['raniaahmed200156@gmail.com'],  # نفس الإيميل بتاعك
            fail_silently=False,
        )
        return Response({'message': 'تم إرسال رسالة الاختبار (راجع البريد وSpam)'})

