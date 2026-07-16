const Charts = (() => {
  const chartInstances = new Map();

  function defaults() {
    return {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      plugins: { legend: { labels: { color: "#e5e7eb", font: { size: 12 } } } },
      scales: {
        x: { ticks: { color: "#d1d5db", maxTicksLimit: 10 }, grid: { color: "rgba(255,255,255,0.14)" } },
        y: { ticks: { color: "#e5e7eb" }, grid: { color: "rgba(255,255,255,0.14)" } }
      }
    };
  }

  function getOrCreate(id, config) {
    if (chartInstances.has(id)) {
      chartInstances.get(id).destroy();
    }
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const instance = new Chart(ctx, config);
    chartInstances.set(id, instance);
    return instance;
  }

  function createLineChart(id, datasets, yMin, yMax) {
    return getOrCreate(id, {
      type: "line",
      data: { labels: [], datasets },
      options: {
        ...defaults(),
        scales: {
          ...defaults().scales,
          y: { ...defaults().scales.y, min: yMin, max: yMax }
        }
      }
    });
  }

  function createBarChart(id, label, color) {
    return getOrCreate(id, {
      type: "bar",
      data: { labels: [], datasets: [{ label, data: [], backgroundColor: color, borderRadius: 2 }] },
      options: { ...defaults(), plugins: { legend: { display: false } } }
    });
  }

  function lineDataset(label, color, fill = false) {
    return {
      label,
      data: [],
      borderColor: color,
      backgroundColor: fill ? color + "22" : "transparent",
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
      fill
    };
  }

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "");
    return `${String(date.getHours()).padStart(2, "0")}.${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function formatDay(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value || "");
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function values(rows, fieldNames) {
    return rows.map(row => {
      const field = fieldNames.find(name => row[name] !== undefined && row[name] !== "");
      const value = Number.parseFloat(field ? row[field] : NaN);
      return Number.isFinite(value) ? value : null;
    });
  }

  function updateChart(chart, labels, datasetValues) {
    if (!chart) return;
    chart.data.labels = labels;
    datasetValues.forEach((data, index) => { chart.data.datasets[index].data = data; });
    chart.update();
  }

  function getSuhuKelembabanChart() {
    return createLineChart("chart-suhu-kelembaban", [
      lineDataset("Suhu (°C)", "#ff6b57"),
      lineDataset("Kelembaban (%)", "#7c6cf2")
    ], 0, 100);
  }

  function getDayaChart() {
    return createLineChart("chart-daya", [
      lineDataset("Daya (Watt)", "#4169d8")
    ], 0);
  }

  function getTHIChart() {
    return createLineChart("chart-thi", [lineDataset("THI", "#a315c6")]);
  }

  function getInletChart() {
    return createLineChart("chart-inlet", [
      lineDataset("Suhu Inlet (°C)", "#ff6b57"),
      lineDataset("Kelembaban Inlet (%)", "#7c6cf2")
    ], 0, 100);
  }

  function getOutletChart() {
    return createLineChart("chart-outlet", [
      lineDataset("Suhu Outlet (°C)", "#ff6b57"),
      lineDataset("Kelembaban Outlet (%)", "#7c6cf2")
    ], 0, 100);
  }

  function getCOPChart() {
    return createLineChart("chart-cop", [lineDataset("COP", "#e040fb")]);
  }

  function getEnergiFilteredChart() {
    return createBarChart("chart-energi-filtered", "Konsumsi Energi (kWh)", "#27a8b6");
  }

  function getTDLChart() {
    return createBarChart("chart-tdl", "TDL", "#ff3535");
  }

  function renderSuhuKelembaban(rows) {
    const chart = getSuhuKelembabanChart();
    updateChart(chart, rows.map(row => formatTime(row.Timestamp)), [
      values(rows, ["Suhu_Avg", "Suhu", "Temperature"]),
      values(rows, ["Kelembaban_Avg", "Kelembaban", "Humidity"])
    ]);
  }

  function renderDaya(rows) {
    const chart = getDayaChart();
    updateChart(chart, rows.map(row => formatTime(row.Timestamp)), [
      values(rows, ["Daya", "Daya_Avg", "Watt", "Power"])
    ]);
  }

  function renderEnergiFiltered(rows, range) {
    const chart = getEnergiFilteredChart();
    const labels = rows.map(row => range === "weekly" ? formatDay(row.Timestamp) : formatTime(row.Timestamp));
    updateChart(chart, labels, [values(rows, ["Energi", "Energi_Avg", "total_energi"])]);
  }

  function renderTdl(rows, range) {
    const chart = getTDLChart();
    const labels = rows.map(row => range === "weekly" ? formatDay(row.Timestamp) : formatTime(row.Timestamp));
    updateChart(chart, labels, [values(rows, ["TDL", "Tegangan", "Voltage", "Tegangan_Avg", "Voltage_Avg"])]);
  }

  function renderTHI(rows) {
    const chart = getTHIChart();
    updateChart(chart, rows.map(row => formatTime(row.Timestamp)), [values(rows, ["THI"])]);
  }

  function renderInlet(rows) {
    const chart = getInletChart();
    updateChart(chart, rows.map(row => formatTime(row.Timestamp)), [
      values(rows, ["Suhu_Inlet"]), values(rows, ["Kelembaban_Inlet"])
    ]);
  }

  function renderOutlet(rows) {
    const chart = getOutletChart();
    updateChart(chart, rows.map(row => formatTime(row.Timestamp)), [
      values(rows, ["Suhu_Outlet"]), values(rows, ["Kelembaban_Outlet"])
    ]);
  }

  function renderCOP(rows) {
    const chart = getCOPChart();
    updateChart(chart, rows.map(row => formatTime(row.Timestamp)), [values(rows, ["COP"])]);
  }

  function initMonitoring() {
    getSuhuKelembabanChart();
    getDayaChart();
    getEnergiFilteredChart();
    getTDLChart();
  }

  function loadHistorical(rowsSensor, rowsESP2) {
    if (rowsSensor && rowsSensor.length) renderSuhuKelembaban(rowsSensor);
    if (rowsESP2 && rowsESP2.length) renderDaya(rowsESP2);
  }

  function loadEnergyTdl(rows, range) {
    if (!rows || !rows.length) return;
    renderEnergiFiltered(rows, range);
    renderTdl(rows, range);
  }

  return { initMonitoring, loadHistorical, loadEnergyTdl };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.Charts = Charts;
