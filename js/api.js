const API = (() => {
  const BASE = CONFIG.APPS_SCRIPT_URL;

  async function get(params) {
    const url = new URL(BASE);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
      const res = await fetch(url.toString());
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error("API error:", err);
      return [];
    }
  }

  // Untuk grafik monitoring (tab 1) — ambil data hari ini
  function getToday() {
    return get({ action: "getData", sheet: "ESP1_SensorLog", range: "daily" });
  }

  function getTodayEnergi() {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range: "daily" });
  }

  // Untuk tab grafik — semua sheet dengan filter range
  function getESP1(range) {
    return get({ action: "getData", sheet: "ESP1_SensorLog", range });
  }

  function getESP2(range) {
    return get({ action: "getData", sheet: "ESP2_SensorLog", range });
  }

  return { getToday, getTodayEnergi, getESP1, getESP2 };
})();