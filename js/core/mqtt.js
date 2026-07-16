const MQTTClient = (() => {
  let client = null;
  let handlers = {};
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  const MAX_RECONNECT = 30000;
  let connectionCallbacks = [];

  function connect() {
    if (client && client.connected) return;
    client = new Paho.MQTT.Client(CONFIG.MQTT_BROKER, CONFIG.MQTT_CLIENT_ID);

    client.onConnectionLost = () => {
      notifyConnection(false);
      scheduleReconnect();
    };

    client.onMessageArrived = (msg) => {
      const handler = handlers[msg.destinationName];
      if (handler) handler(msg.payloadString);
    };

    client.onConnect = () => {
      reconnectDelay = 1000;
      notifyConnection(true);
      Object.values(CONFIG.TOPICS).forEach(t => client.subscribe(t));
    };

    client.onFailure = () => {
      notifyConnection(false);
      scheduleReconnect();
    };

    client.connect({
      useSSL: true,
      onSuccess: client.onConnect,
      onFailure: client.onFailure,
    });
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
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
      const msg = new Paho.MQTT.Message(
        typeof payload === "string" ? payload : JSON.stringify(payload)
      );
      msg.destinationName = topic;
      client.send(msg);
      resolve();
    });
  }

  return { connect, on, off, publish, onConnectionChange };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.MQTTClient = MQTTClient;
