const Monitoring = (() => {
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

  function setTHI(val) {
    const v = parseFloat(val);
    document.getElementById("val-thi").textContent = isNaN(v) ? "--" : v.toFixed(1);
    let label = "";
    if (!isNaN(v)) {
      if (v < 21) label = "Sejuk";
      else if (v <= 24) label = "Nyaman";
      else if (v <= 27) label = "Agak Panas";
      else label = "Panas";
    }
    document.getElementById("val-thi-label").textContent = label ? `(${label})` : "";
  }

  function bindMQTT() {
    const T = CONFIG.TOPICS;

    MQTTClient.on(T.SUHU_RUANGAN, v => {
      document.getElementById("val-suhu").textContent = parseFloat(v).toFixed(1);
    });

    MQTTClient.on(T.KELEMBABAN, v => {
      document.getElementById("val-kelembaban").textContent = parseFloat(v).toFixed(1);
    });

    MQTTClient.on(T.PIR, v => {
      const el = document.getElementById("val-pir");
      el.textContent = v === "detected" ? "Ada Orang" : "Kosong";
    });

    MQTTClient.on(T.AC_STATUS, v => {
      document.getElementById("val-ac-status").textContent = v.toUpperCase();
    });

    MQTTClient.on(T.SETPOINT, v => {
      document.getElementById("val-setpoint").textContent = v;
    });

    MQTTClient.on(T.THI, v => setTHI(v));

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