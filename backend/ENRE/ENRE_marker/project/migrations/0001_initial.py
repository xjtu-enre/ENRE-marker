# Generated by Django 3.2.8 on 2021-10-31 08:03

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
                ('loc_start_line', models.IntegerField()),
                ('loc_start_column', models.IntegerField()),
                ('loc_end_line', models.IntegerField()),
                ('loc_end_column', models.IntegerField()),
                ('entity_type', models.SmallIntegerField(choices=[(0, 'Unknown'), (1, 'Variable'), (2, 'Method'), (3, 'Interface'), (4, 'Annotation'), (5, 'Enum'), (6, 'Class'), (7, 'File'), (8, 'Package'), (9, 'Module')])),
                ('source', models.SmallIntegerField(choices=[(0, 'User'), (1, 'Understand')], default=1)),
                ('reviewed', models.BooleanField(default=False)),
                ('disabled', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('pid', models.AutoField(max_length=3, primary_key=True, serialize=False)),
                ('github_url', models.URLField(max_length=256)),
                ('git_branch', models.CharField(default='main', max_length=16)),
                ('git_commit_hash', models.CharField(max_length=7)),
                ('lang', models.CharField(max_length=16)),
                ('meta_hash', models.CharField(max_length=256)),
            ],
        ),
        migrations.CreateModel(
            name='Relation',
            fields=[
                ('rid', models.AutoField(primary_key=True, serialize=False)),
                ('to_entity', models.IntegerField()),
                ('relation_type', models.SmallIntegerField(choices=[(0, 'Unknown'), (1, 'Import'), (2, 'Inherit'), (3, 'Implement'), (4, 'Call'), (5, 'Set'), (6, 'Use'), (7, 'Modify'), (8, 'Cast')])),
                ('source', models.SmallIntegerField(choices=[(0, 'User'), (1, 'Understand')])),
                ('reviewed', models.BooleanField(default=False)),
                ('disabled', models.BooleanField(default=False)),
                ('from_entity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.entity')),
            ],
        ),
        migrations.CreateModel(
            name='File',
            fields=[
                ('fid', models.AutoField(primary_key=True, serialize=False)),
                ('file_path', models.FilePathField(max_length=256)),
                ('meta_hash', models.CharField(max_length=256)),
                ('pid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.project')),
            ],
        ),
        migrations.AddField(
            model_name='entity',
            name='fid',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.file'),
        ),
    ]
