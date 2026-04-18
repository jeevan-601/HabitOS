from django.core.management.base import BaseCommand
from habits.models import Achievement, HabitTemplate, Habit


class Command(BaseCommand):
    help = 'Populate initial achievements and habit templates'

    def handle(self, *args, **options):
        # Create default achievements
        achievements_data = [
            {
                'key': Achievement.BADGE_7_STREAK,
                'name': '7-Day Streak',
                'description': 'Complete all habits for 7 consecutive days',
                'icon': 'fire',
            },
            {
                'key': Achievement.BADGE_30_STREAK,
                'name': '30-Day Streak',
                'description': 'Complete all habits for 30 consecutive days',
                'icon': 'star',
            },
            {
                'key': Achievement.BADGE_50_LOGS,
                'name': '50 Completions',
                'description': 'Complete 50 habit logs',
                'icon': 'chart',
            },
            {
                'key': Achievement.BADGE_100_LOGS,
                'name': '100 Completions',
                'description': 'Complete 100 habit logs',
                'icon': '100',
            },
            {
                'key': Achievement.BADGE_KUDOS_10,
                'name': 'Kudos Champion',
                'description': 'Receive 10 kudos from other users',
                'icon': 'clap',
            },
            {
                'key': Achievement.BADGE_KUDOS_25,
                'name': 'Kudos Superstar',
                'description': 'Receive 25 kudos from other users',
                'icon': 'shine',
            },
            {
                'key': Achievement.BADGE_HABITS_5,
                'name': 'Habit Builder',
                'description': 'Create 5 different habits',
                'icon': 'tools',
            },
            {
                'key': Achievement.BADGE_HABITS_10,
                'name': 'Habit Master',
                'description': 'Create 10 different habits',
                'icon': 'crown',
            },
            {
                'key': Achievement.BADGE_CONSISTENT,
                'name': '90% Consistency',
                'description': 'Achieve 90% completion rate',
                'icon': 'trend',
            },
            {
                'key': Achievement.BADGE_EARLY_BIRD,
                'name': 'Early Bird',
                'description': 'Complete 5 habits before 9 AM',
                'icon': 'sunrise',
            },
        ]

        for data in achievements_data:
            Achievement.objects.get_or_create(
                key=data['key'],
                defaults={
                    'name': data['name'],
                    'description': data['description'],
                    'icon': data['icon'],
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Created {len(achievements_data)} achievements'))

        # Create popular habit templates
        templates_data = [
            {
                'name': 'Morning Walk',
                'description': 'Take a 30-minute walk to boost energy and health',
                'icon': 'walk',
                'category': Habit.CATEGORY_FITNESS,
                'difficulty': Habit.DIFFICULTY_EASY,
                'is_featured': True,
            },
            {
                'name': 'Read 20 Minutes',
                'description': 'Read for personal development and learning',
                'icon': 'book',
                'category': Habit.CATEGORY_STUDY,
                'difficulty': Habit.DIFFICULTY_MEDIUM,
                'is_featured': True,
            },
            {
                'name': 'Meditation',
                'description': '10 minutes of meditation for mindfulness',
                'icon': 'yoga',
                'category': Habit.CATEGORY_MINDFULNESS,
                'difficulty': Habit.DIFFICULTY_EASY,
                'is_featured': True,
            },
            {
                'name': 'Workout',
                'description': '30-minute fitness workout',
                'icon': 'muscle',
                'category': Habit.CATEGORY_FITNESS,
                'difficulty': Habit.DIFFICULTY_HARD,
                'is_featured': True,
            },
            {
                'name': 'Deep Work',
                'description': 'Focused work session without distractions',
                'icon': 'brain',
                'category': Habit.CATEGORY_PRODUCTIVITY,
                'difficulty': Habit.DIFFICULTY_HARD,
                'is_featured': True,
            },
            {
                'name': 'Journaling',
                'description': 'Reflect and write about your day',
                'icon': 'edit',
                'category': Habit.CATEGORY_MINDFULNESS,
                'difficulty': Habit.DIFFICULTY_EASY,
                'is_featured': True,
            },
            {
                'name': 'Drink Water',
                'description': 'Drink 8 glasses of water throughout the day',
                'icon': 'water',
                'category': Habit.CATEGORY_HEALTH,
                'difficulty': Habit.DIFFICULTY_EASY,
                'is_featured': True,
            },
            {
                'name': 'Learn New Skill',
                'description': 'Dedicate 30 minutes to learning something new',
                'icon': 'grad',
                'category': Habit.CATEGORY_STUDY,
                'difficulty': Habit.DIFFICULTY_MEDIUM,
                'is_featured': True,
            },
            {
                'name': 'Evening Stretch',
                'description': 'Stretch for 10 minutes before bed',
                'icon': 'flex',
                'category': Habit.CATEGORY_FITNESS,
                'difficulty': Habit.DIFFICULTY_EASY,
                'is_featured': False,
            },
            {
                'name': 'Healthy Meal',
                'description': 'Prepare a nutritious meal',
                'icon': 'salad',
                'category': Habit.CATEGORY_HEALTH,
                'difficulty': Habit.DIFFICULTY_MEDIUM,
                'is_featured': False,
            },
        ]

        for data in templates_data:
            HabitTemplate.objects.get_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'icon': data['icon'],
                    'category': data['category'],
                    'difficulty': data['difficulty'],
                    'is_featured': data['is_featured'],
                    'target_per_day': 1,
                    'frequency': Habit.FREQUENCY_DAILY,
                }
            )

        self.stdout.write(self.style.SUCCESS(f'Created {len(templates_data)} habit templates'))
        self.stdout.write(self.style.SUCCESS('Initial data populated successfully!'))
