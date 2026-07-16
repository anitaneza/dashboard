const Notification = (() => {
  let container = document.getElementById("notification-area");
  if (!container) {
    container = document.createElement("div");
    container.id = "notification-area";
    container.style.cssText =
      "position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:400px";
    document.body.appendChild(container);
  }

  function show(msg, type = "info", duration = 5000) {
    const el = document.createElement("div");
    el.className = `notification notification-${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, duration);
  }

  return {
    show,
    info: (m) => show(m, "info"),
    error: (m, d) => show(m, "error", d || 8000),
    success: (m) => show(m, "success"),
  };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.Notification = Notification;
