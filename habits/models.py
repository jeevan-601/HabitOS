from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    status = models.CharField(max_length=160, blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} profile"

    @property
    def avatar_url(self):
        if self.avatar:
            return self.avatar.url
        return ''

    @property
    def status_text(self):
        return self.status.strip() or 'Ready to build streaks.'

class Kudos(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kudos_sent')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kudos_received')
    message = models.CharField(max_length=180, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} -> {self.recipient.username}"


class Habit(models.Model):
    FREQUENCY_DAILY = 'daily'
    FREQUENCY_WEEKLY = 'weekly'
    FREQUENCY_CUSTOM = 'custom'
    FREQUENCY_CHOICES = [
        (FREQUENCY_DAILY, 'Daily'),
        (FREQUENCY_WEEKLY, 'Weekly'),
        (FREQUENCY_CUSTOM, 'Custom Days'),
    ]

    DIFFICULTY_EASY = 'easy'
    DIFFICULTY_MEDIUM = 'medium'
    DIFFICULTY_HARD = 'hard'
    DIFFICULTY_CHOICES = [
        (DIFFICULTY_EASY, 'Easy'),
        (DIFFICULTY_MEDIUM, 'Medium'),
        (DIFFICULTY_HARD, 'Hard'),
    ]

    CATEGORY_HEALTH = 'health'
    CATEGORY_PRODUCTIVITY = 'productivity'
    CATEGORY_STUDY = 'study'
    CATEGORY_MINDFULNESS = 'mindfulness'
    CATEGORY_FITNESS = 'fitness'
    CATEGORY_CUSTOM = 'custom'
    CATEGORY_CHOICES = [
        (CATEGORY_HEALTH, 'Health'),
        (CATEGORY_PRODUCTIVITY, 'Productivity'),
        (CATEGORY_STUDY, 'Study'),
        (CATEGORY_MINDFULNESS, 'Mindfulness'),
        (CATEGORY_FITNESS, 'Fitness'),
        (CATEGORY_CUSTOM, 'Custom'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    target_per_day = models.IntegerField(default=1)
    goal = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default=CATEGORY_CUSTOM)
    frequency = models.CharField(max_length=16, choices=FREQUENCY_CHOICES, default=FREQUENCY_DAILY)
    # Comma-separated day numbers (0=Mon..6=Sun) used when frequency=custom.
    custom_days = models.CharField(max_length=32, blank=True)
    icon = models.CharField(max_length=8, default='✅')
    color = models.CharField(max_length=16, default='#2563eb')
    difficulty = models.CharField(max_length=16, choices=DIFFICULTY_CHOICES, default=DIFFICULTY_MEDIUM)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def get_custom_days(self):
        if not self.custom_days:
            return []
        values = []
        for item in self.custom_days.split(','):
            item = item.strip()
            if item.isdigit():
                day = int(item)
                if 0 <= day <= 6:
                    values.append(day)
        return sorted(set(values))

    def custom_days_label(self):
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return ', '.join(labels[d] for d in self.get_custom_days()) or 'No days selected'


class HabitLog(models.Model):
    RESULT_COMPLETED = 'completed'
    RESULT_SKIPPED = 'skipped'
    RESULT_FAILED = 'failed'
    RESULT_CHOICES = [
        (RESULT_COMPLETED, 'Completed'),
        (RESULT_SKIPPED, 'Skipped'),
        (RESULT_FAILED, 'Failed'),
    ]

    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.BooleanField()  # True = done
    result = models.CharField(max_length=16, choices=RESULT_CHOICES, default=RESULT_COMPLETED)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['habit', 'date'], name='unique_habit_log_per_day')
        ]

    def __str__(self):
        return f"{self.habit.name} - {self.date} - {self.result}"


class DailyTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    date = models.DateField()
    completed = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'date', 'title'],
                name='unique_daily_task_per_user_date_title'
            )
        ]


class HabitReminder(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='reminders')
    label = models.CharField(max_length=100, blank=True)
    remind_at = models.TimeField()
    is_active = models.BooleanField(default=True)


