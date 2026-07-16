async function init() {
  // Koneksi MQTT
  MQTTClient.connect();

  // Bind semua handler MQTT
  Monitoring.bindMQTT();
  bindCaptureResult();

  // Load data historis untuk grafik monitoring
  const [sensor, esp2] = await Promise.all([
    API.getToday(),
    API.getTodayEnergi()
  ]);
  Charts.loadHistorical(sensor, esp2);
  loadEnergyTdl("daily");
}

let grafikLoaded = false;

function switchTab(name) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(el => el.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  event.target.classList.add("active");

  // Load grafik pertama kali tab grafik dibuka
  if (name === "grafik" && !grafikLoaded) {
    grafikLoaded = true;
    loadGrafikTab("daily");
  }
}

// Polling setiap 1 menit untuk update grafik monitoring
setInterval(async () => {
  const [sensor, esp2] = await Promise.all([
    API.getToday(),
    API.getTodayEnergi()
  ]);
  Charts.loadHistorical(sensor, esp2);
}, 60000);

let energyTdlRange = "daily";

async function loadEnergyTdl(range) {
  const rows = await API.getESP2(range);
  Charts.loadEnergyTdl(rows, range);
}

function setEnergyTdlFilter(range, button) {
  energyTdlRange = range;
  document.querySelectorAll(".period-filter-btn").forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");
  document.getElementById("title-energi-filtered").textContent =
    `Konsumsi Energi (${range === "daily" ? "Harian" : "Mingguan"})`;
  loadEnergyTdl(range);
}

init();
