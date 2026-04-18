from datetime import date, timedelta


def is_habit_scheduled_for_day(habit, target_day):
    if habit.frequency == 'daily':
        return True
    if habit.frequency == 'weekly':
        # Weekly habits default to Monday.
        return target_day.weekday() == 0
    if habit.frequency == 'custom':
        return target_day.weekday() in set(habit.get_custom_days())
    return True


def calculate_streak(habit, logs):
    logs_by_date = {log.date: log for log in logs}
    streak = 0
    cursor = date.today()

    # Traverse backwards over scheduled days only.
    for _ in range(365):
        if not is_habit_scheduled_for_day(habit, cursor):
            cursor -= timedelta(days=1)
            continue

        log = logs_by_date.get(cursor)
        if not log:
            break

        if log.result == 'completed':
            streak += 1
            cursor -= timedelta(days=1)
            continue

        # Any skipped/failed day resets streak.
        break

    return streak