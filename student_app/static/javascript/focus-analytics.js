
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

  updateBarChartTheme();
  updatePieChartTheme();
}



// ....................stopwatch..............................

const timeDisplay = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resettBtn = document.getElementById("resetBtn");

let startTimer = 0;
let elapsedTime = 0;
let currentTime = 0;
let paused = true;
let intervalId;
let hrs = 0;
let mins = 0;
let secs = 0;

startBtn.addEventListener("click", () => {
    if(paused){
        paused = false;
        startTimer = Date.now() - elapsedTime;
        intervalId = setInterval(updateTime,75);
    }
});


document.addEventListener("DOMContentLoaded", function() {

    const stopBtn = document.getElementById("stopBtn");

    stopBtn.addEventListener("click", () => {
        console.log("STOP CLICKED ");   // test

        if(!paused){
            paused = true;
            elapsedTime = Date.now() - startTimer;
            clearInterval(intervalId);

            let minutes = Math.ceil(elapsedTime / (1000 * 60));

            console.log("Minutes:", minutes);

            document.getElementById("durationInput").value = minutes;
            document.getElementById("focusForm").submit();
        }
    });

});

resetBtn.addEventListener("click", () => {
    paused = true;  
    clearInterval(intervalId);
    startTimer = 0;
    elapsedTime = 0;
    currentTime = 0;
    hrs = 0;
    mins = 0;
    secs = 0;
    timeDisplay.textContent = "00:00:00"
});

function updateTime(){
    elapsedTime = Date.now() - startTimer;
    secs = Math.floor((elapsedTime / 1000) % 60);
    mins = Math.floor((elapsedTime / (1000*60)) % 60);
    hrs = Math.floor((elapsedTime / (1000*60*60)) % 60);

    secs = pad (secs);
    mins = pad (mins);
    hrs = pad (hrs);

    timeDisplay.textContent = `${hrs}:${mins}:${secs}`;

    function pad(unit){
        return (("0") + unit).length > 2 ? unit : "0" + unit;

    }

}

// ..................................bar graph...................................
let barChart;
function renderBarChart(){
const isDark = document.body.classList.contains("dark-mode");
var options = {
  chart: {
    type: 'bar',
    height: 180,
    toolbar: {
      show: false
    }
  },

  colors: ['#6C63FF'], 

  series: [{
    name: "Hours Focused",
    data: weeklyData
  }],

  xaxis: {
    categories: weekLabels,
    labels: {
      style: {
        colors: isDark ? '#e2e8f0' : '#333'
      }
    }
  },

  yaxis: {
    min: 0,
    max: 4,
    tickAmount: 8,
    labels: {  
      style: {
        colors: isDark ? '#e2e8f0' : '#333'
      }
    },
    title: {
      text: "Hours",
      horizontalAlign:"center",
      style: {
        color: isDark ? '#e2e8f0' : '#333'
      }
    }
  },

  grid: {
    borderColor: isDark ? '#475569' : '#e0e0e0'
  },

  title: {
    text: "Daily Focus Hours",
    style: {   
      color: isDark ? '#e2e8f0' : '#000'
    }
  },

  tooltip: {
    theme: isDark ? 'dark' : 'light'
  },

  plotOptions: {  
    bar: {
      borderRadius: 10,
      borderRadiusApplication: 'end'
    }
  }
};

barChart = new ApexCharts(document.querySelector("#bar-graph"), options);
barChart.render();
}


// ...........................update function..................

function updateBarChartTheme() {
  const isDark = document.body.classList.contains("dark-mode");

  barChart.updateOptions({
    xaxis: {
      categories:weekLabels ,
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
      },
      title: {
        text: "Hours", 
        style: {
          color: isDark ? '#e2e8f0' : '#333'
        }
      }
    },
    grid: {
      borderColor: isDark ? '#475569' : '#e0e0e0'
    },
    title: {
      
      style: {
        color: isDark ? '#e2e8f0' : '#000'
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light'
    }
  });
}


// .........................pie chart.........................

let pieChart;
function renderPieChart() {
  const isDark = document.body.classList.contains("dark-mode");
var options = {
  series: pieData,

  chart: {
    height:200,
    
    type: 'pie'
  },

  labels: ['Phone', 'Social Media', 'Daydreaming', 'Others'],

  colors: ['#FF5C7A', '#FFC107', '#4CAF50', '#2E2E3A'],

  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '10px',
    labels: {
      colors: '#333'
    }
  },

  dataLabels: {
    enabled: false
  },

  stroke: {
    show: false   
  },

  tooltip: {
    y: {
      formatter: function(val) {
        return val + "min";
      }
    }
  },

  plotOptions: {
    pie: {
      expandOnClick: false   
    }
  },
  title: {
    text: "Distraction Breakdown"
  },

  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
};

pieChart = new ApexCharts(document.querySelector("#pie-chart"), options);
pieChart.render();
}
      
      
    

function updatePieChartTheme() {
  const isDark = document.body.classList.contains("dark-mode");

  pieChart.updateOptions({
    legend: {
      labels: {
        colors: isDark ? '#e2e8f0' : '#333'
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light'
    },
    title: {
      style: {
        color: isDark ? '#e2e8f0' : '#000'
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

  renderBarChart();
  renderPieChart();

  setTimeout(() => {
    updateBarChartTheme();
    updatePieChartTheme();
  }, 50);
};

function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}
function updateValue(slider, id) {
  document.getElementById(id).innerText = slider.value + " min";
}