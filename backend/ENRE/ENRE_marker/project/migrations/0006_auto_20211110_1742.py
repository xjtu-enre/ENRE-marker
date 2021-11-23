# Generated by Django 3.2.8 on 2021-11-10 09:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0005_auto_20211109_1712'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='entity',
            name='disabled',
        ),
        migrations.RemoveField(
            model_name='entity',
            name='source',
        ),
        migrations.RemoveField(
            model_name='file',
            name='meta_hash',
        ),
        migrations.RemoveField(
            model_name='project',
            name='meta_hash',
        ),
        migrations.RemoveField(
            model_name='relation',
            name='disabled',
        ),
        migrations.RemoveField(
            model_name='relation',
            name='source',
        ),
        migrations.AddField(
            model_name='entity',
            name='inserted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='entity',
            name='loc_end_column',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='entity',
            name='loc_end_line',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='entity',
            name='shallow',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='project',
            name='state',
            field=models.SmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='relation',
            name='inserted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='relation',
            name='shallow',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='entity',
            name='loc_start_column',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='entity',
            name='loc_start_line',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='entity',
            name='reviewed',
            field=models.SmallIntegerField(choices=[(-2, 'inapplicable'), (-1, 'notYet'), (0, 'reviewPassed'), (1, 'remove'), (2, 'modify')], default=-1),
        ),
        migrations.AlterField(
            model_name='relation',
            name='reviewed',
            field=models.SmallIntegerField(choices=[(-2, 'inapplicable'), (-1, 'notYet'), (0, 'reviewPassed'), (1, 'remove'), (2, 'modify')], default=-1),
        ),
    ]
