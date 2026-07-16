const MQTTClient = (() => {
  let client = null;
  let handlers = {};
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  const MAX_RECONNECT = 30000;
  let connectionCallbacks = [];
  let connectAttempted = false;

  function connect() {
    if (connectAttempted) return;
    connectAttempted = true;

    const url = CONFIG.MQTT_BROKER;
    const opts = {
      clientId: CONFIG.MQTT_CLIENT_ID,
      clean: true,
    };

    client = mqtt.connect(url, opts);

    client.on("connect", () => {
      reconnectDelay = 1000;
      notifyConnection(true);
      Object.values(CONFIG.TOPICS).forEach(t => client.subscribe(t));
    });

    client.on("message", (topic, payload) => {
      const handler = handlers[topic];
      if (handler) handler(payload.toString());
    });

    client.on("reconnect", () => {
      notifyConnection(false);
    });

    client.on("close", () => {
      notifyConnection(false);
      scheduleReconnect();
    });

    client.on("error", () => {});
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectAttempted = false;
      connect();
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT);
  }

  function notifyConnection(status) {
    connectionCallbacks.forEach(cb => cb(status));
  }

  function onConnectionChange(cb) {
    connectionCallbacks.push(cb);
  }

  function on(topicKey, handler) {
    const topic = CONFIG.TOPICS[topicKey];
    if (topic) handlers[topic] = handler;
  }

  function off(topicKey) {
    const topic = CONFIG.TOPICS[topicKey];
    if (topic) delete handlers[topic];
  }

  function publish(topicKey, payload) {
    return new Promise((resolve, reject) => {
      const topic = CONFIG.TOPICS[topicKey];
      if (!client || !client.connected) {
        reject(new Error("MQTT tidak terhubung"));
        return;
      }
      client.publish(topic, typeof payload === "string" ? payload : JSON.stringify(payload));
      resolve();
    });
  }

  return { connect, on, off, publish, onConnectionChange };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.MQTTClient = MQTTClient;
