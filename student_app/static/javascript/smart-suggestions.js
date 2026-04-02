// sidebar toggle
function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const grid = document.querySelector(".grid-container");

  sidebar.classList.toggle("sidebar-hidden");
  grid.classList.toggle("grid-full");
}

// ...............notification toggle..................

function toggleNotification() {
  document.getElementById("notificationBox")
    .classList.toggle("show");
}

// ............profile toggle..........................
function toggleProfile() {
  document.getElementById("profileDropdown")
    .classList.toggle("show");
}

// .................dark mode........................

function toggleTheme() {  
  document.body.classList.toggle("dark-mode");  

  const icon = document.getElementById("themeIcon");  

  if (document.body.classList.contains("dark-mode")) {  
    icon.textContent = "light_mode";  
    localStorage.setItem("theme", "dark");  
  } else {  
    icon.textContent = "dark_mode";  
    localStorage.setItem("theme", "light");  
  }  
}  

window.onload = () => {  
  if (localStorage.getItem("theme") === "dark") {  
    document.body.classList.add("dark-mode");  
    document.getElementById("themeIcon").textContent = "light_mode";  
  }  
};

let alarmTimeout;

function setAlarm(){
    const time = document.getElementById("alarmTime").value;

    if(!time){
        alert("Please select time");
        return;
    }

    const now = new Date();
    const alarm = new Date();

    const [hours, minutes] = time.split(":");

    alarm.setHours(hours);
    alarm.setMinutes(minutes);
    alarm.setSeconds(0);

    const diff = alarm - now;

    if(diff < 0){
        alert("Time already passed");
        return;
    }

    alarmTimeout = setTimeout(()=>{
        alert("⏰ Wake up!");
    }, diff);

  alert("Alarm Set ✅");
}