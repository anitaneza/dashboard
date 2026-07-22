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

  let energyLogData = null;

  function initEnergyData(rawRows) {
    energyLogData = rawRows;
  }

  function getMonthRows(monthKey) {
    if (!energyLogData) return [];
    return energyLogData.filter(row => {
      const d = new Date(row.Timestamp);
      return !isNaN(d.getTime()) && Helpers.getMonthKey(d) === monthKey;
    });
  }

  function aggregateWeeks(monthRows, monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const weeks = [];
    let weekStart = new Date(startOfMonth);

    while (weekStart <= endOfMonth) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const chunkEnd = weekEnd > endOfMonth ? new Date(endOfMonth) : weekEnd;

      let sumEnergi = 0, sumTarif = 0;
      monthRows.forEach(row => {
        const d = new Date(row.Timestamp);
        if (d >= weekStart && d <= chunkEnd) {
          sumEnergi += Number(row.Energi_kWh) || 0;
          sumTarif += Number(row.Tarif_Listrik) || 0;
        }
      });

      weeks.push({
        label: `${weekStart.getDate()} ${Helpers.MONTHS_SHORT[weekStart.getMonth()]} - ${chunkEnd.getDate()} ${Helpers.MONTHS_SHORT[chunkEnd.getMonth()]}`,
        energi: sumEnergi,
        tarif: sumTarif,
      });

      weekStart = new Date(chunkEnd);
      weekStart.setDate(weekStart.getDate() + 1);
    }
    return weeks;
  }

  function renderEnergyView(monthKey, mode) {
    const monthRows = getMonthRows(monthKey);
    let labels, energiData, tarifData;

    if (mode === "weekly") {
      const weeks = aggregateWeeks(monthRows, monthKey);
      labels = weeks.map(w => w.label);
      energiData = weeks.map(w => w.energi);
      tarifData = weeks.map(w => w.tarif);
    } else {
      monthRows.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
      labels = monthRows.map(r => Helpers.formatShortDate(r.Timestamp));
      energiData = monthRows.map(r => Number(r.Energi_kWh) || 0);
      tarifData = monthRows.map(r => Number(r.Tarif_Listrik) || 0);
    }

    const energiChart = getEnergiFilteredChart();
    if (energiChart) {
      energiChart.data.labels = labels;
      energiChart.data.datasets[0].data = energiData;
      energiChart.update();
    }

    const tdlChart = getTDLChart();
    if (tdlChart) {
      tdlChart.data.labels = labels;
      tdlChart.data.datasets[0].data = tarifData;
      tdlChart.update();
    }
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
  }

  function loadHistorical(rowsSensor, rowsESP2) {
    if (rowsSensor && rowsSensor.length) renderSuhuKelembaban(rowsSensor);
    if (rowsESP2 && rowsESP2.length) renderDaya(rowsESP2);
  }

  return { initMonitoring, loadHistorical, initEnergyData, renderEnergyView };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.Charts = Charts;
