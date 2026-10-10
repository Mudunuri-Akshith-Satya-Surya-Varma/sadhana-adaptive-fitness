from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    name = models.CharField(max_length=100, default="Seeker")
    age = models.PositiveIntegerField(default=24)
    weight_kg = models.FloatField(default=72.0)
    primary_goal = models.CharField(max_length=100, default="strength")
    activity_level = models.CharField(max_length=50, default="intermediate")
    
    assigned_class = models.ForeignKey(
        'classes.SadhanaClass', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='practitioners'
    )
    
    current_xp = models.PositiveIntegerField(default=0)
    current_level = models.PositiveIntegerField(default=1)
    aura_score = models.PositiveIntegerField(default=100)
    
    equipment_access = models.JSONField(default=list, blank=True)
    limitations = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def add_xp(self, amount: int) -> dict:
        self.current_xp += amount
        self.aura_score = (self.aura_score or 100) + amount
        old_level = self.current_level
        # Each level threshold: Level 1 = 0-499, Level 2 = 500-1199, Level 3 = 1200+
        new_level = (self.current_xp // 500) + 1
        leveled_up = new_level > old_level
        self.current_level = new_level
        self.save()
        return {
            "new_xp": self.current_xp,
            "new_level": self.current_level,
            "aura_score": self.aura_score,
            "leveled_up": leveled_up
        }

    def __str__(self):
        return f"{self.name} • Lv.{self.current_level} ({self.assigned_class.name if self.assigned_class else 'Unassigned'})"
