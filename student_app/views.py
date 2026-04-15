from urllib import request
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.contrib.auth import authenticate, login
from .models import WellnessCheckin,Assignment,FocusData,WellnessReport,settings
from datetime import datetime,timedelta,date
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.utils.timezone import now
from collections import Counter
from django.db.models import Sum
from django.utils import timezone


# Create your views here.
# REGISTER.......

def register(request):
    if request.method == "POST":

        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        age = request.POST.get('age')
        mobile_number = request.POST.get('mobile_number')
        location = request.POST.get('location')

        if not username or not email or not password or not age or not mobile_number or not location:
            return render(request, 'register.html', {'error': 'All fields are required'})

        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Username already exists'})

        if User.objects.filter(email=email).exists():
            return render(request, 'register.html', {'error': 'Email already exists'})

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password   
        )      

        return redirect('login')

    return render(request, 'register.html')

# LOGIN......

def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)   
            return redirect('dashboard')   
        else:
            return render(request, 'login.html', {'error': 'Invalid username or password'})

    return render(request, 'login.html')

# LOGOUT..........
def logout_view(request):
    logout(request)   
    return redirect('login')

# DASHBOARD......
@login_required 
def dashboard(request):
    obj = WellnessCheckin.objects.filter(user=request.user).last()  # latest entry
    wellness_score = 0 
    # WELLNESS SCORE
    if obj:
        sleep = obj.sleep_hours or 0
        study = obj.study_hours or 0
        workload = obj.workload or 0
        
        vv = (sleep * 0.4) + (study * 0.3) - (int(workload) * 0.3)   
        max_score = 6.7   
        wellness_score = round((vv / max_score) * 100,1) 
    else:
        wellness_score = 0
        study = 0     
    # ASSIGNMENTS
    assignments = Assignment.objects.filter(user=request.user)
    total_assignments = assignments.count()

    # BURNOUT
    total_minutes = sum((task.estimated_time or 0) for task in assignments)
    MAX_WEEKLY_MINUTES = 2400 
    capacity = (total_minutes / MAX_WEEKLY_MINUTES) * 100
    capacity = min(round(capacity, 1), 100)
    
    # ACADEMIC PRESSURE
    pressure_score = (capacity * 0.4) + ((100 - wellness_score) * 0.6)
    pressure_score = max(0, min(round(pressure_score, 1), 100))
    
    if pressure_score < 40:
        pressure_label = "Low Pressure"
    elif pressure_score < 70:
        pressure_label = "Moderate Pressure"
    else:
        pressure_label = "High Pressure"
    
    if pressure_score < 40:
        burnout = "Low"
    elif pressure_score < 70:
        burnout = "Medium"
    else:
        burnout = "High"
          
    
    # Weekly wellness trend.......
     # last 7 days ka data
    today = date.today()
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    labels = []
    wellness_scores = []
    max_score = 6.7
    for day in last_7_days:
        labels.append(day.strftime("%a"))

        obj = WellnessCheckin.objects.filter(
            user=request.user,
            created_at__date=day
        ).order_by('-created_at').first()   # ✅ latest entry

        if obj and obj.wellness_score is not None:
            
            score = round((obj.wellness_score / max_score) * 100, 1)
            
        else:
            score = 0

        wellness_scores.append(score)

    context = {
        "labels": ",".join(labels),  #  dynamic string
        "wellness_scores": ",".join(str(x) for x in wellness_scores), # dynamic values
    }
    
     
    
    return render(request,"dashboard.html", {
    'wellness_score': wellness_score,
    'study_hours': study,
    "total_assignments": total_assignments,
    "capacity":capacity,
    "burnout": burnout,
    "pressure_score": pressure_score,
    "pressure_label":pressure_label,
    "context": context,
})   

# CHECK-IN........WELLNESS SCORE............
@login_required 
def checkin(request):
    if request.method == "POST":
        sleep = float(request.POST.get('sleep', 0))
        study = float(request.POST.get('study', 0))
        workload = int(request.POST.get('workload', 0))
        mood = int(request.POST.get('mood', 2))

        obj = WellnessCheckin.objects.create(
            user=request.user,
            sleep_hours=sleep,
            study_hours=study,
            workload=workload,
            mood=mood
        )

        return render(request, "check-in.html", {
            "score": round(obj.get_percentage(),1),
            "suggestions": obj.get_suggestions()
        })

    return render(request, "check-in.html")

