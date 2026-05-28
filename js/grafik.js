const Grafik = (() => {
  let currentFilter = "today";

  async function load(filter) {
    currentFilter = filter;
    const rows = await API.getRange(filter);
    Charts.loadGrafik(rows);
    const monthly = await API.getMonthly();
    Charts.loadMonthly(monthly);
  }
  
  async function loadGrafikTab(range) {
  const [sensor, esp2] = await Promise.all([
    API.getESP1(range),
    API.getESP2(range)
  ]);
  Charts.loadGrafik(sensor, esp2);
  }

  return { load };
})();

function setFilter(range, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadGrafikTab(range === "today" ? "daily" : range === "7d" ? "weekly" : "monthly");
  Grafik.load(range);
}

