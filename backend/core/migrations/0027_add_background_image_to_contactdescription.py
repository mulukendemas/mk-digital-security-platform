from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0026_abouthero_background_image_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='contactdescription',
            name='background_image',
            field=models.ImageField(blank=True, null=True, upload_to='contact/hero/'),
        ),
    ]