# ASSIGNMENT PRESSURE..........
@login_required 
def assignmentPressure(request):
    
    #  DELETE OVERDUE ASSIGNMENTS 
    today = date.today()
    overdue_assignments = Assignment.objects.filter(
        user=request.user,
        due_date__lt=today, 
        is_completed=False
    )
    overdue_assignments.delete()
    
    # Delete
    if request.method == "POST" and 'complete_assignment_id' in request.POST:
        assignment_id = request.POST.get('complete_assignment_id')
        try:
            assignment = Assignment.objects.get(id=assignment_id, user=request.user)
            assignment.is_completed = True
            assignment.save()
            messages.success(request, f"✅ '{assignment.title}' completed!")
        except Assignment.DoesNotExist:
            messages.error(request, "Assignment not found!")
        return redirect('assignment-pressure')
    
    # Get only INCOMPLETE assignments (excluding completed ones)
    assignments = Assignment.objects.filter(
        user=request.user, 
        is_completed=False  #Only show incomplete assignments
    ).order_by('due_date')
    
    
    # assignments = Assignment.objects.filter(user=request.user)
    # today = date.today()
    # Monday 
    start_week = today - timedelta(days=today.weekday())
    # Sunday
    end_week = start_week + timedelta(days=6)
    #   week  assignments
    weekly_tasks = assignments.filter(
        due_date__range=[start_week, end_week]
    )   

    #WEEKLY WORKLOAD
    total_minutes = sum((task.estimated_time or 0) for task in weekly_tasks)
    MAX_WEEKLY_MINUTES = 2400 
    capacity = (total_minutes / MAX_WEEKLY_MINUTES) * 100
    capacity = min(round(capacity, 1), 100)
    
    completed_assignments = Assignment.objects.filter(
        user=request.user,
        is_completed=True
    ).order_by('-due_date')[:5]  
    
    # ADD ASSIGNMENT# ---------------- POST ---------------- #
    if request.method == "POST":

        subject = request.POST.get('subject')
        title = request.POST.get('title')
        due_date_str = request.POST.get('due_date')
        due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()

        time = int(request.POST.get('time', 0))
        difficulty = int(request.POST.get('difficulty', 1))

        obj = Assignment.objects.create(
            user=request.user,
            subject=subject,
            title=title,
            due_date=due_date,
            estimated_time=time,
            difficulty=difficulty,
            is_completed=False         
        )      
        messages.success(request, f"✅ '{title}' added successfully!")
        return redirect('assignment-pressure')
                 
        # return render(request, "assignment-pressure.html",{
        #     "assignments": assignments,
        #     "pressure": obj.pressure_level,
        #     "show_modal": True,
        #     "subject":subject,
        #     "difficulty":difficulty,
        #     "title":title,
        #     "due_date":due_date,
        #     "estimated_time":time,
        #     "capacity": capacity                    
        # })
        

    return render(request, "assignment-pressure.html",{"assignments": assignments,"capacity": capacity,"today": today,"completed_assignments": completed_assignments,  })

