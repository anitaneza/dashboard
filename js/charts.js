const Charts = (() => {
  const defaults = {
    responsive: true,
    maintainAspectRatio: true,
    animation: false,
    plugins: { legend: { labels: { color: "#aaa", font: { size: 12 } } } },
    scales: {
      x: { ticks: { color: "#666", maxTicksLimit: 8 }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#666" }, grid: { color: "rgba(255,255,255,0.05)" } }
    }
  };

  function makeLine(id, datasets, yMin, yMax) {
    const ctx = document.getElementById(id).getContext("2d");
    return new Chart(ctx, {
      type: "line",
      data: { labels: [], datasets },
      options: {
        ...defaults,
        scales: {
          ...defaults.scales,
          y: { ...defaults.scales.y, min: yMin, max: yMax }
        }
      }
    });
  }

  function makeBar(id, label, color) {
    const ctx = document.getElementById(id).getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],
        datasets: [{ label, data: new Array(12).fill(0), backgroundColor: color, borderRadius: 6 }]
      },
      options: {
        ...defaults,
        plugins: { legend: { display: false } }
      }
    });
  }

  function dataset(label, color, fill = false) {
    return {
      label, data: [], borderColor: color,
      backgroundColor: fill ? color + "22" : "transparent",
      borderWidth: 2, pointRadius: 3,
      pointBackgroundColor: color, tension: 0.3, fill
    };
  }

  // Buat semua chart
  const suhuKelembaban = makeLine("chart-suhu-kelembaban", [
    dataset("Suhu (°C)", "#ff7043"),
    dataset("Kelembaban (%)", "#7986cb")
  ], 0, 100);

  const energiMonitoring = makeLine("chart-energi", [
    dataset("Energi (kWh)", "#00c8a0", true)
  ]);

  const energiBulanan = makeBar("chart-energi-bulanan", "Energi (kWh)", "#00c8a0");

  const thiChart = makeLine("chart-thi", [
    dataset("THI", "#9b59b6")
  ]);

  const inletChart = makeLine("chart-inlet", [
    dataset("Suhu Inlet (°C)", "#ff7043"),
    dataset("Kelembaban Inlet (%)", "#7986cb")
  ], 0, 100);

  const outletChart = makeLine("chart-outlet", [
    dataset("Suhu Outlet (°C)", "#ff7043"),
    dataset("Kelembaban Outlet (%)", "#7986cb")
  ], 0, 100);

  const copChart = makeLine("chart-cop", [
    dataset("COP", "#e040fb")
  ]);

  function loadHistorical(rows) {
    if (!rows || rows.length === 0) return;
    const labels = rows.map(r => {
      const d = new Date(r.timestamp);
      return d.getHours().toString().padStart(2,"0") + "." +
             d.getMinutes().toString().padStart(2,"0");
    });

    suhuKelembaban.data.labels = labels;
    suhuKelembaban.data.datasets[0].data = rows.map(r => r.suhu_ruangan);
    suhuKelembaban.data.datasets[1].data = rows.map(r => r.kelembaban_ruangan);
    suhuKelembaban.update();

    energiMonitoring.data.labels = labels;
    energiMonitoring.data.datasets[0].data = rows.map(r => r.energi);
    energiMonitoring.update();
  }

  function loadGrafik(rows) {
    if (!rows || rows.length === 0) return;
    const labels = rows.map(r => {
      const d = new Date(r.timestamp);
      return d.getHours().toString().padStart(2,"0") + "." +
             d.getMinutes().toString().padStart(2,"0");
    });

    thiChart.data.labels = labels;
    thiChart.data.datasets[0].data = rows.map(r => r.thi);
    thiChart.update();

    inletChart.data.labels = labels;
    inletChart.data.datasets[0].data = rows.map(r => r.suhu_inlet);
    inletChart.data.datasets[1].data = rows.map(r => r.kelembaban_inlet);
    inletChart.update();

    outletChart.data.labels = labels;
    outletChart.data.datasets[0].data = rows.map(r => r.suhu_outlet);
    outletChart.data.datasets[1].data = rows.map(r => r.kelembaban_outlet);
    outletChart.update();

    copChart.data.labels = labels;
    copChart.data.datasets[0].data = rows.map(r => r.cop);
    copChart.update();
  }

  function loadMonthly(rows) {
    if (!rows || rows.length === 0) return;
    rows.forEach(r => {
      const idx = r.bulan - 1;
      energiBulanan.data.datasets[0].data[idx] = r.total_energi;
    });
    energiBulanan.update();
  }

  return { loadHistorical, loadGrafik, loadMonthly };
})();