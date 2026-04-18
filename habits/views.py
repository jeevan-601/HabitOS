from collections import defaultdict
from datetime import date, timedelta
import random
import calendar

import json

from django.contrib import messages
from django.contrib.auth import login as auth_login
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncWeek
from django.shortcuts import get_object_or_404, redirect, render

from .forms import DailyTaskForm, GroupChallengeForm, HabitReminderForm
from .models import DailyTask, Habit, HabitLog, HabitReminder, Kudos, UserProfile, \
    Achievement, UserAchievement, Notification, Friendship, HabitComment, \
    HabitTemplate, GroupChallenge, ChallengeMembership, HabitStatistic
from .services.ai_engine import generate_insight
from .services.streak import calculate_streak, is_habit_scheduled_for_day
from .services.achievements_service import check_and_unlock_achievements, get_user_achievements
from .services.notifications_service import (
    create_notification, notify_kudos_received, notify_achievement_unlocked,
    get_user_notifications, mark_notification_as_read, get_unread_count
)

User = get_user_model()


PRESET_HABITS = [
    {
        'name': 'Morning Walk',
        'goal': 'Improve cardio and energy levels',
        'icon': '🚶',
        'color': '#0ea5e9',
        'difficulty': Habit.DIFFICULTY_EASY,
        'category': Habit.CATEGORY_FITNESS,
        'frequency': Habit.FREQUENCY_DAILY,
        'custom_days': '',
    },
    {
        'name': 'Read 20 Minutes',
        'goal': 'Build a daily learning habit',
        'icon': '📚',
        'color': '#7c3aed',
        'difficulty': Habit.DIFFICULTY_MEDIUM,
        'category': Habit.CATEGORY_STUDY,
        'frequency': Habit.FREQUENCY_DAILY,
        'custom_days': '',
    },
    {
        'name': 'Deep Work Session',
        'goal': 'Increase focused output',
        'icon': '🧠',
        'color': '#2563eb',
        'difficulty': Habit.DIFFICULTY_HARD,
        'category': Habit.CATEGORY_PRODUCTIVITY,
        'frequency': Habit.FREQUENCY_CUSTOM,
        'custom_days': '0,1,2,3,4',
    },
]


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            auth_login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()

    return render(request, 'signup.html', {'form': form})


def _get_or_create_profile(user):
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


def _user_current_streak(user):
    habits = Habit.objects.filter(user=user).order_by('id')
    best_streak = 0
    for habit in habits:
        logs = HabitLog.objects.filter(habit=habit).order_by('date')
        best_streak = max(best_streak, calculate_streak(habit, logs))
    return best_streak


def _user_completed_logs(user):
    return HabitLog.objects.filter(habit__user=user, result=HabitLog.RESULT_COMPLETED).count()


def _user_completion_rate(user):
    habits = Habit.objects.filter(user=user)
    total_logs = HabitLog.objects.filter(habit__in=habits).count()
    completed_logs = HabitLog.objects.filter(habit__in=habits, result=HabitLog.RESULT_COMPLETED).count()
    if not total_logs:
        return 0
    return round((completed_logs / total_logs) * 100, 1)


def _build_competition_rows(users):
    rows = []
    for user in users:
        profile = _get_or_create_profile(user)
        rows.append({
            'user': user,
            'profile': profile,
            'current_streak': _user_current_streak(user),
            'completed_logs': _user_completed_logs(user),
            'completion_rate': _user_completion_rate(user),
            'kudos_received': user.kudos_received.count(),
            'habit_count': Habit.objects.filter(user=user).count(),
        })

    rows.sort(key=lambda row: (-row['current_streak'], -row['completed_logs'], -row['kudos_received'], row['user'].username.lower()))
    for index, row in enumerate(rows, start=1):
        row['rank'] = index
    return rows


def _parse_custom_days(raw_values):
    allowed = []
    for item in raw_values:
        item = str(item).strip()
        if item.isdigit():
            day = int(item)
            if 0 <= day <= 6:
                allowed.append(day)
    return ','.join(str(day) for day in sorted(set(allowed)))


