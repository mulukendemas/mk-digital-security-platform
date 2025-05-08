from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_add_mission_vision_titles'),
    ]

    operations = [
        migrations.AlterField(
            model_name='partner',
            name='logo',
            field=models.ImageField(
                upload_to='partners/',
                null=True,
                blank=True,
                verbose_name='Partner Logo'
            ),
        ),
    ]
