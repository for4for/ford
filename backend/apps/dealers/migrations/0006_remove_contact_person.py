# Generated manually - remove deprecated contact_person field

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dealers', '0005_add_contact_first_last_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dealer',
            name='contact_person',
        ),
    ]

