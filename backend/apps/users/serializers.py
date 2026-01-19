from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    dealer_name = serializers.CharField(source='dealer.dealer_name', read_only=True)
    dealer_phone = serializers.CharField(source='dealer.phone', read_only=True)
    dealer_contact_first_name = serializers.CharField(source='dealer.contact_first_name', read_only=True)
    dealer_contact_last_name = serializers.CharField(source='dealer.contact_last_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'dealer', 'dealer_name', 'dealer_phone',
            'dealer_contact_first_name', 'dealer_contact_last_name',
            'is_active', 'is_deleted', 'deleted_at', 'deleted_reason',
            'date_joined', 'password'
        ]
        read_only_fields = ['id', 'date_joined']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Şifreler eşleşmiyor."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user info"""
    
    # Override default error messages
    default_error_messages = {
        'no_active_account': 'Kullanıcı adı ya da şifre hatalı.'
    }
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email
        
        if user.dealer:
            token['dealer_id'] = user.dealer.dealer_code
            token['dealer_name'] = user.dealer.dealer_name
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = UserSerializer(self.user).data
        
        return data


class AdminTokenObtainPairSerializer(CustomTokenObtainPairSerializer):
    """Backoffice JWT token serializer (admin, moderator, creative_agency) - supports email or username login"""
    
    def validate(self, attrs):
        # Email ile giriş desteği - username alanında email geldiyse username'e çevir
        username_field = attrs.get('username', '')
        if '@' in username_field:
            try:
                user = User.objects.get(email=username_field)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass
        
        data = super().validate(attrs)
        
        # Bayi hariç tüm roller backoffice'e girebilir
        if self.user.role == 'bayi':
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("Kullanıcı adı ya da şifre hatalı.")
        
        return data


class DealerTokenObtainPairSerializer(CustomTokenObtainPairSerializer):
    """Dealer only JWT token serializer - supports email or username login"""
    
    def validate(self, attrs):
        # Email ile giriş desteği - username alanında email geldiyse username'e çevir
        username_field = attrs.get('username', '')
        if '@' in username_field:
            try:
                user = User.objects.get(email=username_field)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass
        
        data = super().validate(attrs)
        
        if self.user.role != 'bayi':
            from rest_framework.exceptions import AuthenticationFailed
            raise AuthenticationFailed("Kullanıcı adı ya da şifre hatalı.")
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Yeni şifreler eşleşmiyor."})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Check if user with this email exists"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Şifreler eşleşmiyor."})
        return attrs

