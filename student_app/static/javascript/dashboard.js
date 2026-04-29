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

  
  const chartEl = document.getElementById("area-chart");

  let labels = [];
  let wellnessData = [];

  if (chartEl) {
    labels = chartEl.dataset.labels
      ? chartEl.dataset.labels.replace(/[\[\]\s]/g, '').split(',')
      : [];

    wellnessData = chartEl.dataset.values
      ? chartEl.dataset.values.replace(/[\[\]\s]/g, '').split(',').map(Number)
      : [];
  }

  console.log("Labels:", labels);
  console.log("Data:", wellnessData);
if (wellnessData.every(val => val === 0)) {
  console.log("No data available");
}
const isDark = document.body.classList.contains("dark-mode");
  //  pass data to chart
  renderAreaChart(labels, wellnessData,isDark); 
  renderDonutChart(isDark); 

  // setTimeout(() => {
  //   updateChartTheme();
  // }, 10);
};

// ...................area chart.................
function renderAreaChart(labels, wellnessData,isDark) {

  

  var areaChartOptions = {
    series: [{
      name: 'Wellness',
      data: wellnessData
    }],

    chart: {
      height: 380,
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
      categories: labels,
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#333',
          fontSize: '14px' 
        }
      }
    },

    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 10,
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#333',
          fontSize: '14px' 
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
      categories: labels,
      labels: {
        style: {
          colors: isDark ? '#e2e8f0' : '#333'
        }
      }
    },
    yaxis: {
      min: 0,
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
  document.querySelector("#donut-chart").innerHTML = "";
  renderDonutChart(isDark);

}

// ....................Donut-chart..................

function renderDonutChart(isDark) {

    var element = document.querySelector("#donut-chart");

    var pressure = parseFloat(element.getAttribute("data-pressure")) || 0;
    var remaining = 100 - pressure;

    var donutChartOptions = {
        series: [pressure, remaining],

        chart: {
            type: 'donut',
            height: 300
        },

        labels: ['Pressure', 'Remaining'],

        colors: ['#ff5c73', 'rgb(99, 102, 241)'],

        plotOptions: {
            pie: {
                donut: {
                    size: '60%',
                    labels: {
                        show: true,

                        value: {
                            fontSize: '25px',
                            color: isDark ? '#fff' : '#000'
                        },

                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '25px',
                            color: isDark ? '#e2e8f0' : '#333',

                            formatter: function () {
                                return pressure + '%';
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

    var donutChart = new ApexCharts(element, donutChartOptions);
    donutChart.render();
}


