from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_companyoverview_title_missionvision_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='missionvision',
            name='missionTitle',
            field=models.CharField(default='Our Mission', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='missionvision',
            name='visionTitle',
            field=models.CharField(default='Our Vision', max_length=255),
            preserve_default=False,
        ),
    ]