def _habit_form_payload(request):
    frequency = request.POST.get('frequency', Habit.FREQUENCY_DAILY)
    custom_days = _parse_custom_days(request.POST.getlist('custom_days')) if frequency == Habit.FREQUENCY_CUSTOM else ''

    target_raw = request.POST.get('target_per_day') or '1'
    target = 1
    if str(target_raw).isdigit() and int(target_raw) > 0:
        target = int(target_raw)

    return {
        'name': (request.POST.get('name') or '').strip(),
        'goal': (request.POST.get('goal') or '').strip(),
        'category': request.POST.get('category') or Habit.CATEGORY_CUSTOM,
        'frequency': frequency,
        'custom_days': custom_days,
        'icon': (request.POST.get('icon') or '✅').strip()[:8] or '✅',
        'color': (request.POST.get('color') or '#2563eb').strip()[:16] or '#2563eb',
        'difficulty': request.POST.get('difficulty') or Habit.DIFFICULTY_MEDIUM,
        'target_per_day': target,
    }


def _compute_completion_rate(habit, window_days=30):
    today = date.today()
    start = today.fromordinal(today.toordinal() - (window_days - 1))
    logs = HabitLog.objects.filter(habit=habit, date__gte=start, date__lte=today)
    logs_by_date = {log.date: log for log in logs}

    scheduled = 0
    completed = 0
    cursor = start
    while cursor <= today:
        if is_habit_scheduled_for_day(habit, cursor):
            scheduled += 1
            log = logs_by_date.get(cursor)
            if log and log.result == HabitLog.RESULT_COMPLETED:
                completed += 1
        cursor = cursor.fromordinal(cursor.toordinal() + 1)

    if not scheduled:
        return 0
    return round((completed / scheduled) * 100, 1)


def _build_habit_chart(habits, period):
    truncator = TruncWeek if period == 'weekly' else TruncMonth
    logs = (
        HabitLog.objects.filter(habit__in=habits, result=HabitLog.RESULT_COMPLETED)
        .annotate(bucket=truncator('date'))
        .values('habit_id', 'habit__name', 'bucket')
        .annotate(count=Count('id'))
        .order_by('bucket')
    )

    buckets = []
    series_by_habit = defaultdict(dict)

    for row in logs:
        bucket = row['bucket']
        if bucket and bucket not in buckets:
            buckets.append(bucket)
        habit_id = str(row['habit_id'])
        series_by_habit[habit_id][bucket] = row['count']

    labels = [bucket.strftime('%Y-%m-%d') if period == 'weekly' else bucket.strftime('%Y-%m') for bucket in buckets]

    datasets = []
    for habit in habits:
        series = series_by_habit.get(str(habit.id), {})
        datasets.append({
            'habit_id': habit.id,
            'label': habit.name,
            'data': [series.get(bucket, 0) for bucket in buckets],
        })

    return {
        'labels': labels,
        'datasets': datasets,
    }


