async function init() {
  // Koneksi MQTT
  MQTTClient.connect();

  // Bind semua handler MQTT
  Monitoring.bindMQTT();
  bindCaptureResult();

  // Load data historis untuk grafik monitoring
  const todayData = await API.getToday();
  Charts.loadHistorical(todayData);

  // Load grafik tab grafik (lazy, hanya saat tab dibuka)
}

function switchTab(name) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(el => el.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  event.target.classList.add("active");

  // Load grafik saat pertama kali tab grafik dibuka
  if (name === "grafik") {
    Grafik.load("today");
  }
}

// Polling setiap 1 menit untuk update grafik monitoring
setInterval(async () => {
  const todayData = await API.getToday();
  Charts.loadHistorical(todayData);
}, 60000);

init();