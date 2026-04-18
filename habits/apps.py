from django.apps import AppConfig


class HabitsConfig(AppConfig):
    name = 'habits'

    def ready(self):
        from . import signals  # noqa: F401
