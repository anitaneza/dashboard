const ConfigTab = (() => {
  function onModeACChange() {
    const checked = document.getElementById("toggle-mode-ac").checked;
    document.getElementById("label-mode-ac").textContent = checked ? "Manual" : "Otomatis";
    document.getElementById("manual-controls").classList.toggle("hidden", !checked);
    MQTTClient.publish("MODE_AC", checked ? "manual" : "auto").catch(e => {
      Notification.error("Gagal mengirim mode AC: " + e.message);
    });
  }

  function sendACCommand(cmd) {
    MQTTClient.publish("AC_COMMAND", cmd).catch(e => {
      Notification.error("Gagal mengirim perintah AC: " + e.message);
    });
  }

  function onModeESPChange() {
    const checked = document.getElementById("toggle-mode-esp").checked;
    document.getElementById("label-mode-esp").textContent = checked ? "Config" : "Normal";
    const irSection = document.getElementById("ir-capture-section");
    if (irSection) irSection.classList.toggle("hidden", !checked);
    MQTTClient.publish("MODE_ESP", checked ? "config" : "normal").catch(e => {
      Notification.error("Gagal mengirim mode ESP: " + e.message);
    });
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

  function sendWifiConfig() {
    Notification.info("Fitur WiFi config belum tersedia");
  }

  return { onModeACChange, sendACCommand, onModeESPChange, startCapture, confirmCapture, bindCaptureResult, sendWifiConfig };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.ConfigTab = ConfigTab;
