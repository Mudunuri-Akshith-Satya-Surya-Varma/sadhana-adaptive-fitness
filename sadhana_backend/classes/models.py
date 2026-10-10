from django.db import models

class SadhanaClass(models.Model):
    slug = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    sanskrit_name = models.CharField(max_length=100)
    domain = models.CharField(max_length=100)
    tagline = models.CharField(max_length=255)
    description = models.TextField()
    accent_color = models.CharField(max_length=20, default="#9b382d")
    light_color = models.CharField(max_length=20, default="#f5e4e1")
    sun_color = models.CharField(max_length=20, default="#e8b6ad")

    class Meta:
        verbose_name = "Sādhanā Class"
        verbose_name_plural = "Sādhanā Classes"

    def __str__(self):
        return f"{self.name} ({self.domain})"