def _build_habit_orbit(habit, months=3):
    if not habit:
        return {
            'months': [],
            'summary': {
                'completed': 0,
                'skipped': 0,
                'failed': 0,
                'completion_rate': 0,
                'current_streak': 0,
            },
        }

    today = date.today()

    def add_months(start_date, delta):
        year = start_date.year + ((start_date.month - 1 + delta) // 12)
        month = ((start_date.month - 1 + delta) % 12) + 1
        return date(year, month, 1)

    month_start = date(today.year, today.month, 1)
    if months == 3:
        # Show previous, current, next month (e.g., Mar/Apr/May when current is Apr).
        month_starts = [
            add_months(month_start, -1),
            month_start,
            add_months(month_start, 1),
        ]
    else:
        month_starts = []
        cursor = month_start
        for _ in range(months):
            month_starts.append(cursor)
            cursor = add_months(cursor, -1)
        month_starts.reverse()

    range_start = month_starts[0]
    logs = HabitLog.objects.filter(habit=habit, date__gte=range_start, date__lte=today)
    logs_by_date = {log.date: log for log in logs}

    completed_count = 0
    skipped_count = 0
    failed_count = 0

    orbit_months = []
    for month in month_starts:
        _, days_in_month = calendar.monthrange(month.year, month.month)
        first_day = date(month.year, month.month, 1)
        day_cells = []

        for day_num in range(1, days_in_month + 1):
            day_value = date(month.year, month.month, day_num)
            log = logs_by_date.get(day_value)
            status = ''
            level = 0
            if log:
                status = log.result
                if log.result == HabitLog.RESULT_COMPLETED:
                    level = 4
                    completed_count += 1
                elif log.result == HabitLog.RESULT_SKIPPED:
                    level = 2
                    skipped_count += 1
                elif log.result == HabitLog.RESULT_FAILED:
                    level = 1
                    failed_count += 1

            day_cells.append({
                'day': day_num,
                'date': day_value,
                'status': status,
                'level': level,
            })

        orbit_months.append({
            'label': first_day.strftime('%b %Y'),
            'start_padding': first_day.weekday(),
            'days': day_cells,
        })

    total_logged = completed_count + skipped_count + failed_count
    completion_rate = round((completed_count / total_logged) * 100, 1) if total_logged else 0

    habit_logs = HabitLog.objects.filter(habit=habit).order_by('date')
    current_streak = calculate_streak(habit, habit_logs)

    return {
        'months': orbit_months,
        'summary': {
            'completed': completed_count,
            'skipped': skipped_count,
            'failed': failed_count,
            'completion_rate': completion_rate,
            'current_streak': current_streak,
        },
    }


def _get_today_tasks(user):
    today = date.today()
    return DailyTask.objects.filter(user=user, date=today).order_by('completed', 'title')


# 🔹 DASHBOARD
@login_required
def dashboard(request):
    habits = Habit.objects.filter(user=request.user).prefetch_related('reminders').order_by('name')

    habit_data = []
    today_tasks = _get_today_tasks(request.user)
    today = date.today()
    today_logs = HabitLog.objects.filter(habit__in=habits, date=today)
    logs_by_habit_id = {log.habit_id: log for log in today_logs}
    today_habits = []

    for habit in habits:
        logs = HabitLog.objects.filter(habit=habit).order_by('date')
        streak = calculate_streak(habit, logs)
        completion_rate = _compute_completion_rate(habit)
        today_log = logs_by_habit_id.get(habit.id)
        today_status = today_log.result if today_log else 'pending'

        if is_habit_scheduled_for_day(habit, today):
            today_habits.append({
                'habit': habit,
                'today_status': today_status,
            })

        habit_data.append({
            'habit': habit,
            'streak': streak,
            'completion_rate': completion_rate,
            'today_status': today_status,
            'reminders': list(habit.reminders.filter(is_active=True)),
        })

    return render(request, 'dashboard.html', {
        'habit_data': habit_data,
        'today_tasks': today_tasks,
        'today_habits': today_habits,
    })


# 🔹 MARK DONE (NO DUPLICATES)
@login_required
def mark_done(request, habit_id):
    return update_habit_status(request, habit_id, HabitLog.RESULT_COMPLETED)


@login_required
def update_habit_status(request, habit_id, status):
    if request.method != 'POST':
        return redirect('dashboard')

    if status not in {HabitLog.RESULT_COMPLETED, HabitLog.RESULT_SKIPPED, HabitLog.RESULT_FAILED}:
        return redirect('dashboard')

    habit = get_object_or_404(Habit, id=habit_id, user=request.user)
    today = date.today()

    log, _ = HabitLog.objects.get_or_create(
        habit=habit,
        date=today,
        defaults={
            'status': status == HabitLog.RESULT_COMPLETED,
            'result': status,
        },
    )
    if log.result != status:
        log.result = status
        log.status = status == HabitLog.RESULT_COMPLETED
        log.save(update_fields=['result', 'status'])

    return redirect('dashboard')


@login_required
def delete_habit(request, habit_id):
    if request.method != 'POST':
        return redirect('dashboard')

    habit = get_object_or_404(Habit, id=habit_id, user=request.user)
    habit.delete()
    return redirect('dashboard')


# 🔹 ADD HABIT (PROTECTED)
@login_required
def add_habit(request):
    if request.method == "POST":
        template_name = (request.POST.get('template_name') or '').strip()
        if template_name:
            selected = next((item for item in PRESET_HABITS if item['name'] == template_name), None)
            if selected:
                Habit.objects.create(user=request.user, **selected)
                return redirect('dashboard')

        payload = _habit_form_payload(request)
        if payload['name']:
            Habit.objects.create(user=request.user, **payload)

        return redirect('dashboard')

    return render(request, 'add_habit.html', {
        'preset_habits': PRESET_HABITS,
        'habit_categories': Habit.CATEGORY_CHOICES,
        'frequency_choices': Habit.FREQUENCY_CHOICES,
        'difficulty_choices': Habit.DIFFICULTY_CHOICES,
    })


@login_required
def edit_habit(request, habit_id):
    habit = get_object_or_404(Habit, id=habit_id, user=request.user)

    if request.method == 'POST':
        payload = _habit_form_payload(request)
        if payload['name']:
            for field, value in payload.items():
                setattr(habit, field, value)
            habit.save()
        return redirect('dashboard')

    return render(request, 'add_habit.html', {
        'is_edit': True,
        'habit': habit,
        'preset_habits': PRESET_HABITS,
        'habit_categories': Habit.CATEGORY_CHOICES,
        'frequency_choices': Habit.FREQUENCY_CHOICES,
        'difficulty_choices': Habit.DIFFICULTY_CHOICES,
    })


@login_required
def add_habit_reminder(request, habit_id):
    if request.method != 'POST':
        return redirect('dashboard')

    habit = get_object_or_404(Habit, id=habit_id, user=request.user)
    form = HabitReminderForm(request.POST)
    if form.is_valid():
        HabitReminder.objects.create(
            habit=habit,
            remind_at=form.cleaned_data['remind_at'],
            label=form.cleaned_data['label'],
        )
    else:
        messages.error(request, 'Please provide a valid reminder time.')

    return redirect('edit_habit', habit_id=habit.id)


@login_required
def delete_habit_reminder(request, reminder_id):
    if request.method != 'POST':
        return redirect('dashboard')

    reminder = get_object_or_404(HabitReminder, id=reminder_id, habit__user=request.user)
    habit_id = reminder.habit_id
    reminder.delete()
    return redirect('edit_habit', habit_id=habit_id)


@login_required
def add_daily_task(request):
    if request.method == 'POST':
        form = DailyTaskForm(request.POST)
        if form.is_valid():
            task_date = form.cleaned_data.get('date') or date.today()
            DailyTask.objects.get_or_create(
                user=request.user,
                date=task_date,
                title=form.cleaned_data['title'],
                defaults={'completed': False},
            )
        else:
            messages.error(request, 'Please provide a valid task title and date.')

    return redirect('dashboard')


@login_required
def toggle_daily_task(request, task_id):
    if request.method != 'POST':
        return redirect('dashboard')

    task = get_object_or_404(DailyTask, id=task_id, user=request.user)
    task.completed = not task.completed
    task.save(update_fields=['completed'])
    return redirect('dashboard')


@login_required
def delete_daily_task(request, task_id):
    if request.method != 'POST':
        return redirect('dashboard')

    task = get_object_or_404(DailyTask, id=task_id, user=request.user)
    task.delete()
    return redirect('dashboard')


# 🔹 AI INSIGHTS (PROTECTED)
@login_required
def insights(request):
    habits = Habit.objects.filter(user=request.user).order_by('name')
    all_logs = HabitLog.objects.filter(habit__in=habits)
    chart_view = request.GET.get('view', 'weekly')
    selected_habit_id = request.GET.get('habit')

    selected_habit = None
    if selected_habit_id and str(selected_habit_id).isdigit():
        selected_habit = habits.filter(id=int(selected_habit_id)).first()
    if not selected_habit and habits.exists():
        selected_habit = habits.first()

    orbit_data = _build_habit_orbit(selected_habit)
    chart_data = {
        'weekly': _build_habit_chart(habits, 'weekly'),
        'monthly': _build_habit_chart(habits, 'monthly'),
    }
    today = date.today()
    today_tasks = DailyTask.objects.filter(user=request.user, date=today)
    total_tasks = today_tasks.count()
    completed_tasks = today_tasks.filter(completed=True).count()
    completion_rate = round((completed_tasks / total_tasks) * 100, 1) if total_tasks else 0

    message = generate_insight(all_logs)

    return render(request, 'insights.html', {
        'message': message,
        'chart_data': json.dumps(chart_data),
        'default_view': chart_view if chart_view in {'weekly', 'monthly'} else 'weekly',
        'habit_options': habits,
        'selected_habit': selected_habit,
        'orbit_months': orbit_data['months'],
        'orbit_summary': orbit_data['summary'],
        'task_stats': {
            'total': total_tasks,
            'completed': completed_tasks,
            'completion_rate': completion_rate,
        },
        'habit_summary': {
            'total': habits.count(),
            'completed_logs': all_logs.filter(result=HabitLog.RESULT_COMPLETED).count(),
            'skipped_logs': all_logs.filter(result=HabitLog.RESULT_SKIPPED).count(),
            'failed_logs': all_logs.filter(result=HabitLog.RESULT_FAILED).count(),
        },
    })


@login_required
def my_profile(request):
    return profile_detail(request, request.user.username)



@login_required
def settings_view(request):
    profile = _get_or_create_profile(request.user)

    if request.method == 'POST':
        profile.status = (request.POST.get('status') or '').strip()[:160]
        if request.FILES.get('avatar'):
            profile.avatar = request.FILES['avatar']
        profile.save()
        messages.success(request, 'Settings updated.')
        return redirect('settings')

    return render(request, 'settings.html', {
        'profile': profile,
    })

def profile_detail(request, username):
    profile_user = get_object_or_404(User, username=username)
    profile = _get_or_create_profile(profile_user)
    habits = Habit.objects.filter(user=profile_user).order_by('name')
    recent_kudos = profile_user.kudos_received.select_related('sender').all()[:10]
    leaderboard_rows = _build_competition_rows(User.objects.filter(is_active=True).order_by('username'))
    profile_row = next((row for row in leaderboard_rows if row['user'].id == profile_user.id), None)
    can_edit = request.user.is_authenticated and request.user.id == profile_user.id
    can_send_kudos = request.user.is_authenticated and request.user.id != profile_user.id
    suggested_profiles = []

    candidate_rows = [
        row for row in leaderboard_rows
        if row['user'].id != profile_user.id
    ]

    target_rank = profile_row['rank'] if profile_row else None
    nearby_rows = candidate_rows
    if target_rank:
        nearby_rows = [row for row in candidate_rows if abs(row['rank'] - target_rank) <= 8]
        if len(nearby_rows) < 3:
            nearby_rows = candidate_rows

    iso = date.today().isocalendar()
    week_seed = f"{iso.year}-{iso.week}-{profile_user.id}"
    rng = random.Random(week_seed)
    nearby_rows = list(nearby_rows)
    rng.shuffle(nearby_rows)
    suggested_profiles = nearby_rows[:3]

    return render(request, 'profile.html', {
        'profile_user': profile_user,
        'profile': profile,
        'habits': habits,
        'recent_kudos': recent_kudos,
        'profile_row': profile_row,
        'can_edit': can_edit,
        'can_send_kudos': can_send_kudos,
        'suggested_profiles': suggested_profiles,
    })


@login_required
def send_kudos(request, username):
    if request.method != 'POST':
        return redirect('profile_detail', username=username)

    recipient = get_object_or_404(User, username=username)
    if recipient.id == request.user.id:
        messages.error(request, 'You cannot send kudos to yourself.')
        return redirect('profile_detail', username=username)

    message_text = (request.POST.get('message') or '').strip()[:180]
    Kudos.objects.create(sender=request.user, recipient=recipient, message=message_text)
    messages.success(request, f'Kudos sent to {recipient.username}.')

    next_url = (request.POST.get('next') or '').strip()
    if next_url.startswith('/'):
        return redirect(next_url)
    return redirect('profile_detail', username=username)


@login_required
def leaderboard(request):
    rows = _build_competition_rows(User.objects.filter(is_active=True).order_by('username'))
    my_rank = next((row['rank'] for row in rows if row['user'].id == request.user.id), None)
    return render(request, 'leaderboard.html', {
        'leaderboard_rows': rows,
        'my_rank': my_rank,
    })


# ==================== ACHIEVEMENTS & BADGES ====================
@login_required
def achievements_view(request):
    """Display user's achievements and badges."""
    # Update and check for new achievements
    unlocked = check_and_unlock_achievements(request.user)
    
    # Get all achievements with status
    achievements_data = get_user_achievements(request.user)
    
    unlocked_count = sum(1 for item in achievements_data if item['is_unlocked'])
    total_count = len(achievements_data)
    
    return render(request, 'achievements.html', {
        'achievements_data': achievements_data,
        'unlocked_count': unlocked_count,
        'total_count': total_count,
        'newly_unlocked': unlocked,
    })


# ==================== STATISTICS & CHARTS ====================
@login_required
def statistics_view(request):
    """Redirect to the combined analytics page."""
    return redirect('insights')


# ==================== NOTIFICATIONS & ACTIVITY FEED ====================
@login_required
def notifications_view(request):
    """Display user's notifications."""
    notifications = get_user_notifications(request.user)
    unread_count = get_unread_count(request.user)
    
    # Mark all as read when viewing
    if request.GET.get('mark_read'):
        from .services.notifications_service import mark_all_notifications_read
        mark_all_notifications_read(request.user)
        return redirect('notifications')
    
    return render(request, 'notifications.html', {
        'notifications': notifications[:50],  # Show last 50
        'unread_count': unread_count,
    })


@login_required
def activity_feed(request):
    """Display activity feed of friends and followed users."""
    # Get user's friends
    friends = Friendship.objects.filter(user=request.user).values_list('friend_id', flat=True)
    
    # Get recent activity from friends
    recent_logs = HabitLog.objects.filter(
        habit__user_id__in=friends,
        status=True,
        date__gte=date.today() - timedelta(days=7)
    ).select_related('habit__user').order_by('-date')[:50]
    
    recent_kudos_given = Kudos.objects.filter(
        sender_id__in=friends
    ).select_related('recipient').order_by('-created_at')[:50]
    
    return render(request, 'activity_feed.html', {
        'recent_logs': recent_logs,
        'recent_kudos': recent_kudos_given,
    })


# ==================== FRIENDS & FOLLOWING ====================
@login_required
def friends_list(request):
    """Display user's friends and suggestions."""
    # Get current friends
    friends = Friendship.objects.filter(user=request.user).select_related('friend').order_by('friend__username')

    search_query = (request.GET.get('q') or '').strip()
    
    # Get friend suggestions (users with similar rank that you don't follow)
    my_rank_rows = _build_competition_rows([request.user])
    my_rank = my_rank_rows[0]['rank'] if my_rank_rows else None
    
    all_rows = _build_competition_rows(User.objects.filter(is_active=True).order_by('username'))
    friend_ids = set(friends.values_list('friend_id', flat=True))
    
    suggestions = []
    if my_rank:
        suggestions = [
            row for row in all_rows
            if row['user'].id != request.user.id
            and row['user'].id not in friend_ids
            and abs(row['rank'] - my_rank) <= 10
        ][:10]

    search_rows = []
    if search_query:
        search_rows = [
            row for row in all_rows
            if row['user'].id != request.user.id
            and search_query.lower() in row['user'].username.lower()
        ]

        search_rows = search_rows[:20]
    
    return render(request, 'friends.html', {
        'friends': friends,
        'suggestions': suggestions,
        'followed_user_ids': sorted(friend_ids),
        'search_rows': search_rows,
        'search_query': search_query,
    })


@login_required
def follow_user(request, username):
    """Follow a user."""
    if request.method != 'POST':
        return redirect('friends')
    
    user_to_follow = get_object_or_404(User, username=username)
    if user_to_follow.id == request.user.id:
        messages.error(request, 'You cannot follow yourself.')
        return redirect('friends')
    
    Friendship.objects.get_or_create(user=request.user, friend=user_to_follow)
    messages.success(request, f'You now follow {username}.')
    
    next_url = request.POST.get('next', 'friends')
    return redirect(next_url)


@login_required
def unfollow_user(request, username):
    """Unfollow a user."""
    if request.method != 'POST':
        return redirect('friends')
    
    user_to_unfollow = get_object_or_404(User, username=username)
    Friendship.objects.filter(user=request.user, friend=user_to_unfollow).delete()
    messages.success(request, f'You unfollowed {username}.')
    
    next_url = request.POST.get('next', 'friends')
    return redirect(next_url)


# ==================== HABIT TEMPLATES & LIBRARY ====================
@login_required
def habit_templates(request):
    """Browse habit templates and create new habits from them."""
    templates = HabitTemplate.objects.filter(is_featured=True).order_by('-usage_count')[:12]
    
    # Get all templates organized by category
    all_templates = HabitTemplate.objects.all().order_by('-usage_count')
    templates_by_category = {}
    for category_key, category_name in Habit.CATEGORY_CHOICES:
        templates_by_category[category_name] = all_templates.filter(category=category_key)
    
    return render(request, 'habit_templates.html', {
        'featured_templates': templates,
        'templates_by_category': templates_by_category,
        'categories': Habit.CATEGORY_CHOICES,
    })


@login_required
def use_template(request, template_id):
    """Create a new habit from a template."""
    if request.method != 'POST':
        return redirect('habit_templates')
    
    template = get_object_or_404(HabitTemplate, id=template_id)
    
    # Increment usage count
    template.usage_count += 1
    template.save(update_fields=['usage_count'])
    
    # Create new habit
    habit = Habit.objects.create(
        user=request.user,
        name=template.name,
        goal=template.description,
        icon=template.icon,
        category=template.category,
        difficulty=template.difficulty,
        target_per_day=template.target_per_day,
        frequency=template.frequency,
    )
    
    messages.success(request, f'Created habit "{template.name}" from template.')
    return redirect('dashboard')


# ==================== HABIT COMMENTS ====================
@login_required
def add_comment_to_log(request, log_id):
    """Add a comment to a habit log."""
    if request.method != 'POST':
        return redirect('profile')
    
    log = get_object_or_404(HabitLog, id=log_id)
    
    # Any authenticated user can comment on a log.
    can_comment = True
    
    if not can_comment:
        messages.error(request, 'Cannot comment on this log.')
        return redirect('profile')
    
    text = (request.POST.get('text') or '').strip()[:500]
    if text:
        HabitComment.objects.create(
            habit_log=log,
            author=request.user,
            text=text,
        )
        
        # Notify the log owner
        if log.habit.user.id != request.user.id:
            create_notification(
                user=log.habit.user,
                notification_type=Notification.TYPE_COMMENT,
                title=f'💬 {request.user.username} commented on your habit',
                message=text[:50],
                actor=request.user,
                link=f'/profile/',
            )
    
    next_url = request.POST.get('next', 'profile')
    return redirect(next_url)


# ==================== GROUP CHALLENGES ====================
@login_required
def challenges_list(request):
    """List all available challenges."""
    from django.utils import timezone
    now = timezone.now().date()

    user_challenge_ids = list(
        ChallengeMembership.objects.filter(user=request.user).values_list('challenge_id', flat=True)
    )

    active_qs = GroupChallenge.objects.filter(
        status=GroupChallenge.STATUS_ACTIVE,
        end_date__gte=now
    ).annotate(member_count=Count('members')).order_by('-start_date')
    
    active_challenges = active_qs
    
    completed_challenges = GroupChallenge.objects.filter(
        status=GroupChallenge.STATUS_COMPLETED
    ).annotate(member_count=Count('members')).order_by('-end_date')[:10]

    preferred_categories = list(
        Habit.objects.filter(user=request.user)
        .values('category')
        .annotate(total=Count('id'))
        .order_by('-total')
        .values_list('category', flat=True)
    )

    suggested_challenges = list(
        active_qs.filter(habit_category__in=preferred_categories)
        .exclude(id__in=user_challenge_ids)
        .exclude(creator=request.user)[:3]
    )

    if len(suggested_challenges) < 3:
        existing_ids = [item.id for item in suggested_challenges]
        fallback = list(
            active_qs.exclude(id__in=user_challenge_ids)
            .exclude(id__in=existing_ids)
            .exclude(creator=request.user)[: 3 - len(suggested_challenges)]
        )
        suggested_challenges.extend(fallback)
    
    return render(request, 'challenges_list.html', {
        'active_challenges': active_challenges,
        'completed_challenges': completed_challenges,
        'user_challenge_ids': user_challenge_ids,
        'suggested_challenges': suggested_challenges,
    })


@login_required
def challenge_detail(request, challenge_id):
    """Display challenge details and leaderboard."""
    challenge = get_object_or_404(GroupChallenge, id=challenge_id)
    members = ChallengeMembership.objects.filter(challenge=challenge).select_related('user')
    
    # Build leaderboard for challenge
    member_stats = []
    for membership in members:
        logs = HabitLog.objects.filter(
            habit__user=membership.user,
            date__gte=challenge.start_date,
            date__lte=challenge.end_date,
            status=True
        )
        member_stats.append({
            'user': membership.user,
            'completion_count': logs.count(),
            'joined_at': membership.joined_at,
        })
    
    member_stats.sort(key=lambda x: -x['completion_count'])
    
    user_is_member = ChallengeMembership.objects.filter(
        challenge=challenge,
        user=request.user
    ).exists()
    
    return render(request, 'challenge_detail.html', {
        'challenge': challenge,
        'member_stats': member_stats,
        'user_is_member': user_is_member,
    })


@login_required
def join_challenge(request, challenge_id):
    """Join a challenge."""
    if request.method != 'POST':
        return redirect('challenges_list')
    
    challenge = get_object_or_404(GroupChallenge, id=challenge_id)
    ChallengeMembership.objects.get_or_create(challenge=challenge, user=request.user)
    
    messages.success(request, f'You joined the "{challenge.name}" challenge!')
    return redirect('challenge_detail', challenge_id=challenge.id)


@login_required
def create_challenge(request):
    """Create a new group challenge."""
    if request.method == 'POST':
        form = GroupChallengeForm(request.POST)
        if form.is_valid():
            challenge = GroupChallenge.objects.create(
                name=form.cleaned_data['name'],
                description=form.cleaned_data['description'],
                creator=request.user,
                habit_category=form.cleaned_data['category'],
                start_date=form.cleaned_data['start_date'],
                end_date=form.cleaned_data['end_date'],
                prize_description='',
                status=GroupChallenge.STATUS_PLANNING,
            )

            # Creator automatically joins
            ChallengeMembership.objects.create(challenge=challenge, user=request.user)

            messages.success(request, f'Challenge "{challenge.name}" created!')
            return redirect('challenge_detail', challenge_id=challenge.id)

        messages.error(request, 'Please provide valid challenge details.')
    
    return render(request, 'create_challenge.html', {
        'categories': Habit.CATEGORY_CHOICES,
    })


# ==================== REMINDERS & NOTIFICATIONS ====================
@login_required
def update_reminders(request):
    """Update habit reminders."""
    if request.method == 'POST':
        habit_id = request.POST.get('habit_id')
        habit = get_object_or_404(Habit, id=habit_id, user=request.user)
        
        # Update reminders... (implementation depends on UI)
        return redirect('edit_habit', habit_id=habit.id)
    
    habits = Habit.objects.filter(user=request.user).prefetch_related('reminders')
    return render(request, 'manage_reminders.html', {
        'habits': habits,
    })

