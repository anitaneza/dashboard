const Grafik = (() => {
  let currentFilter = "today";

  async function load(filter) {
    currentFilter = filter;
    const rows = await API.getRange(filter);
    Charts.loadGrafik(rows);
    const monthly = await API.getMonthly();
    Charts.loadMonthly(monthly);
  }

  return { load };
})();

function setFilter(range, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  Grafik.load(range);
}

async function loadGrafikTab(range) {
  const [sensor, esp2] = await Promise.all([
    API.getESP1(range),
    API.getESP2(range)
  ]);
  Charts.loadGrafik(sensor, esp2);
}

function setFilter(range, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadGrafikTab(range === "today" ? "daily" : range === "7d" ? "weekly" : "monthly");
}