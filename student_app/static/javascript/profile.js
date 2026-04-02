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

// upload button........

const fileInput = document.getElementById("fileInput");
const image = document.getElementById("image");
const icon = document.getElementById("icon");

fileInput.addEventListener("change", function(){

    const file = this.files[0];

    if(file){
        const url = URL.createObjectURL(file);

        image.src = url;

        // TOGGLE USING CLASS
        image.classList.add("show");
        image.classList.remove("hide");

        icon.classList.add("hide");
        icon.classList.remove("show");
    }
});


const removeBtn = document.querySelector(".remove-btn");

removeBtn.addEventListener("click", function(){

    // image hide
    image.classList.add("hide");

    // icon show
    icon.classList.remove("hide");

    // image src clear
    image.src = "";

    // file input reset (IMPORTANT)
    fileInput.value = "";
});