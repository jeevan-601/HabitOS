def generate_insight(logs):
    if not logs:
        return "Start tracking your habits!"

    total = len(logs)
    completed = sum(1 for log in logs if getattr(log, 'result', 'completed' if log.status else 'failed') == 'completed')
    skipped = sum(1 for log in logs if getattr(log, 'result', '') == 'skipped')

    success_rate = completed / total

    if success_rate < 0.4:
        return "You're struggling. Try making the habit easier."

    elif success_rate < 0.7:
        if skipped > 0:
            return "You're improving. Reduce skips to build stronger streaks."
        return "You're improving. Stay consistent."

    else:
        return "Great job! You're consistent."