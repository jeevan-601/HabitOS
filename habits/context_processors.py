from .models import UserProfile


def current_profile(request):
    if request.user.is_authenticated:
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return {'current_profile': profile}
    return {'current_profile': None}