"""Achievement/Badge system for habits."""
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from ..models import Achievement, UserAchievement, HabitLog, Kudos, Habit


def check_and_unlock_achievements(user):
    """Check all achievement conditions and unlock if eligible."""
    achievements_to_check = [
        check_streak_badges,
        check_completion_badges,
        check_kudos_badges,
        check_habit_badges,
        check_consistency_badge,
        check_early_bird_badge,
    ]
    
    unlocked = []
    for check_func in achievements_to_check:
        newly_unlocked = check_func(user)
        unlocked.extend(newly_unlocked)
    
    return unlocked


def check_streak_badges(user):
    """Check 7-day and 30-day streak badges."""
    unlocked = []
    
    # Get user's habits
    habits = Habit.objects.filter(user=user)
    if not habits.exists():
        return unlocked
    
    # Calculate current streak
    today = timezone.now().date()
    current_streak = 0
    check_date = today
    
    while True:
        logs = HabitLog.objects.filter(
            habit__user=user,
            date=check_date,
            status=True
        )
        if logs.count() == habits.count():
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    # Check 7-day streak
    if current_streak >= 7:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_7_STREAK).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    # Check 30-day streak
    if current_streak >= 30:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_30_STREAK).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    return unlocked


def check_completion_badges(user):
    """Check 50 and 100 completions badges."""
    unlocked = []
    
    completed_count = HabitLog.objects.filter(habit__user=user, status=True).count()
    
    # Check 50 completions
    if completed_count >= 50:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_50_LOGS).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    # Check 100 completions
    if completed_count >= 100:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_100_LOGS).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    return unlocked


def check_kudos_badges(user):
    """Check kudos received badges."""
    unlocked = []
    
    kudos_count = Kudos.objects.filter(recipient=user).count()
    
    # Check 10 kudos
    if kudos_count >= 10:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_KUDOS_10).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    # Check 25 kudos
    if kudos_count >= 25:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_KUDOS_25).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    return unlocked


def check_habit_badges(user):
    """Check habit creation badges (5 habits, 10 habits)."""
    unlocked = []
    
    habit_count = Habit.objects.filter(user=user).count()
    
    # Check 5 habits
    if habit_count >= 5:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_HABITS_5).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    # Check 10 habits
    if habit_count >= 10:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_HABITS_10).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    return unlocked


def check_consistency_badge(user):
    """Check 90% completion consistency badge."""
    unlocked = []
    
    total_logs = HabitLog.objects.filter(habit__user=user).count()
    if total_logs == 0:
        return unlocked
    
    completed_logs = HabitLog.objects.filter(habit__user=user, status=True).count()
    completion_rate = (completed_logs / total_logs) * 100
    
    if completion_rate >= 90:
        achievement = Achievement.objects.filter(key=Achievement.BADGE_CONSISTENT).first()
        if achievement and not UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            UserAchievement.objects.create(user=user, achievement=achievement)
            unlocked.append(achievement)
    
    return unlocked


def check_early_bird_badge(user):
    """Check early bird badge (5+ habits completed before 9am)."""
    unlocked = []
    
    # This would require storing completion times in HabitLog
    # For now, we'll mark it as achievable for demonstration
    # In production, you'd track completion_time on HabitLog
    
    return unlocked


def get_user_achievements(user):
    """Get all achievements and their unlock status for a user."""
    all_achievements = Achievement.objects.all()
    user_achievements = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
    
    result = []
    for achievement in all_achievements:
        is_unlocked = achievement.id in user_achievements
        unlocked_at = None
        if is_unlocked:
            ua = UserAchievement.objects.get(user=user, achievement=achievement)
            unlocked_at = ua.unlocked_at
        
        result.append({
            'achievement': achievement,
            'is_unlocked': is_unlocked,
            'unlocked_at': unlocked_at,
        })
    
    return result
