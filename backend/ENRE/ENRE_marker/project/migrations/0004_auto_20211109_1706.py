# Generated by Django 3.2.8 on 2021-11-09 09:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0003_project_p_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entity',
            name='entity_type',
            field=models.SmallIntegerField(choices=[(0, 'unknown'), (1, 'variable'), (2, 'method'), (3, 'interface'), (4, 'annotation'), (5, 'enum'), (6, 'class'), (7, 'file'), (8, 'package'), (9, 'module')]),
        ),
        migrations.AlterField(
            model_name='relation',
            name='relation_type',
            field=models.SmallIntegerField(choices=[(0, 'unknown'), (1, 'import'), (2, 'inherit'), (3, 'implement'), (4, 'call'), (5, 'set'), (6, 'use'), (7, 'modify'), (8, 'cast'), (9, 'create'), (10, 'typed')]),
        ),
        migrations.AlterField(
            model_name='relation',
            name='source',
            field=models.SmallIntegerField(choices=[(0, 'user'), (1, 'understand')]),
        ),
    ]