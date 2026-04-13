from django.contrib import admin
from .models import FocusData, WellnessCheckin, Assignment, WellnessReport, settings

admin.site.register(FocusData)
admin.site.register(WellnessCheckin)
admin.site.register(Assignment)
admin.site.register(WellnessReport)
admin.site.register(settings)


