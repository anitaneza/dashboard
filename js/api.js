const API = (() => {
  const BASE = CONFIG.APPS_SCRIPT_URL;

  async function get(params) {
    const url = new URL(BASE);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    
    try {
      console.log("API request:", url.toString());
      const res = await fetch(url.toString());
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error("API error:", err);
      return [];
    }
  }

  // Tab monitoring — data hari ini
  function getToday() {
    return get({ action: "getData", sheet: "ESP1_SensorLog", range: "daily" });
  }

  function getCop(bulan) {
    return get({ action: "getCOP", sheet: "ESP2_SensorLog", bulan: bulan });
  }

  function getTodayEnergi() {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range: "daily" });
  }

  // Tab grafik — dengan filter range
  function getESP1(range) {
    return get({ action: "getData", sheet: "ESP1_SensorLog", range });
  }

  function getESP2(range) {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range });
  }

  // Energi bulanan
  function getMonthly() {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range: "monthly" });
  }

  return { getToday, getTodayEnergi, getESP1, getESP2, getMonthly, getCop };
})();