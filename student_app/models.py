from django.db import models

# Create your models here.

class student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    age = models.IntegerField()
    
    def __str__(self):
        return self.name
    
class teacher(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    contact = models.IntegerField(max_length=10)
    
    def __str__(self):
        return self.name    