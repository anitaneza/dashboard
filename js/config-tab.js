function onModeACChange() {
  const checked = document.getElementById("toggle-mode-ac").checked;
  document.getElementById("label-mode-ac").textContent = checked ? "Manual" : "Otomatis";
  document.getElementById("manual-controls").style.display = checked ? "flex" : "none";
  MQTTClient.publish(CONFIG.TOPICS.MODE_AC, checked ? "manual" : "auto");
}

function sendACCommand(cmd) {
  MQTTClient.publish(CONFIG.TOPICS.CAPTURE_CONFIRM, cmd);
}

function onModeESPChange() {
  const checked = document.getElementById("toggle-mode-esp").checked;
  document.getElementById("label-mode-esp").textContent = checked ? "Config" : "Normal";
  const irSection = document.getElementById("ir-capture-section");
  irSection.style.opacity = checked ? "1" : "0.4";
  irSection.style.pointerEvents = checked ? "auto" : "none";
  MQTTClient.publish(CONFIG.TOPICS.MODE_ESP, checked ? "config" : "normal");
}

function startCapture() {
  const btn = document.getElementById("ir-select").value;
  document.getElementById("capture-status").textContent = "Capturing... menunggu sinyal remote";
  document.getElementById("capture-result").value = "";
  document.getElementById("btn-save-ir").style.display = "none";
  MQTTClient.publish(CONFIG.TOPICS.CAPTURE, btn);
}

function confirmCapture() {
  const selected = document.getElementById("ir-select").value;
  MQTTClient.publish(CONFIG.TOPICS.CAPTURE_CONFIRM, selected);
  document.getElementById("capture-status").textContent = "Tersimpan.";
  document.getElementById("btn-save-ir").style.display = "none";
}

function sendWifiConfig() {
  const ssid = document.getElementById("wifi-ssid").value.trim();
  const pass = document.getElementById("wifi-pass").value;
  if (!ssid) return alert("SSID tidak boleh kosong");
  const payload = JSON.stringify({ ssid, password: pass });
  MQTTClient.publish(CONFIG.TOPICS.WIFI_CONFIG, payload);
  alert("WiFi config terkirim.");
}

// Bind MQTT untuk hasil capture
function bindCaptureResult() {
  MQTTClient.on(CONFIG.TOPICS.CAPTURE_RESULT, (val) => {
    document.getElementById("capture-result").value = val;
    document.getElementById("capture-status").textContent = "Hasil diterima. Klik Simpan untuk konfirmasi.";
    document.getElementById("btn-save-ir").style.display = "inline-block";
  });
}