# ==================== Achievements & Badges ====================
class Achievement(models.Model):
    BADGE_7_STREAK = '7_streak'
    BADGE_30_STREAK = '30_streak'
    BADGE_50_LOGS = '50_logs'
    BADGE_100_LOGS = '100_logs'
    BADGE_KUDOS_10 = 'kudos_10'
    BADGE_KUDOS_25 = 'kudos_25'
    BADGE_HABITS_5 = 'habits_5'
    BADGE_HABITS_10 = 'habits_10'
    BADGE_CONSISTENT = 'consistent_90'  # 90% completion
    BADGE_EARLY_BIRD = 'early_bird'  # 5+ completed before 9am
    
    BADGE_CHOICES = [
        (BADGE_7_STREAK, '7-Day Streak'),
        (BADGE_30_STREAK, '30-Day Streak'),
        (BADGE_50_LOGS, '50 Completions'),
        (BADGE_100_LOGS, '100 Completions'),
        (BADGE_KUDOS_10, 'Kudos Champion (10+)'),
        (BADGE_KUDOS_25, 'Kudos Superstar (25+)'),
        (BADGE_HABITS_5, 'Habit Builder (5 habits)'),
        (BADGE_HABITS_10, 'Habit Master (10 habits)'),
        (BADGE_CONSISTENT, '90% Consistency'),
        (BADGE_EARLY_BIRD, 'Early Bird'),
    ]
    
    key = models.CharField(max_length=32, unique=True, choices=BADGE_CHOICES)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=8, default='🏅')
    
    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'achievement']
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


# ==================== Friends & Following ====================
class Friendship(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'friend']
    
    def __str__(self):
        return f"{self.user.username} follows {self.friend.username}"


# ==================== Notifications ====================
class Notification(models.Model):
    TYPE_KUDOS = 'kudos'
    TYPE_ACHIEVEMENT = 'achievement'
    TYPE_FRIEND_REQUEST = 'friend_request'
    TYPE_HABIT_COMPLETE = 'habit_complete'
    TYPE_CHALLENGE_UPDATE = 'challenge_update'
    TYPE_COMMENT = 'comment'
    
    TYPE_CHOICES = [
        (TYPE_KUDOS, 'Kudos Received'),
        (TYPE_ACHIEVEMENT, 'Achievement Unlocked'),
        (TYPE_FRIEND_REQUEST, 'Friend Request'),
        (TYPE_HABIT_COMPLETE, 'Friend Completed Habit'),
        (TYPE_CHALLENGE_UPDATE, 'Challenge Update'),
        (TYPE_COMMENT, 'New Comment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    title = models.CharField(max_length=150)
    message = models.CharField(max_length=255)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications_actor')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=255, blank=True)  # URL to navigate to
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"


# ==================== Comments on Habit Logs ====================
class HabitComment(models.Model):
    habit_log = models.ForeignKey(HabitLog, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.habit_log}"


# ==================== Habit Templates & Library ====================
class HabitTemplate(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500, blank=True)
    icon = models.CharField(max_length=8, default='✨')
    category = models.CharField(max_length=32, choices=Habit.CATEGORY_CHOICES, default=Habit.CATEGORY_CUSTOM)
    difficulty = models.CharField(max_length=16, choices=Habit.DIFFICULTY_CHOICES, default=Habit.DIFFICULTY_MEDIUM)
    target_per_day = models.IntegerField(default=1)
    frequency = models.CharField(max_length=16, choices=Habit.FREQUENCY_CHOICES, default=Habit.FREQUENCY_DAILY)
    usage_count = models.IntegerField(default=0)  # Track popularity
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_featured', '-usage_count']
    
    def __str__(self):
        return self.name


# ==================== Group Challenges ====================
class GroupChallenge(models.Model):
    STATUS_PLANNING = 'planning'
    STATUS_ACTIVE = 'active'
    STATUS_COMPLETED = 'completed'
    STATUS_CHOICES = [
        (STATUS_PLANNING, 'Planning'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_COMPLETED, 'Completed'),
    ]
    
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=500, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_challenges')
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PLANNING)
    habit_category = models.CharField(max_length=32, choices=Habit.CATEGORY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    prize_description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class ChallengeMembership(models.Model):
    challenge = models.ForeignKey(GroupChallenge, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['challenge', 'user']
    
    def __str__(self):
        return f"{self.user.username} in {self.challenge.name}"


# ==================== Habit Statistics ====================
class HabitStatistic(models.Model):
    """Track aggregated stats per user for performance metrics"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='habit_stats')
    total_logs = models.IntegerField(default=0)
    total_completed = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    completion_rate = models.FloatField(default=0.0)  # Percentage
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Stats for {self.user.username}"
    
    @property
    def consistency_percentage(self):
        if self.total_logs == 0:
            return 0
        return round((self.total_completed / self.total_logs) * 100, 1)