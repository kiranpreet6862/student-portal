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


// .........................mood slider.......................

const slider = document.getElementById("moodSlider");
const emoji = document.getElementById("emoji");

slider.addEventListener("input", function () {
    let value = parseInt(this.value);

    if (value === 0) {
        emoji.innerHTML = "😫"; // stressed
    } else if (value === 1) {
        emoji.innerHTML = "😐"; // neutral
    } else {
        emoji.innerHTML = "😄"; // great
    }
});
