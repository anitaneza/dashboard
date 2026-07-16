const Charts = (() => {
  const defaults = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    plugins: { legend: { labels: { color: "#e5e7eb", font: { size: 12 } } } },
    scales: {
      x: { ticks: { color: "#d1d5db", maxTicksLimit: 10 }, grid: { color: "rgba(255,255,255,0.14)" } },
      y: { ticks: { color: "#e5e7eb" }, grid: { color: "rgba(255,255,255,0.14)" } }
    }
  };

  function createLineChart(id, datasets, yMin, yMax) {
    const ctx = document.getElementById(id).getContext("2d");
    return new Chart(ctx, {
      type: "line",
      data: { labels: [], datasets },
      options: {
        ...defaults,
        scales: { ...defaults.scales, y: { ...defaults.scales.y, min: yMin, max: yMax } }
      }
    });
  }

  function createBarChart(id, label, color) {
    const ctx = document.getElementById(id).getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: { labels: [], datasets: [{ label, data: [], backgroundColor: color, borderRadius: 2 }] },
      options: { ...defaults, plugins: { legend: { display: false } } }
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
    chart.data.labels = labels;
    datasetValues.forEach((data, index) => { chart.data.datasets[index].data = data; });
    chart.update();
  }

  const suhuKelembabanChart = createLineChart("chart-suhu-kelembaban", [
    lineDataset("Suhu (°C)", "#ff6b57"),
    lineDataset("Kelembaban (%)", "#7c6cf2")
  ], 0, 100);

  const dayaChart = createLineChart("chart-daya", [
    lineDataset("Daya (Watt)", "#4169d8")
  ], 0);

  const energiBulananChart = createBarChart("chart-energi-bulanan", "Energi (kWh)", "#27a8b6");
  const thiChart = createLineChart("chart-thi", [lineDataset("THI", "#a315c6")]);
  const inletChart = createLineChart("chart-inlet", [
    lineDataset("Suhu Inlet (°C)", "#ff6b57"),
    lineDataset("Kelembaban Inlet (%)", "#7c6cf2")
  ], 0, 100);
  const outletChart = createLineChart("chart-outlet", [
    lineDataset("Suhu Outlet (°C)", "#ff6b57"),
    lineDataset("Kelembaban Outlet (%)", "#7c6cf2")
  ], 0, 100);
  const copChart = createLineChart("chart-cop", [lineDataset("COP", "#e040fb")]);
  const energiFilteredChart = createBarChart("chart-energi-filtered", "Konsumsi Energi (kWh)", "#27a8b6");
  const tdlChart = createBarChart("chart-tdl", "TDL", "#ff3535");

  // Setiap grafik mempunyai fungsi render sendiri agar sumber data dan tampilannya mudah ditelusuri.
  function renderSuhuKelembaban(rows) {
    updateChart(suhuKelembabanChart, rows.map(row => formatTime(row.Timestamp)), [
      values(rows, ["Suhu_Avg", "Suhu", "Temperature"]),
      values(rows, ["Kelembaban_Avg", "Kelembaban", "Humidity"])
    ]);
  }

  function renderDaya(rows) {
    updateChart(dayaChart, rows.map(row => formatTime(row.Timestamp)), [
      values(rows, ["Daya", "Daya_Avg", "Watt", "Power"])
    ]);
  }

  function renderEnergiFiltered(rows, range) {
    const labels = rows.map(row => range === "weekly" ? formatDay(row.Timestamp) : formatTime(row.Timestamp));
    updateChart(energiFilteredChart, labels, [values(rows, ["Energi", "Energi_Avg", "total_energi"]) ]);
  }

  function renderTdl(rows, range) {
    const labels = rows.map(row => range === "weekly" ? formatDay(row.Timestamp) : formatTime(row.Timestamp));
    updateChart(tdlChart, labels, [values(rows, ["TDL", "Tegangan", "Voltage", "Tegangan_Avg", "Voltage_Avg"]) ]);
  }

  function renderTHI(rows) {
    updateChart(thiChart, rows.map(row => formatTime(row.Timestamp)), [values(rows, ["THI"]) ]);
  }

  function renderInlet(rows) {
    const labels = rows.map(row => formatTime(row.Timestamp));
    updateChart(inletChart, labels, [
      values(rows, ["Suhu_Inlet"]), values(rows, ["Kelembaban_Inlet"])
    ]);
  }

  function renderOutlet(rows) {
    const labels = rows.map(row => formatTime(row.Timestamp));
    updateChart(outletChart, labels, [
      values(rows, ["Suhu_Outlet"]), values(rows, ["Kelembaban_Outlet"])
    ]);
  }

  function renderCOP(rows) {
    updateChart(copChart, rows.map(row => formatTime(row.Timestamp)), [values(rows, ["COP"]) ]);
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

  function loadGrafik(rowsSensor, rowsESP2) {
    if (rowsSensor && rowsSensor.length) renderTHI(rowsSensor);
    if (rowsESP2 && rowsESP2.length) {
      renderInlet(rowsESP2);
      renderOutlet(rowsESP2);
      renderCOP(rowsESP2);
    }
  }

  function loadMonthly(rows) {
    if (!rows || !rows.length) return;
    energiBulananChart.data.labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    energiBulananChart.data.datasets[0].data = new Array(12).fill(0);
    rows.forEach(row => {
      const index = Number(row.bulan) - 1;
      if (index >= 0 && index < 12) energiBulananChart.data.datasets[0].data[index] = Number(row.total_energi) || 0;
    });
    energiBulananChart.update();
  }

  return { loadHistorical, loadEnergyTdl, loadGrafik, loadMonthly };
})();
