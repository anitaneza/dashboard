const Monitoring = (() => {
  const els = {};

  function cacheElements() {
    const ids = ["val-daya","val-energi","val-thi","val-cop","val-suhu","val-kelembaban",
      "val-pir","val-ac-status","val-setpoint","val-thi-label","val-cop-label"];
    ids.forEach(id => { els[id] = document.getElementById(id); });
  }

  function updateTHI() {
    const suhu = parseFloat(els["val-suhu"]?.textContent) || 0;
    const kelembaban = parseFloat(els["val-kelembaban"]?.textContent) || 0;
    const thi = Helpers.calcTHI(suhu, kelembaban);
    const cls = Helpers.classifyTHI(thi);
    if (els["val-thi"]) els["val-thi"].textContent = thi.toFixed(1);
    if (els["val-thi-label"]) {
      els["val-thi-label"].textContent = `(${cls.label})`;
      els["val-thi-label"].style.color = cls.color;
    }
  }

  function setCOP(val) {
    const v = parseFloat(val);
    if (els["val-cop"]) els["val-cop"].textContent = isNaN(v) ? "--" : v.toFixed(1);
    const cls = Helpers.classifyCOP(v);
    if (els["val-cop-label"]) {
      els["val-cop-label"].textContent = cls.label ? `(${cls.label})` : "";
      els["val-cop-label"].style.color = cls.color;
    }
  }

  function bindMQTT() {
    cacheElements();

    MQTTClient.on("SUHU_RUANGAN", v => {
      const val = parseFloat(v).toFixed(1);
      if (els["val-suhu"]) els["val-suhu"].textContent = val;
      updateTHI();
    });

    MQTTClient.on("KELEMBABAN", v => {
      const val = parseFloat(v).toFixed(1);
      if (els["val-kelembaban"]) els["val-kelembaban"].textContent = val;
      updateTHI();
    });

    MQTTClient.on("PIR", v => {
      if (els["val-pir"]) els["val-pir"].textContent = v === "detected" ? "Ada Orang" : "Kosong";
    });

    MQTTClient.on("AC_STATUS", v => {
      if (els["val-ac-status"]) els["val-ac-status"].textContent = v.toUpperCase();
    });

    MQTTClient.on("SETPOINT", v => {
      if (els["val-setpoint"]) els["val-setpoint"].textContent = v;
    });

    MQTTClient.on("DAYA", v => {
      if (els["val-daya"]) els["val-daya"].textContent = parseFloat(v).toFixed(0);
    });

    MQTTClient.on("ENERGI", v => {
      if (els["val-energi"]) els["val-energi"].textContent = parseFloat(v).toFixed(2);
    });

    MQTTClient.on("COP", v => setCOP(v));
  }

  return { bindMQTT };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.Monitoring = Monitoring;
