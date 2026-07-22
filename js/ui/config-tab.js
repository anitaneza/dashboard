const ConfigTab = (() => {
  function setModeAC(mode) {
    document.querySelectorAll("[data-mode-ac]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.modeAc === mode);
    });
    MQTTClient.publish("MODE_AC", mode).catch(e => {
      Notification.error("Gagal mengirim mode AC: " + e.message);
    });
  }

  function setModeESP(mode) {
    document.querySelectorAll("[data-mode-esp]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.modeEsp === mode);
    });
    setIRDisabled(mode === "normal");
    MQTTClient.publish("MODE_ESP", mode).catch(e => {
      Notification.error("Gagal mengirim mode ESP: " + e.message);
    });
  }

  function setIRDisabled(disabled) {
    const section = document.getElementById("ir-capture-section");
    if (!section) return;
    section.classList.toggle("ir-frozen", disabled);
    document.getElementById("ir-select").disabled = disabled;
    const startBtn = document.querySelector("[data-capture='start']");
    if (startBtn) startBtn.disabled = disabled;
    const saveBtn = document.getElementById("btn-save-ir");
    if (saveBtn) saveBtn.disabled = disabled;
  }

  function startCapture() {
    const btn = document.getElementById("ir-select").value;
    document.getElementById("capture-status").textContent = "Capturing... menunggu sinyal remote";
    document.getElementById("capture-result").value = "";
    document.getElementById("btn-save-ir").classList.add("hidden");
    MQTTClient.publish("CAPTURE", btn).catch(e => {
      Notification.error("Gagal memulai capture: " + e.message);
    });
  }

  function confirmCapture() {
    const selected = document.getElementById("ir-select").value;
    MQTTClient.publish("CAPTURE_CONFIRM", selected).then(() => {
      document.getElementById("capture-status").textContent = "Tersimpan.";
      document.getElementById("btn-save-ir").classList.add("hidden");
      Notification.success("Kode IR berhasil disimpan");
    }).catch(e => {
      Notification.error("Gagal menyimpan: " + e.message);
    });
  }

  function bindCaptureResult() {
    MQTTClient.on("CAPTURE_RESULT", (val) => {
      document.getElementById("capture-result").value = val;
      document.getElementById("capture-status").textContent = "Hasil diterima. Klik Simpan untuk konfirmasi.";
      document.getElementById("btn-save-ir").classList.remove("hidden");
    });
  }

  return { setModeAC, setModeESP, startCapture, confirmCapture, bindCaptureResult };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.ConfigTab = ConfigTab;
