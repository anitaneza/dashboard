async function loadGrafikTab(range) {
  const [sensor, esp2] = await Promise.all([
    API.getESP1(range),
    API.getESP2(range)
  ]);
  Charts.loadGrafik(sensor, esp2);

  // Load grafik bulanan hanya saat filter "monthly" atau pertama kali
  const monthly = await API.getMonthly();
  Charts.loadMonthly(monthly);
}

function setFilter(range, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const apiRange = range === "today" ? "daily" : range === "7d" ? "weekly" : "monthly";
  loadGrafikTab(apiRange);
}