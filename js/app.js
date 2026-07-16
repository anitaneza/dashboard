let pollTimer = null;

function init() {
  MQTTClient.connect();
  Monitoring.bindMQTT();
  ConfigTab.bindCaptureResult();

  MQTTClient.onConnectionChange((connected) => {
    const indicator = document.getElementById("mqtt-status");
    if (indicator) {
      indicator.textContent = connected ? "MQTT: Terhubung" : "MQTT: Terputus";
      indicator.style.color = connected ? "var(--success)" : "var(--danger)";
    }
  });

  Charts.initMonitoring();
  loadInitialData();
  startPolling();
  bindEvents();
}

async function loadInitialData() {
  try {
    const [sensor, esp2] = await Promise.all([
      API.getToday(),
      API.getTodayEnergi()
    ]);
    Charts.loadHistorical(sensor, esp2);
    loadEnergyTdl("daily");
  } catch (e) {
    // handled by API notification
  }
}

function bindEvents() {
  document.querySelector(".navbar")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (btn) switchTab(btn.dataset.tab);
  });

  document.querySelector("[data-filter-energy]")?.closest(".energy-tdl-toolbar")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter-energy]");
    if (btn) loadEnergyTdl(btn.dataset.filterEnergy, btn);
  });

  document.getElementById("toggle-mode-ac")?.addEventListener("change", ConfigTab.onModeACChange);
  document.getElementById("toggle-mode-esp")?.addEventListener("change", ConfigTab.onModeESPChange);

  document.querySelector("[data-ac-cmd]")?.closest(".manual-controls")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ac-cmd]");
    if (btn) ConfigTab.sendACCommand(btn.dataset.acCmd);
  });

  document.querySelector("[data-capture='start']")?.addEventListener("click", ConfigTab.startCapture);
  document.querySelector("[data-capture='confirm']")?.addEventListener("click", ConfigTab.confirmCapture);
  document.querySelector("[data-wifi='send']")?.addEventListener("click", ConfigTab.sendWifiConfig);
}

function switchTab(name) {
  document.querySelectorAll(".tab-content").forEach(el => {
    el.classList.remove("active");
    el.classList.add("hidden");
  });
  document.querySelectorAll("[data-tab]").forEach(el => el.classList.remove("active"));
  const tab = document.getElementById("tab-" + name);
  const btn = document.querySelector(`[data-tab="${name}"]`);
  if (tab) {
    tab.classList.remove("hidden");
    tab.classList.add("active");
  }
  if (btn) btn.classList.add("active");
}

async function loadEnergyTdl(range, button) {
  if (button) {
    document.querySelectorAll("[data-filter-energy]").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
  }
  const title = document.getElementById("title-energi-filtered");
  if (title) title.textContent = `Konsumsi Energi (${range === "daily" ? "Harian" : "Mingguan"})`;
  try {
    const rows = await API.getTDL(range);
    Charts.loadEnergyTdl(rows, range);
  } catch (e) {
    // handled by API notification
  }
}

function startPolling() {
  async function poll() {
    try {
      const [sensor, esp2] = await Promise.all([
        API.getToday(),
        API.getTodayEnergi()
      ]);
      Charts.loadHistorical(sensor, esp2);
    } catch (e) {
      // handled by API notification
    }
  }
  pollTimer = setInterval(poll, 60000);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(pollTimer);
    } else {
      poll();
      pollTimer = setInterval(poll, 60000);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
