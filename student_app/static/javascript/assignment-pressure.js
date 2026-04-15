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

function openAssignmentModal() {
    var modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Semi-transparent background set karo
        if (document.body.classList.contains('dark-mode')) {
            modal.style.background = 'rgba(0, 0, 0, 0.8)';
        } else {
            modal.style.background = 'rgba(0, 0, 0, 0.5)';
        }
    }
}

function closeAssignmentModal() {
    var modal = document.getElementById('assignmentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// window.onclick = function(event) {
//     var modal = document.getElementById('assignmentModal');
//     if (event.target === modal) {
//         closeAssignmentModal();
//     }
// }