@login_required    
def focusAnalytics(request):

    today = date.today()

    # ---------------- POST (HANDLE BOTH TIMER + DISTRACTION) ---------------- #
    if request.method == "POST":

        #  1. TIMER DATA HANDLE 
        if "duration" in request.POST:

            duration = int(request.POST.get("duration", 0))

            obj, created = FocusData.objects.get_or_create(
                user=request.user,
                date=today
            )

            obj.duration += duration   #  IMPORTANT 
            obj.save()

            return redirect('focus-analytics')


        #  2. DISTRACTION SAVE
        phone = int(request.POST.get('phone', 0))
        social = int(request.POST.get('social', 0))
        daydreaming = int(request.POST.get('daydreaming', 0))
        other = int(request.POST.get('other', 0))

        obj, created = FocusData.objects.get_or_create(
            user=request.user,
            date=today
        )

        obj.phone_usage = phone
        obj.social_media = social
        obj.daydreaming = daydreaming
        obj.other = other
        obj.save()

        return redirect('focus-analytics')


    # ---------------- GET TODAY DATA ---------------- #

    obj = FocusData.objects.filter(
        user=request.user,
        date=today
    ).first()

    if obj:
        focus_time = obj.duration or 0   # minutes

        distraction = (
            obj.phone_usage +
            obj.social_media +
            obj.daydreaming +
            obj.other
        )
    else:
        focus_time = 0
        distraction = 0


    # ---------------- WELLNESS DATA ---------------- #

    wellness = WellnessCheckin.objects.filter(
        user=request.user,
        created_at__date=today
    ).first()

    if wellness:
        study_time = (wellness.study_hours or 0) * 60   # hours → minutes
    else:
        study_time = 0


    # ---------------- FINAL CALCULATIONS ---------------- #

    total_active = focus_time + study_time + distraction

    if total_active == 0:
        study_balance = 0
    else:
        study_balance = round(
            (focus_time + study_time) / total_active, 2
        )


    # ---------------- WEEKLY GRAPH DATA ---------------- #

    week_data = []
    week_labels = []

    for i in range(7):
        day = today - timedelta(days=6 - i)

        obj = FocusData.objects.filter(
            user=request.user,
            date=day
        ).first()

        if obj:
            hours = round((obj.duration or 0) / 60, 2)  # minutes → hours
            week_data.append(hours)
        else:
            week_data.append(0)
        
        week_labels.append(day.strftime("%a")) 
            
            
    # ---------------- PIE CHART DATA ---------------- #
    today_obj = FocusData.objects.filter(
        user=request.user,
        date=today
    ).first()

    if today_obj:
        pie_data = [
            today_obj.phone_usage,
            today_obj.social_media,
            today_obj.daydreaming,
            today_obj.other
        ]
        if sum(pie_data) == 0:
            pie_data = [1, 1, 1, 1]

    else:
        pie_data = [1, 1, 1, 1]
    
    # ---------------- INSIGHTS CALCULATION ---------------- #
    today = date.today() 
    start_date = today - timedelta(days=6)

    #  Days with data (distinct days count)
    days_with_data = FocusData.objects.filter(
        user=request.user,
        date__range=(start_date, today)
    ).values('date').distinct().count()


    #  Total minutes
    total_minutes = FocusData.objects.filter(
        user=request.user,
        date__range=(start_date, today)
    ).aggregate(total=Sum('duration'))['total'] or 0
            

    # Consistency
    consistency_score = round((days_with_data / 7) * 100, 1)

    # Deep Work
    deep_work_hours = round(total_minutes / 60, 2)

    # Best Time
    

    focus_data = FocusData.objects.filter(user=request.user)

    hour_list = []

    for obj in focus_data:
        if obj.created_at:
            hour = obj.created_at.hour   # e.g. 10, 14
            hour_list.append(hour)

    if hour_list:
        most_common_hour = Counter(hour_list).most_common(1)[0][0]

        # Convert to readable format
        if most_common_hour < 12:
            best_time = f"{most_common_hour}:00 AM"
        elif most_common_hour == 12:
            best_time = "12:00 PM"
        else:
            best_time = f"{most_common_hour-12}:00 PM"
    else:
        best_time = "Not enough data"
        
    latest_obj = FocusData.objects.filter(user=request.user).order_by('-id').first()

    if latest_obj:
        latest_obj.consistency_score = consistency_score
        latest_obj.deep_work_hours = deep_work_hours
        latest_obj.best_time = best_time
        latest_obj.save()

    # ---------------- SEND TO TEMPLATE ---------------- #

    return render(request, "focus-analytics.html", {
        "focus_time": round(focus_time / 60, 2),   # show in hours
        "study_time": round(study_time / 60, 2),
        "distraction": distraction,
        "total_active": round(total_active / 60, 2),
        "study_balance": study_balance,
        "week_data": week_data,
        "pie_data": pie_data,
        "week_labels": week_labels,
        "consistency_score": consistency_score,
        "deep_work_hours": deep_work_hours,
        "best_time": best_time,
        
    })

