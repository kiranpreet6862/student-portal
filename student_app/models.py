from django.db import models
from django.contrib.auth.models import User
from datetime import date  
from django.db.models.signals import post_save
from django.dispatch import receiver


#table 1
class WellnessCheckin(models.Model):
    WORKLOAD_CHOICES = [
        (1, 'Low'),
        (2, 'Moderate'),
        (3, 'High'),
    ]

    MOOD_CHOICES = [
        (1, 'Stressed'),
        (2, 'Neutral'),
        (3, 'Great'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    mood = models.IntegerField(choices=MOOD_CHOICES) 
    workload = models.IntegerField(choices=WORKLOAD_CHOICES)
    sleep_hours = models.FloatField()
    study_hours = models.FloatField()
    wellness_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_wellness(self):
        sleep = self.sleep_hours or 0
        study = self.study_hours or 0
        workload = self.workload or 0

        return (sleep * 0.4) + (study * 0.3) - (workload * 0.3)
    
    def get_percentage(self):
        max_score = 6.7   
        return (self.wellness_score / max_score) * 100
    
    def get_suggestions(self):
        suggestions = []

        if self.sleep_hours < 7:
            suggestions.append("😴 Your sleep is low. Try to get at least 7–8 hours of rest.")

        if self.study_hours < 3:
            suggestions.append("📚 Increase your study time for better productivity.")

        if self.workload == 3:
            suggestions.append("⚡ Your workload is high. Consider taking short breaks.")

        if self.mood == 1:
            suggestions.append("😔 You seem stressed. Try relaxation techniques or take a break.")

        if not suggestions:
            suggestions.append("🎉 Great job! You are maintaining a healthy routine.")

        return suggestions
    

    def save(self, *args, **kwargs):
        self.wellness_score = self.calculate_wellness()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.date()}"
    
# table 2
class Assignment(models.Model):
    DIFFICULTY_CHOICES = [
        (1, 'Easy'),
        (2, 'Medium'),
        (3, 'Hard'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    subject = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    due_date = models.DateField()
    estimated_time = models.IntegerField()  # minutes
    difficulty = models.IntegerField(choices=DIFFICULTY_CHOICES)
    pressure_level = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    weekly_capacity = models.FloatField(blank=True, null=True)
    
    def calculate_pressure(self):  
        days_left = (self.due_date - date.today()).days  
        if days_left <= 0:  
            return 100  # urgent  
        raw_pressure = (self.difficulty * self.estimated_time) / days_left         
        max_pressure = 300   # assume max value
        percentage = (raw_pressure / max_pressure) * 100
        return round(min(percentage, 100), 1) 
    
    
    def save(self, *args, **kwargs):
        self.pressure_level = self.calculate_pressure()       
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.subject}" 

    
# table 4

class FocusData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    # Focus
    duration = models.IntegerField(default=0)  # focus time (minutes)
    # Distractions
    phone_usage = models.IntegerField(default=0)
    social_media = models.IntegerField(default=0)
    daydreaming = models.IntegerField(default=0)
    other = models.IntegerField(default=0)
    # Insights 
    consistency_score = models.FloatField(blank=True, null=True)
    deep_work_hours = models.FloatField(blank=True, null=True)
    best_time = models.CharField(max_length=50, blank=True, null=True)
    

    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        super().save(*args,**kwargs)
        
    def __str__(self):
        return f"{self.user.username} - {self.date}"
    
# table 5
class WellnessReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    recovery_score = models.FloatField(blank=True, null=True)
    study_balance = models.FloatField(blank=True, null=True)
    workload_impact = models.FloatField(blank=True, null=True)
    avg_sleep = models.FloatField(blank=True, null=True)
    avg_mood = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)       
    
    def __str__(self):
        return f"{self.user.username} - Wellness Report ({self.date})"
    
# table 5

class settings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField(null=True, blank=True)
    mobile = models.CharField(max_length=15, blank=True)
    location = models.CharField(max_length=100, blank=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", default="profile_pics/default.png")

    def __str__(self):
        return self.user.username
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        settings.objects.create(user=instance)