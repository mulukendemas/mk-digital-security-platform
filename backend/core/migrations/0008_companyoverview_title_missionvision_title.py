# Generated by Django 5.1.7 on 2025-03-28 07:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_teamdescription'),
    ]

    operations = [
        migrations.AddField(
            model_name='companyoverview',
            name='title',
            field=models.CharField(default='hello', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='missionvision',
            name='title',
            field=models.CharField(default='test', max_length=255),
            preserve_default=False,
        ),
    ]
