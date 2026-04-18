import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('habits', '0002_dailytask'),
    ]

    operations = [
        migrations.AddField(
            model_name='habit',
            name='category',
            field=models.CharField(
                choices=[
                    ('health', 'Health'),
                    ('productivity', 'Productivity'),
                    ('study', 'Study'),
                    ('mindfulness', 'Mindfulness'),
                    ('fitness', 'Fitness'),
                    ('custom', 'Custom'),
                ],
                default='custom',
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name='habit',
            name='color',
            field=models.CharField(default='#2563eb', max_length=16),
        ),
        migrations.AddField(
            model_name='habit',
            name='custom_days',
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name='habit',
            name='difficulty',
            field=models.CharField(
                choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
                default='medium',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='habit',
            name='frequency',
            field=models.CharField(
                choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('custom', 'Custom Days')],
                default='daily',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='habit',
            name='goal',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='habit',
            name='icon',
            field=models.CharField(default='✅', max_length=8),
        ),
        migrations.AddField(
            model_name='habitlog',
            name='result',
            field=models.CharField(
                choices=[('completed', 'Completed'), ('skipped', 'Skipped'), ('failed', 'Failed')],
                default='completed',
                max_length=16,
            ),
        ),
        migrations.CreateModel(
            name='HabitReminder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(blank=True, max_length=100)),
                ('remind_at', models.TimeField()),
                ('is_active', models.BooleanField(default=True)),
                ('habit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reminders', to='habits.habit')),
            ],
            options={
                'ordering': ['remind_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='habitlog',
            constraint=models.UniqueConstraint(fields=('habit', 'date'), name='unique_habit_log_per_day'),
        ),
    ]
