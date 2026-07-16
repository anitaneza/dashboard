const Helpers = (() => {
  const THI = { CONSTANT: 14.5, SEJUK: 21, NYAMAN: 24, PANAS: 27 };
  const COP = { BAGUS: 4, CUKUP: 2.5 };
  const CHART = { MAX_TICKS: 10, BORDER_WIDTH: 3, POINT_HOVER_RADIUS: 4, TENSION: 0.3, MONTHS: 12 };
  const RANGE_MAP = { daily: "daily", weekly: "weekly", monthly: "monthly" };
  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  function calcTHI(suhu, kelembaban) {
    return suhu - 0.55 * (1 - kelembaban / 100) * (suhu - 14.5);
  }

  function classifyTHI(value) {
    if (value < THI.SEJUK) return { label: "Sejuk", color: "#22c55e" };
    if (value < THI.NYAMAN) return { label: "Nyaman", color: "#4f8cff" };
    if (value < THI.PANAS) return { label: "Agak Panas", color: "#f59e0b" };
    return { label: "Panas", color: "#ef4444" };
  }

  function classifyCOP(value) {
    if (isNaN(value)) return { label: "-", color: "var(--text-muted)" };
    if (value >= COP.BAGUS) return { label: "Bagus", color: "#22c55e" };
    if (value >= COP.CUKUP) return { label: "Cukup", color: "#f59e0b" };
    return { label: "Buruk", color: "#ef4444" };
  }

  function formatTimestamp(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  function formatDate(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
  }

  return {
    calcTHI, classifyTHI, classifyCOP, formatTimestamp, formatDate,
    CHART, MONTHS_SHORT, THI, COP,
  };
})();
window.Dashboard = window.Dashboard || {};
window.Dashboard.Helpers = Helpers;
