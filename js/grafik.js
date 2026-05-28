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