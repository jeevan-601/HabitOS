"""Habit statistics computation and tracking."""
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from ..models import HabitLog, Habit, HabitStatistic


def update_user_statistics(user):
    """Compute and update all statistics for a user."""
    stats, _ = HabitStatistic.objects.get_or_create(user=user)
    
    # Total logs and completions
    total_logs = HabitLog.objects.filter(habit__user=user).count()
    total_completed = HabitLog.objects.filter(habit__user=user, status=True).count()
    
    # Compute streaks
    current_streak = compute_current_streak(user)
    longest_streak = compute_longest_streak(user)
    
    # Completion rate
    completion_rate = 0
    if total_logs > 0:
        completion_rate = (total_completed / total_logs) * 100
    
    # Update statistics
    stats.total_logs = total_logs
    stats.total_completed = total_completed
    stats.current_streak = current_streak
    stats.longest_streak = longest_streak
    stats.completion_rate = completion_rate
    stats.save()
    
    return stats


def compute_current_streak(user):
    """Compute current streak (consecutive days with all habits completed)."""
    habits = Habit.objects.filter(user=user)
    if not habits.exists():
        return 0
    
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
    
    return current_streak


def compute_longest_streak(user):
    """Compute longest streak ever achieved."""
    habits = Habit.objects.filter(user=user)
    if not habits.exists():
        return 0
    
    # Get all logs sorted by date
    logs = HabitLog.objects.filter(habit__user=user).order_by('date')
    if not logs.exists():
        return 0
    
    longest = 0
    current = 0
    prev_date = None
    expected_date = None
    
    for log in logs:
        if not log.status:
            current = 0
            prev_date = None
            continue
        
        if prev_date is None:
            current = 1
        elif log.date == prev_date + timedelta(days=1):
            current += 1
        else:
            longest = max(longest, current)
            current = 1
        
        prev_date = log.date
    
    longest = max(longest, current)
    return longest


def get_weekly_stats(user):
    """Get completion stats for the current week."""
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    daily_stats = []
    for i in range(7):
        date = week_start + timedelta(days=i)
        logs = HabitLog.objects.filter(habit__user=user, date=date)
        completed = logs.filter(status=True).count()
        total = logs.count()
        
        daily_stats.append({
            'date': date,
            'day_name': date.strftime('%a'),
            'completed': completed,
            'total': total,
            'completion_rate': (completed / total * 100) if total > 0 else 0,
        })
    
    return daily_stats


def get_monthly_stats(user, month=None, year=None):
    """Get completion stats for a month."""
    today = timezone.now().date()
    if month is None:
        month = today.month
    if year is None:
        year = today.year
    
    from datetime import date
    
    # Get first and last day of month
    if month == 12:
        first_day = date(year, month, 1)
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        first_day = date(year, month, 1)
        last_day = date(year, month + 1, 1) - timedelta(days=1)
    
    logs = HabitLog.objects.filter(
        habit__user=user,
        date__gte=first_day,
        date__lte=last_day
    )
    
    total = logs.count()
    completed = logs.filter(status=True).count()
    
    return {
        'month': month,
        'year': year,
        'total': total,
        'completed': completed,
        'completion_rate': (completed / total * 100) if total > 0 else 0,
    }


def get_category_stats(user):
    """Get completion stats by habit category."""
    categories = Habit.CATEGORY_CHOICES
    stats = []
    
    for category_key, category_name in categories:
        habits = Habit.objects.filter(user=user, category=category_key)
        if not habits.exists():
            continue
        
        logs = HabitLog.objects.filter(habit__in=habits)
        total = logs.count()
        completed = logs.filter(status=True).count()
        
        stats.append({
            'category': category_name,
            'category_key': category_key,
            'total': total,
            'completed': completed,
            'completion_rate': (completed / total * 100) if total > 0 else 0,
            'habit_count': habits.count(),
        })
    
    # Filter out empty categories and sort by completion rate
    stats = [s for s in stats if s['total'] > 0]
    stats.sort(key=lambda x: x['completion_rate'], reverse=True)
    
    return stats
