const API = (() => {
  async function fetchData(params = {}) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
      const res = await fetch(url.toString());
      return await res.json();
    } catch (err) {
      console.error("API fetch error:", err);
      return [];
    }
  }

  async function getToday() {
    return fetchData({ range: "today" });
  }

  async function getLast(n) {
    return fetchData({ n });
  }

  async function getRange(range) {
    return fetchData({ range });
  }

  async function getMonthly() {
    return fetchData({ type: "monthly" });
  }

  return { getToday, getLast, getRange, getMonthly };
})();