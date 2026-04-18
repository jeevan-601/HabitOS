"""
URL configuration for habit_ai project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from django.contrib.auth import views as auth_views
from habits import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('signup/', views.signup_view, name='signup'),
    path('accounts/login/', auth_views.LoginView.as_view(template_name='registration/login.html')),
    
    # ========== Main Navigation ==========
    path('', views.dashboard, name='dashboard'),
    path('insights/', views.insights, name='insights'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    
    # ========== Habit Management ==========
    path('add/', views.add_habit, name='add_habit'),
    path('habits/<int:habit_id>/edit/', views.edit_habit, name='edit_habit'),
    path('done/<int:habit_id>/', views.mark_done, name='mark_done'),
    path('habits/<int:habit_id>/status/<str:status>/', views.update_habit_status, name='update_habit_status'),
    path('delete-habit/<int:habit_id>/', views.delete_habit, name='delete_habit'),
    path('habits/<int:habit_id>/reminders/add/', views.add_habit_reminder, name='add_habit_reminder'),
    path('reminders/<int:reminder_id>/delete/', views.delete_habit_reminder, name='delete_habit_reminder'),
    path('reminders/', views.update_reminders, name='manage_reminders'),
    
    # ========== Daily Tasks ==========
    path('tasks/add/', views.add_daily_task, name='add_daily_task'),
    path('tasks/<int:task_id>/toggle/', views.toggle_daily_task, name='toggle_daily_task'),
    path('tasks/<int:task_id>/delete/', views.delete_daily_task, name='delete_daily_task'),
    
    # ========== Profile & Social ==========
    path('profile/', views.my_profile, name='my_profile'),
    path('profile/settings/', views.settings_view, name='settings'),
    path('u/<str:username>/', views.profile_detail, name='profile_detail'),
    path('u/<str:username>/kudos/', views.send_kudos, name='send_kudos'),
    
    # ========== Friends & Following ==========
    path('friends/', views.friends_list, name='friends'),
    path('friends/<str:username>/follow/', views.follow_user, name='follow_user'),
    path('friends/<str:username>/unfollow/', views.unfollow_user, name='unfollow_user'),
    path('activity/', views.activity_feed, name='activity_feed'),
    
    # ========== Achievements & Stats ==========
    path('achievements/', views.achievements_view, name='achievements'),
    path('statistics/', views.statistics_view, name='statistics'),
    
    # ========== Notifications ==========
    path('notifications/', views.notifications_view, name='notifications'),
    
    # ========== Habit Templates ==========
    path('templates/', views.habit_templates, name='habit_templates'),
    path('templates/<int:template_id>/use/', views.use_template, name='use_template'),
    
    # ========== Comments ==========
    path('logs/<int:log_id>/comment/', views.add_comment_to_log, name='add_comment'),
    
    # ========== Challenges ==========
    path('challenges/', views.challenges_list, name='challenges_list'),
    path('challenges/create/', views.create_challenge, name='create_challenge'),
    path('challenges/<int:challenge_id>/', views.challenge_detail, name='challenge_detail'),
    path('challenges/<int:challenge_id>/join/', views.join_challenge, name='join_challenge'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)