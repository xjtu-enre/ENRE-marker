# Generated by Django 3.2.8 on 2021-11-15 02:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_auto_20211110_1742'),
    ]

    operations = [
        migrations.AlterField(
            model_name='login',
            name='gen_time',
            field=models.DateTimeField(),
        ),
    ]
