from django.db import models

class Exercise(models.Model):
    name = models.CharField(max_length=150, unique=True)
    class_slug = models.CharField(max_length=50, db_index=True, help_text="e.g. yodha, vistara, sthira, dhruva, samanvaya")
    category = models.CharField(max_length=50, default="strength")
    target_muscle = models.CharField(max_length=100)
    equipment = models.CharField(max_length=100, default="bodyweight")
    difficulty = models.CharField(max_length=50, default="intermediate")
    force = models.CharField(max_length=30, blank=True, default="")
    mechanic = models.CharField(max_length=30, blank=True, default="")
    image_url_0 = models.URLField(max_length=500, blank=True, default="")
    image_url_1 = models.URLField(max_length=500, blank=True, default="")
    base_xp = models.PositiveIntegerField(default=45)
    default_sets = models.CharField(max_length=50, default="3 sets × 10 reps")
    instructions = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} [{self.class_slug}] (+{self.base_xp} XP)"
