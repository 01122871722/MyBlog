# # accounts/serializers.py
# from rest_framework import serializers
# from django.contrib.auth.models import User
# from django.contrib.auth.password_validation import validate_password

# from rest_framework import serializers
# from django.contrib.auth.models import User

# # accounts/serializers.py
# from rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import UserProfile

# # accounts/serializers.py
# from rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import UserProfile

# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserProfile
#         fields = ['bio', 'profile_image']

# class UserSerializer(serializers.ModelSerializer):
#     profile = UserProfileSerializer(required=False)
    
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'first_name', 'last_name', 'email', 'profile']
    
#     def update(self, instance, validated_data):
#         profile_data = validated_data.pop('profile', {})
        
#         # تحديث الحقول الأساسية في User
#         instance.first_name = validated_data.get('first_name', instance.first_name)
#         instance.last_name = validated_data.get('last_name', instance.last_name)
#         instance.email = validated_data.get('email', instance.email)
#         instance.save()
        
#         # تحديث UserProfile
#         profile = getattr(instance, 'profile', None)
#         if profile:
#             profile.bio = profile_data.get('bio', profile.bio)
#             if 'profile_image' in profile_data:
#                 profile.profile_image = profile_data['profile_image']
#             profile.save()
        
#         return instance
# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
#     password2 = serializers.CharField(write_only=True, required=True)
    
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
#         extra_kwargs = {
#             'first_name': {'required': False},
#             'last_name': {'required': False},
#             'email': {'required': True}
#         }
    
#     def validate(self, attrs):
#         if attrs['password'] != attrs['password2']:
#             raise serializers.ValidationError({"password": "Password fields didn't match."})
        
#         if User.objects.filter(email=attrs['email']).exists():
#             raise serializers.ValidationError({"email": "Email already exists."})
        
#         return attrs
    
#     def create(self, validated_data):
#         validated_data.pop('password2')
#         user = User.objects.create_user(**validated_data)
#         return user

# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField(required=True)
#     password = serializers.CharField(required=True, write_only=True)
# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile
from django.core.exceptions import ValidationError

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'profile_image']

class UserSerializer(serializers.ModelSerializer):
    bio = serializers.CharField(source='profile.bio', required=False, allow_blank=True)
    profile_image = serializers.ImageField(source='profile.profile_image', required=False, allow_null=True)

    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'profile_image', 'posts_count', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined', 'posts_count']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()
    
    def update(self, instance, validated_data):
        # استخراج بيانات الـ profile
        profile_data = validated_data.pop('profile', {})
        
        # تحديث بيانات User الأساسية
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        # تحديث أو إنشاء الـ Profile
        profile, created = UserProfile.objects.get_or_create(user=instance)
        
        # تحديث Bio
        if 'bio' in profile_data:
            profile.bio = profile_data['bio']
        
        profile.save()
        
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "كلمات المرور غير متطابقة"})
        
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "البريد الإلكتروني مستخدم بالفعل"})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        # إنشاء Profile تلقائياً
        UserProfile.objects.create(user=user)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'كلمتا المرور غير متطابقتين'
            })
        
        # التحقق من قوة كلمة المرور
        try:
            validate_password(data['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({
                'new_password': list(e.messages)
            })
        
        return data
