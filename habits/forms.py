from django import forms

from .models import Habit


class DailyTaskForm(forms.Form):
    title = forms.CharField(max_length=200)
    date = forms.DateField(required=False)

    def clean_title(self):
        return self.cleaned_data['title'].strip()


class HabitReminderForm(forms.Form):
    label = forms.CharField(max_length=100, required=False)
    remind_at = forms.TimeField()

    def clean_label(self):
        return self.cleaned_data['label'].strip()


class GroupChallengeForm(forms.Form):
    name = forms.CharField(max_length=150)
    description = forms.CharField(max_length=500, required=False)
    category = forms.ChoiceField(choices=Habit.CATEGORY_CHOICES)
    start_date = forms.DateField()
    end_date = forms.DateField()

    def clean_name(self):
        return self.cleaned_data['name'].strip()

    def clean_description(self):
        return self.cleaned_data['description'].strip()

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')

        if start_date and end_date and end_date < start_date:
            self.add_error('end_date', 'End date cannot be before start date.')

        return cleaned_data
