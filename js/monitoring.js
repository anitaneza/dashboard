const Monitoring = (() => {
  // Simpan nilai terakhir untuk hitung THI
  let lastSuhu = null;
  let lastKelembaban = null;

  function hitungTHI(suhu, kelembaban) {
    return suhu - 0.55 * (1 - kelembaban / 100) * (suhu - 14.5);
  }

  function updateTHI() {
    if (lastSuhu === null || lastKelembaban === null) return;
    const thi = hitungTHI(lastSuhu, lastKelembaban);
    document.getElementById("val-thi").textContent = thi.toFixed(1);
    let label = "";
    if (thi < 21) label = "Sejuk";
    else if (thi <= 24) label = "Nyaman";
    else if (thi <= 27) label = "Agak Panas";
    else label = "Panas";
    document.getElementById("val-thi-label").textContent = `(${label})`;
  }

  function setCOP(val) {
    const v = parseFloat(val);
    document.getElementById("val-cop").textContent = isNaN(v) ? "--" : v.toFixed(1);
    let label = "";
    if (!isNaN(v)) {
      if (v >= 4) label = "Bagus";
      else if (v >= 2.5) label = "Cukup";
      else label = "Rendah";
    }
    document.getElementById("val-cop-label").textContent = label ? `(${label})` : "";
  }

  function bindMQTT() {
    const T = CONFIG.TOPICS;

    MQTTClient.on(T.SUHU_RUANGAN, v => {
      lastSuhu = parseFloat(v);
      document.getElementById("val-suhu").textContent = lastSuhu.toFixed(1);
      updateTHI();
    });

    MQTTClient.on(T.KELEMBABAN, v => {
      lastKelembaban = parseFloat(v);
      document.getElementById("val-kelembaban").textContent = lastKelembaban.toFixed(1);
      updateTHI();
    });

    MQTTClient.on(T.PIR, v => {
      document.getElementById("val-pir").textContent = v === "detected" ? "Ada Orang" : "Kosong";
    });

    MQTTClient.on(T.AC_STATUS, v => {
      document.getElementById("val-ac-status").textContent = v.toUpperCase();
    });

    MQTTClient.on(T.SETPOINT, v => {
      document.getElementById("val-setpoint").textContent = v;
    });

    MQTTClient.on(T.DAYA, v => {
      document.getElementById("val-daya").textContent = parseFloat(v).toFixed(0);
    });

    MQTTClient.on(T.ENERGI, v => {
      document.getElementById("val-energi").textContent = parseFloat(v).toFixed(2);
    });

    MQTTClient.on(T.COP, v => setCOP(v));
  }

  return { bindMQTT };
})();