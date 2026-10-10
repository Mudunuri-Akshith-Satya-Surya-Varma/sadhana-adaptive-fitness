from django.db import models
from django.contrib.auth.models import User

class WorkoutPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='workout_plans')
    title = models.CharField(max_length=200)
    class_slug = models.CharField(max_length=50, default="yodha")
    duration_minutes = models.PositiveIntegerField(default=45)
    is_ai_adapted = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default="pending", choices=[
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    def total_xp(self) -> int:
        return sum(we.xp_reward for we in self.exercises.all())

    def __str__(self):
        return f"{self.title} ({self.duration_minutes}m) [{self.class_slug}]"

class WorkoutExercise(models.Model):
    workout = models.ForeignKey(WorkoutPlan, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey('exercises.Exercise', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)
    sets_reps = models.CharField(max_length=100, default="3 sets × 10 reps")
    xp_reward = models.PositiveIntegerField(default=45)
    completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} - {self.sets_reps} (+{self.xp_reward} XP)"