##### WELLNESS REPORT
@login_required 
def wellnessReport(request):
    
    today = now().date()

    obj = WellnessCheckin.objects.filter(
        user=request.user,
        created_at__date=today
    ).order_by('-created_at').first()
    if not obj:
        obj = WellnessCheckin.objects.filter(
            user=request.user
        ).order_by('-created_at').first()

    if obj:
        sleep = obj.sleep_hours or 0
        mood = obj.mood or 0   # correct field

        # Sleep Score
        if sleep < 3:
            sleep_score = 30
        elif sleep < 6:
            sleep_score = 60
        else:
            sleep_score = 90   # thoda improve kiya

        # Mood Score
        if mood == 1:
            mood_score = 30
        elif mood == 2:
            mood_score = 60
        else:
            mood_score = 90

   
        recovery_score = round(
            (sleep_score * 0.6) + (mood_score * 0.4), 1
        )

    else:
        recovery_score = 0
        
    # Workload impact 
    
     # ---------------- WELLNESS SCORE ---------------- #
    today = date.today()

    wellness = WellnessCheckin.objects.filter(
        user=request.user,
        created_at__date=today
    ).first()
    if wellness:
        study = wellness.study_hours or 0
        workload = wellness.workload or 0
        sleep = wellness.sleep_hours or 0

        vv = (sleep * 0.4) + (study * 0.3) - (workload * 0.3)
        max_score = 6.7

        wellness_score = round((vv / max_score) * 100, 1)
    else:
        wellness_score = 0


    # ---------------- WORKLOAD CAPACITY ---------------- #
    assignments = Assignment.objects.filter(user=request.user)

    total_minutes = sum((task.estimated_time or 0) for task in assignments)

    MAX_WEEKLY_MINUTES = 2400
    capacity = (total_minutes / MAX_WEEKLY_MINUTES) * 100
    capacity = min(round(capacity, 1), 100)


    # ---------------- WORKLOAD IMPACT (FIXED) ---------------- #
    workload_impact = round(
        (capacity * 0.6) + ((100 - wellness_score) * 0.4), 1
    ) 
    
  
    # ---------------- STUDY BALANCE (FIXED) ---------------- #

    today = date.today()
    # Focus Data (today)
    focus_obj = FocusData.objects.filter(
        user=request.user,
        date=today
    ).first()

    if focus_obj:
        focus_time = focus_obj.duration or 0   # minutes

        distraction = (
            focus_obj.phone_usage +
            focus_obj.social_media +
            focus_obj.daydreaming +
            focus_obj.other
        )
    else:
        focus_time = 0
        distraction = 0

    # Study Data (today)
    wellness = WellnessCheckin.objects.filter(
        user=request.user,
        created_at__date=today
    ).first()

    if wellness:
        study_time = (wellness.study_hours or 0) * 60   # convert to minutes
    else:
        study_time = 0

    # FINAL CALCULATION
    total_active = focus_time + study_time + distraction

    if total_active == 0:
        study_balance = 0
    else:
        study_balance = round(
            ((focus_time + study_time) / total_active) * 100, 1
    )

    # ---------------- WEEKLY SLEEP + MOOD DATA ---------------- #

    sleep_data = []
    mood_data = []
    labels=[]

    for i in range(7):
        day = today - timedelta(days=6 - i)
        labels.append(day.strftime("%a"))
                       

        obj = WellnessCheckin.objects.filter(
            user=request.user,
            created_at__date=day
        ).order_by('-created_at').first()   #  loop ke andar

        if obj:
            sleep_data.append(obj.sleep_hours or 0)
            mood_data.append((obj.mood or 0) * 3)
            
        else:
            sleep_data.append(0)
            mood_data.append(0)
    
    report, created = WellnessReport.objects.get_or_create(
        user=request.user,
        date=today   
    )

    report.recovery_score = recovery_score
    report.study_balance = study_balance
    report.workload_impact = workload_impact

    report.save()
    return render(request,"wellness-report.html",{
        "recovery_score":recovery_score,
        "workload_impact":workload_impact,
        "study_balance":study_balance,
        "sleep_data": sleep_data,
        "mood_data": mood_data,
        "labels": labels
    })
    
@login_required 
def smartSuggestions(request):
    return render(request,"smart-suggestions.html")

@login_required 
def startBreathing(request):
    return render(request,"start-breathing.html")

@login_required 
def  tasks(request):
    return render(request,"tasks.html")

@login_required
def profile(request):
    profile, created = settings.objects.get_or_create(user=request.user)

    return render(request, "profile.html", {"profile": profile})

@login_required 
def settings_view(request):
    profile, created = settings.objects.get_or_create(user=request.user)

    if request.method == "POST":

        # 🔹 PROFILE UPDATE
        if "update_profile" in request.POST:
            user = request.user

            username = request.POST.get("username")
            email = request.POST.get("email")
            age = request.POST.get("age")
            mobile = request.POST.get("mobile")
            location = request.POST.get("location")

            # #  Empty validation
            # if not username or not email or not age or not mobile or not location:
            #     return render(request, "settings.html", {
            #         "profile": profile,
            #         "error": "All fields are required ⚠️"
            #     })

            #  Save data
            user.username = username
            user.email = email
            user.save()

            profile.age = age
            profile.mobile = mobile
            profile.location = location

            if request.FILES.get("profile_pic"):
                profile.profile_pic = request.FILES.get("profile_pic")

            profile.save()

            return render(request, "settings.html", {
                "profile": profile,
                "success": "Profile Updated Successfully ✅"
            })

        # 🔹 PASSWORD CHANGE
        elif request.POST.get("change_password") == "1":
            new = request.POST.get("new_password", "").strip()
            confirm = request.POST.get("confirm_password", "").strip()
            
            if new == "" and confirm == "":
                return render(request, "settings.html", {
                "profile": profile
            })
            if not new or not confirm:
                return render(request, "settings.html", {
                    "profile": profile,
                    "error": "Please fill both password fields ⚠️"
                })

            elif new != confirm:
                return render(request, "settings.html", {
                    "profile": profile,
                    "error": "Passwords do not match ❌"
                })

            else:
                user = request.user
                user.set_password(new)
                user.save()
                update_session_auth_hash(request, user)

                return render(request, "settings.html", {
                    "profile": profile,
                    "success": "Password Updated Successfully 🔐"
                })

    return render(request, "settings.html", {"profile": profile})






