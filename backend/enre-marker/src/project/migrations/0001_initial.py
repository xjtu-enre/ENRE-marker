# Generated by Django 3.2.5 on 2021-12-04 10:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Entity',
            fields=[
                ('eid', models.AutoField(primary_key=True, serialize=False)),
                ('code_name', models.CharField(max_length=256)),
                ('loc_start_line', models.IntegerField(default=-1)),
                ('loc_start_column', models.IntegerField(default=-1)),
                ('loc_end_line', models.IntegerField(default=-1)),
                ('loc_end_column', models.IntegerField(default=-1)),
                ('entity_type', models.SmallIntegerField(choices=[(0, 'unknown'), (1, 'variable'), (2, 'method'), (3, 'interface'), (4, 'annotation'), (5, 'enum'), (6, 'class'), (7, 'file'), (8, 'package'), (9, 'module')])),
                ('reviewed', models.SmallIntegerField(choices=[(-2, 'inapplicable'), (-1, 'notYet'), (0, 'reviewPassed'), (1, 'remove'), (2, 'modify')], default=-1)),
                ('shallow', models.BooleanField(default=False)),
                ('inserted', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('pid', models.AutoField(primary_key=True, serialize=False)),
                ('p_name', models.CharField(max_length=64)),
                ('github_url', models.URLField(max_length=128)),
                ('git_branch', models.CharField(default='main', max_length=16)),
                ('git_commit_hash', models.CharField(max_length=7)),
                ('lang', models.CharField(max_length=8)),
                ('state', models.SmallIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Relation',
            fields=[
                ('rid', models.AutoField(primary_key=True, serialize=False)),
                ('relation_type', models.SmallIntegerField(choices=[(0, 'unknown'), (1, 'import'), (2, 'inherit'), (3, 'implement'), (4, 'call'), (5, 'set'), (6, 'use'), (7, 'modify'), (8, 'cast'), (9, 'create'), (10, 'typed')])),
                ('reviewed', models.SmallIntegerField(choices=[(-2, 'inapplicable'), (-1, 'notYet'), (0, 'reviewPassed'), (1, 'remove'), (2, 'modify')], default=-1)),
                ('shallow', models.BooleanField(default=False)),
                ('inserted', models.BooleanField(default=False)),
                ('from_entity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='from_entity', to='project.entity')),
                ('to_entity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='to_entity', to='project.entity')),
            ],
        ),
        migrations.CreateModel(
            name='File',
            fields=[
                ('fid', models.AutoField(primary_key=True, serialize=False)),
                ('file_path', models.FilePathField(max_length=256)),
                ('pid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.project')),
            ],
        ),
        migrations.AddField(
            model_name='entity',
            name='fid',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.file'),
        ),
    ]
