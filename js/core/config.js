const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbx6ntzH26KpNRt4Zzrv2HxCc4okhMjO9d_AHOouuFswfhcT52jlP1ZIetC3l5d8-9xR/exec",
  MQTT_BROKER: "wss://broker.hivemq.com:8884/mqtt",
  MQTT_CLIENT_ID: "dashboard-" + Math.random().toString(16).slice(2, 8),

  TOPICS: {
    SUHU_RUANGAN:    "2204129/esp1/dht/room/temperature",
    KELEMBABAN:      "2204129/esp1/dht/room/humidity",
    PIR:             "2204129/esp1/pir/status",
    AC_STATUS:       "2204129/esp1/ac/status",
    SETPOINT:        "2204129/esp1/fuzzy/setpoint",
    THI:             "2204129/esp1/thi",
    FIRING_RENDAH:   "2204129/esp1/fuzzy/firing/rendah",
    FIRING_SEDANG:   "2204129/esp1/fuzzy/firing/sedang",
    FIRING_TINGGI:   "2204129/esp1/fuzzy/firing/tinggi",

    DAYA:            "2204129/esp2/pzem/watt",
    ENERGI:          "2204129/esp2/pzem/energy_kwh",
    VOLTAGE:         "2204129/esp2/pzem/voltage",
    CURRENT:         "2204129/esp2/pzem/current",
    FREQ:            "2204129/esp2/pzem/frequency",
    PF:              "2204129/esp2/pzem/power_factor",
    SUHU_INLET:      "2204129/esp2/dht/inlet/temperature",
    KELEMBABAN_INLET:"2204129/esp2/dht/inlet/humidity",
    SUHU_OUTLET:     "2204129/esp2/dht/outlet/temperature",
    KELEMBABAN_OUTLET:"2204129/esp2/dht/outlet/humidity",
    COP:             "2204129/esp2/cop/value",
    Q_COOL:          "2204129/esp2/cop/q_cool",

    MODE_ESP:        "2204129/esp1/mode",
    CAPTURE:         "2204129/esp1/capture",
    CAPTURE_RESULT:  "2204129/esp1/capture/result",
    CAPTURE_CONFIRM: "2204129/esp1/capture/confirm",
    MODE_AC:         "2204129/esp1/ac/mode",
    AC_COMMAND:      "2204129/esp1/ac/command",
    WIFI_CONFIG:     "2204129/wifi/config",
  }
};

Object.freeze(CONFIG.TOPICS);
Object.freeze(CONFIG);
