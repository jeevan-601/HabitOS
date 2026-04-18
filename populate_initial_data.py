"""
Script to populate initial achievements and habit templates.
Run with: python manage.py shell < populate_initial_data.py
"""
from habits.models import Achievement, HabitTemplate, Habit

# Create default achievements
achievements_data = [
    {
        'key': Achievement.BADGE_7_STREAK,
        'name': '7-Day Streak',
        'description': 'Complete all habits for 7 consecutive days',
        'icon': '🔥',
    },
    {
        'key': Achievement.BADGE_30_STREAK,
        'name': '30-Day Streak',
        'description': 'Complete all habits for 30 consecutive days',
        'icon': '⭐',
    },
    {
        'key': Achievement.BADGE_50_LOGS,
        'name': '50 Completions',
        'description': 'Complete 50 habit logs',
        'icon': '📊',
    },
    {
        'key': Achievement.BADGE_100_LOGS,
        'name': '100 Completions',
        'description': 'Complete 100 habit logs',
        'icon': '💯',
    },
    {
        'key': Achievement.BADGE_KUDOS_10,
        'name': 'Kudos Champion',
        'description': 'Receive 10 kudos from other users',
        'icon': '👏',
    },
    {
        'key': Achievement.BADGE_KUDOS_25,
        'name': 'Kudos Superstar',
        'description': 'Receive 25 kudos from other users',
        'icon': '🌟',
    },
    {
        'key': Achievement.BADGE_HABITS_5,
        'name': 'Habit Builder',
        'description': 'Create 5 different habits',
        'icon': '🛠️',
    },
    {
        'key': Achievement.BADGE_HABITS_10,
        'name': 'Habit Master',
        'description': 'Create 10 different habits',
        'icon': '👑',
    },
    {
        'key': Achievement.BADGE_CONSISTENT,
        'name': '90% Consistency',
        'description': 'Achieve 90% completion rate',
        'icon': '📈',
    },
    {
        'key': Achievement.BADGE_EARLY_BIRD,
        'name': 'Early Bird',
        'description': 'Complete 5 habits before 9 AM',
        'icon': '🌅',
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

print(f"✅ Created {len(achievements_data)} achievements")

# Create popular habit templates
templates_data = [
    {
        'name': 'Morning Walk',
        'description': 'Take a 30-minute walk to boost energy and health',
        'icon': '🚶',
        'category': Habit.CATEGORY_FITNESS,
        'difficulty': Habit.DIFFICULTY_EASY,
        'is_featured': True,
    },
    {
        'name': 'Read 20 Minutes',
        'description': 'Read for personal development and learning',
        'icon': '📚',
        'category': Habit.CATEGORY_STUDY,
        'difficulty': Habit.DIFFICULTY_MEDIUM,
        'is_featured': True,
    },
    {
        'name': 'Meditation',
        'description': '10 minutes of meditation for mindfulness',
        'icon': '🧘',
        'category': Habit.CATEGORY_MINDFULNESS,
        'difficulty': Habit.DIFFICULTY_EASY,
        'is_featured': True,
    },
    {
        'name': 'Workout',
        'description': '30-minute fitness workout',
        'icon': '💪',
        'category': Habit.CATEGORY_FITNESS,
        'difficulty': Habit.DIFFICULTY_HARD,
        'is_featured': True,
    },
    {
        'name': 'Deep Work',
        'description': 'Focused work session without distractions',
        'icon': '🧠',
        'category': Habit.CATEGORY_PRODUCTIVITY,
        'difficulty': Habit.DIFFICULTY_HARD,
        'is_featured': True,
    },
    {
        'name': 'Journaling',
        'description': 'Reflect and write about your day',
        'icon': '📝',
        'category': Habit.CATEGORY_MINDFULNESS,
        'difficulty': Habit.DIFFICULTY_EASY,
        'is_featured': True,
    },
    {
        'name': 'Drink Water',
        'description': 'Drink 8 glasses of water throughout the day',
        'icon': '💧',
        'category': Habit.CATEGORY_HEALTH,
        'difficulty': Habit.DIFFICULTY_EASY,
        'is_featured': True,
    },
    {
        'name': 'Learn New Skill',
        'description': 'Dedicate 30 minutes to learning something new',
        'icon': '🎓',
        'category': Habit.CATEGORY_STUDY,
        'difficulty': Habit.DIFFICULTY_MEDIUM,
        'is_featured': True,
    },
    {
        'name': 'Evening Stretch',
        'description': 'Stretch for 10 minutes before bed',
        'icon': '🤸',
        'category': Habit.CATEGORY_FITNESS,
        'difficulty': Habit.DIFFICULTY_EASY,
        'is_featured': False,
    },
    {
        'name': 'Healthy Meal',
        'description': 'Prepare a nutritious meal',
        'icon': '🥗',
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

print(f"✅ Created {len(templates_data)} habit templates")
print("✅ Initial data populated successfully!")
