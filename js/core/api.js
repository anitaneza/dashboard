const API = (() => {
  const BASE = CONFIG.APPS_SCRIPT_URL;

  async function get(params) {
    const url = new URL(BASE);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    console.debug("[API]", url.toString());
    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      if (window.Dashboard && window.Dashboard.Notification) {
        window.Dashboard.Notification.error("Gagal load data: " + e.message);
      }
      throw e;
    }
  }

  function getToday() {
    return get({ action: "getData", sheet: "ESP1_SensorLog", range: "daily" });
  }

  function getTodayEnergi() {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range: "daily" });
  }

  function getHistorical(range) {
    return get({ action: "getData", sheet: "ESP1_SensorLog", range });
  }

  function getEnergyHistory(range) {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range });
  }

  function getTDL(range) {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range });
  }

  function getEnergyLog() {
    return get({ action: "getData", sheet: "ESP2_EnergyLog" });
  }

  return { getToday, getTodayEnergi, getHistorical, getEnergyHistory, getTDL, getEnergyLog };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.API = API;
