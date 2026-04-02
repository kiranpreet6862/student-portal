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

// .....................dark/light mode........................

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
  updateChartTheme();   
}  

window.onload = () => {  
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {  
    document.body.classList.remove("dark-mode");  
    document.getElementById("themeIcon").textContent = "dark_mode";
  } else {  
    document.body.classList.add("dark-mode");  
    document.getElementById("themeIcon").textContent = "light_mode";
  }

  renderAreaChart(); 
  renderDonutChart(); 

  setTimeout(() => {
    updateChartTheme();
  }, 10);
};

// ...................area chart.................
function renderAreaChart() {

  const isDark = document.body.classList.contains("dark-mode");

  var areaChartOptions = {
    series: [{
      name: 'Wellness',
      data: [65, 70, 68, 72, 75, 78, 78]
    }],

    chart: {
      height: 250,
      type: 'area',
      toolbar: { show: false }
    },

    colors: ["#6366f1"],

    dataLabels: { enabled: false },

    stroke: {
      curve: 'smooth',
      width: 3
    },

    xaxis: {
      categories: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#333'
        }
      }
    },

    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#333'
        }
      }
    },

    grid: {
      borderColor: isDark ? '#475569' : '#e0e0e0'
    }
  };

  areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
  areaChart.render();
}
// ...................update function......................

function updateChartTheme() {
  if (!areaChart) return;

  const isDark = document.body.classList.contains("dark-mode");

  areaChart.updateOptions({
    xaxis: {
      categories: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#333'
        }
      }
    },
    yaxis: {
      min: 40,
      max: 100,
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#333'
        }
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light'  
    }
  });
}

// ....................Donut-chart..................

function renderDonutChart() {

  var donutChartOptions = {
    series: [72, 28],

    chart: {
      type: 'donut',
      height: 150
    },

    labels: ['Pressure', 'Remaining'],

    colors: ['#ff5c73', 'rgb(99, 102, 241)'],

    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              formatter: function () {
                return '72%';
              }
            }
          }
        }
      }
    },

    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 }
  };

  var donutChart = new ApexCharts(document.querySelector("#donut-chart"), donutChartOptions);
  donutChart.render();
}