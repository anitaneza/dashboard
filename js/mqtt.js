const MQTTClient = (() => {
  let client = null;
  const handlers = {};

  function connect() {
    client = mqtt.connect(CONFIG.MQTT_BROKER, {
      clientId: CONFIG.MQTT_CLIENT_ID,
      clean: true,
    });

    client.on("connect", () => {
      console.log("MQTT connected");
      const topics = Object.values(CONFIG.TOPICS);
      topics.forEach(t => client.subscribe(t));
    });

    client.on("message", (topic, message) => {
      const val = message.toString();
      if (handlers[topic]) handlers[topic](val);
    });

    client.on("error", (err) => console.error("MQTT error:", err));
    client.on("reconnect", () => console.log("MQTT reconnecting..."));
  }

  function on(topic, fn) {
    handlers[topic] = fn;
  }

  function publish(topic, payload) {
    if (client && client.connected) {
      client.publish(topic, String(payload));
    }
  }

  return { connect, on, publish };
})();