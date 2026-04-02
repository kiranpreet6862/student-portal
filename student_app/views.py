from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.contrib.auth import authenticate, login

# Create your views here.


def register(request):
    if request.method == "POST":

        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        if not username or not email or not password:
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

def logout_view(request):
    logout(request)   
    return redirect('login')



def dashboard(request):
    return render(request,"dashboard.html")

def checkin (request):
    return render(request,"check-in.html")

def assignmentPressure (request):
    return render(request,"assignment-pressure.html")

def focusAnalytics(request):
    return render(request,"focus-Analytics.html")

def wellnessReport(request):
    return render(request,"wellness-report.html")

def smartSuggestions(request):
    return render(request,"smart-suggestions.html")

def startBreathing(request):
    return render(request,"start-breathing.html")

def  tasks(request):
    return render(request,"tasks.html")

def  profile(request):
    return render(request,"profile.html")

def  settings(request):
    return render(request,"settings.html")



