let pollTimer = null;
let energyMode = "daily";
let energyMonth = null;

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
    const [sensor, esp2, energyLog] = await Promise.all([
      API.getToday(),
      API.getTodayEnergi(),
      API.getEnergyLog(),
    ]);
    Charts.loadHistorical(sensor, esp2);
    initEnergySection(energyLog);
  } catch (e) {}
}

function initEnergySection(rawData) {
  Charts.initEnergyData(rawData);

  const options = Helpers.extractMonthOptions(rawData);
  const select = document.getElementById("month-select");
  if (!select) return;

  options.forEach(opt => {
    const el = document.createElement("option");
    el.value = opt.key;
    el.textContent = opt.label;
    select.appendChild(el);
  });

  const now = new Date();
  const currentKey = Helpers.getMonthKey(now);
  const exists = options.some(o => o.key === currentKey);
  energyMonth = exists ? currentKey : (options[0]?.key || currentKey);
  select.value = energyMonth;

  select.addEventListener("change", () => {
    energyMonth = select.value;
    Charts.renderEnergyView(energyMonth, energyMode);
  });

  Charts.renderEnergyView(energyMonth, energyMode);
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

  document.querySelector("[data-mode-ac]")?.closest(".config-row")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mode-ac]");
    if (btn) ConfigTab.setModeAC(btn.dataset.modeAc);
  });

  document.querySelector("[data-mode-esp]")?.closest(".config-row")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-mode-esp]");
    if (btn) ConfigTab.setModeESP(btn.dataset.modeEsp);
  });

  document.querySelector("[data-capture='start']")?.addEventListener("click", ConfigTab.startCapture);
  document.querySelector("[data-capture='confirm']")?.addEventListener("click", ConfigTab.confirmCapture);
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

function loadEnergyTdl(range, button) {
  if (button) {
    document.querySelectorAll("[data-filter-energy]").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
  }
  const title = document.getElementById("title-energi-filtered");
  if (title) title.textContent = `Konsumsi Energi (${range === "daily" ? "Harian" : "Mingguan"})`;
  energyMode = range;
  if (energyMonth) {
    Charts.renderEnergyView(energyMonth, energyMode);
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
    } catch (e) {}
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
