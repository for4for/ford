"""
Email utility functions for sending templated emails
"""
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from datetime import datetime


def send_templated_email(
    subject,
    template_name,
    context,
    recipient_list,
    from_email=None,
    plain_text_message=None
):
    """
    Send an email using HTML template
    
    Args:
        subject (str): Email subject
        template_name (str): Template path (e.g., 'emails/password_reset_email.html')
        context (dict): Template context variables
        recipient_list (list): List of recipient email addresses
        from_email (str, optional): Sender email address
        plain_text_message (str, optional): Plain text fallback message
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Add default context variables
        default_context = {
            'logo_url': f"{settings.FRONTEND_URL}/assets/images/tofas-logo.png",
            'year': datetime.now().year,
        }
        # Merge with provided context
        full_context = {**default_context, **context}
        
        # Render HTML email
        html_content = render_to_string(template_name, full_context)
        
        # Use provided plain text or create a simple one
        if not plain_text_message:
            plain_text_message = f"{subject}\n\nLütfen bu e-postayı HTML destekli bir e-posta istemcisinde açın."
        
        # Set default from_email if not provided
        if not from_email:
            from_email = settings.DEFAULT_FROM_EMAIL
        
        # Create email with both HTML and plain text
        email_message = EmailMultiAlternatives(
            subject=subject,
            body=plain_text_message,
            from_email=from_email,
            to=recipient_list,
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send(fail_silently=False)
        
        return True
        
    except Exception as e:
        print(f"Email sending error: {e}")
        return False


def send_password_reset_email(user, reset_url):
    """
    Send password reset email to user
    
    Args:
        user: User object
        reset_url (str): Password reset URL
        
    Returns:
        bool: True if email was sent successfully
    """
    user_name = user.get_full_name() or user.username
    
    context = {
        'user_name': user_name,
        'reset_url': reset_url,
    }
    
    plain_text = f'''
Merhaba {user_name},

Tofaş Bayi Portalı hesabınız için şifre sıfırlama talebinde bulundunuz.

Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın:
{reset_url}

Not: Bu bağlantı 24 saat geçerlidir.

İyi günler dileriz,
Tofaş Bayi Portalı Ekibi
    '''
    
    return send_templated_email(
        subject='Şifre Sıfırlama - Tofaş Bayi Portalı',
        template_name='emails/password_reset_email.html',
        context=context,
        recipient_list=[user.email],
        plain_text_message=plain_text
    )


def send_welcome_email(user):
    """
    Send welcome email to new user
    
    Args:
        user: User object
        
    Returns:
        bool: True if email was sent successfully
    """
    user_name = user.get_full_name() or user.username
    
    context = {
        'user_name': user_name,
        'login_url': f"{settings.FRONTEND_URL}/dealer-login",
    }
    
    # You can create a welcome_email.html template later
    plain_text = f'''
Merhaba {user_name},

Tofaş Bayi Portalı'na hoş geldiniz!

Hesabınız başarıyla oluşturuldu. Giriş yapmak için:
{settings.FRONTEND_URL}/dealer-login

İyi günler dileriz,
Tofaş Bayi Portalı Ekibi
    '''
    
    # For now, use the base template with custom content
    return send_templated_email(
        subject='Hoş Geldiniz - Tofaş Bayi Portalı',
        template_name='emails/base_email.html',
        context={'content': plain_text.replace('\n', '<br>')},
        recipient_list=[user.email],
        plain_text_message=plain_text
    )
