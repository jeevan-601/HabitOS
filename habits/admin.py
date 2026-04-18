from django.contrib import admin
from .models import (
    DailyTask, Habit, HabitLog, Kudos, UserProfile, HabitReminder,
    Achievement, UserAchievement, Friendship, Notification,
    HabitComment, HabitTemplate, GroupChallenge, ChallengeMembership,
    HabitStatistic
)

admin.site.register(Habit)
admin.site.register(HabitLog)
admin.site.register(DailyTask)
admin.site.register(UserProfile)
admin.site.register(Kudos)
admin.site.register(HabitReminder)
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(Friendship)
admin.site.register(Notification)
admin.site.register(HabitComment)
admin.site.register(HabitTemplate)
admin.site.register(GroupChallenge)
admin.site.register(ChallengeMembership)
admin.site.register(HabitStatistic)