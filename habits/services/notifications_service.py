"""Notification system for user engagement."""
from django.contrib.auth.models import User
from django.utils import timezone
from ..models import Notification


def create_notification(user, notification_type, title, message, actor=None, link=''):
    """Create a notification for a user."""
    notification = Notification.objects.create(
        user=user,
        type=notification_type,
        title=title,
        message=message,
        actor=actor,
        link=link,
    )
    return notification


def notify_kudos_received(recipient, sender, message):
    """Notify user when they receive kudos."""
    create_notification(
        user=recipient,
        notification_type=Notification.TYPE_KUDOS,
        title=f'👏 Kudos from {sender.username}',
        message=message[:100],
        actor=sender,
        link=f'/profile/',
    )


def notify_achievement_unlocked(user, achievement):
    """Notify user when they unlock an achievement."""
    create_notification(
        user=user,
        notification_type=Notification.TYPE_ACHIEVEMENT,
        title=f'🏅 Achievement Unlocked: {achievement.name}',
        message=achievement.description,
        link=f'/profile/',
    )


def notify_friend_activity(user, friend, habit_name):
    """Notify user when a friend completes a habit."""
    create_notification(
        user=user,
        notification_type=Notification.TYPE_HABIT_COMPLETE,
        title=f'✅ {friend.username} completed {habit_name}',
        message=f'Keep up the momentum!',
        actor=friend,
        link=f'/u/{friend.username}/',
    )


def notify_challenge_update(user, challenge, message):
    """Notify user about challenge updates."""
    create_notification(
        user=user,
        notification_type=Notification.TYPE_CHALLENGE_UPDATE,
        title=f'🎮 {challenge.name} Update',
        message=message,
        link=f'/challenges/{challenge.id}/',
    )


def notify_comment_on_log(user, commenter, habit_name):
    """Notify user when someone comments on their habit log."""
    create_notification(
        user=user,
        notification_type=Notification.TYPE_COMMENT,
        title=f'💬 {commenter.username} commented on your habit',
        message=f'on {habit_name}',
        actor=commenter,
        link=f'/profile/',
    )


def get_user_notifications(user, unread_only=False):
    """Get notifications for a user."""
    notifications = Notification.objects.filter(user=user)
    if unread_only:
        notifications = notifications.filter(is_read=False)
    return notifications.order_by('-created_at')


def mark_notification_as_read(notification_id):
    """Mark a notification as read."""
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()
        return True
    except Notification.DoesNotExist:
        return False


def mark_all_notifications_read(user):
    """Mark all user notifications as read."""
    Notification.objects.filter(user=user, is_read=False).update(is_read=True)


def get_unread_count(user):
    """Get count of unread notifications."""
    return Notification.objects.filter(user=user, is_read=False).count()
