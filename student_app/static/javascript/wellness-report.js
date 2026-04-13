 
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

  updateComboChartTheme()
}


 
// .....................bar graph..............................
// ================= THEME FUNCTION =================
function getThemeColors() {
  const isDark = document.body.classList.contains("dark-mode");

  return {
    text: isDark ? '#e2e8f0' : '#333',
    grid: isDark ? '#475569' : '#e0e0e0',
    tooltip: isDark ? 'dark' : 'light'
  };
}

// ================= CHART =================
let chart;

function renderComboChart() {

  const theme = getThemeColors();

  var options = {

    series: [
      {
        name: 'Sleep Hours',
        type: 'column',
        data: sleepData
      },
      {
        name: 'Mood Score',
        type: 'line',
        data: moodData
      }
    ],

    chart: {
      height: 250,
      type: 'line',
      toolbar: {
        show: false
      }
    },

    colors: ['#2E2E3A', '#FFA500'],

    stroke: {
      width: [0, 4],
      curve: 'smooth'

    },

    title: {
      text: 'Sleep Quality vs Mood',
      style: {
        color: theme.text
      }
    },

    dataLabels: {
      enabled: true,
      enabledOnSeries: [1]
    },

    // X AXIS
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: theme.text
        }
      }
    },

    // DUAL Y AXIS
    yaxis: [
      {
        seriesName: 'Sleep Hours',   // LEFT
        min: 0,
        max: 8,
        tickAmount: 8,
        labels: {
          style: {
            colors: theme.text
          }
        }
      },
      {
        seriesName: 'Mood Score',   // RIGHT
        opposite: true,
        min: 0,
        max: 10,
        tickAmount: 10,
        labels: {
          style: {
            colors: theme.text
          }
        }
      }
    ],

    grid: {
      borderColor: theme.grid,
      strokeDashArray: 4
    },

    tooltip: {
      theme: theme.tooltip
    },

    legend: {
      labels: {
        colors: theme.text
      }
    }
  };

  chart = new ApexCharts(document.querySelector("#card-4"), options);
  chart.render();
}



// ================= UPDATE THEME =================
function updateComboChartTheme() {

  if (!chart) return;  

  const theme = getThemeColors();

  chart.updateOptions({

    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: theme.text
        }
      }
    },

    yaxis: [
      {
        seriesName: 'Sleep Hours',
        min: 0,
        max: 8,
        tickAmount: 8,
        labels: {
          style: {
            colors: theme.text
          }
        }
      },
      {
        seriesName: 'Mood Score',
        opposite: true,
        min: 0,
        max: 10,
        tickAmount: 10,
        labels: {
          style: {
            colors: theme.text
          }
        }
      }
    ],

    title: {
      style: {
        color: theme.text
      }
    },

    grid: {
      borderColor: theme.grid
    },

    tooltip: {
      theme: theme.tooltip
    },

    legend: {
      labels: {
        colors: theme.text
      }
    }

  });
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

  renderComboChart();
  

  setTimeout(() => {
    updateComboChartTheme();
    
  }, 50);
};
