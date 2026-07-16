# Dashboard AC Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Modular restructure dashboard AC dari struktur flat ke folder-based (core/ + ui/) dengan perbaikan keamanan, arsitektur, error handling, dan clean code. Grafik tab dihapus — hanya Monitoring dan Config.

**Architecture:** IIFE-based modules diekspos via `window.Dashboard.*`. CSS di-split ke base.css + components.css dengan CSS variables. Event handling via delegation (data-* attributes).

**Tech Stack:** Vanilla JS, Chart.js (CDN), MQTT.js (CDN). No build tools.

**Global Constraints:**
- Semua JS tetap IIFE — tidak ES modules
- Ekspos via `window.Dashboard.*`
- UI text dalam Bahasa Indonesia
- Tidak ada build tool atau package manager
- Script load order: `core/config.js` → `core/helpers.js` → `core/mqtt.js` → `core/api.js` → `ui/notification.js` → `ui/monitoring.js` → `ui/charts.js` → `ui/config-tab.js` → `app.js`

---

### Task 1: CSS Restructure

**Files:**
- Create: `css/base.css`
- Create: `css/components.css`
- Modify: `css/style.css`
- Delete: none

**Interfaces:**
- Consumes: nothing
- Produces: CSS variables di `:root`, semantic class names, responsive queries

- [ ] **Step 1: Buat `css/base.css`**
  - CSS reset (`*, *::before, *::after { box-sizing: border-box }`)
  - `:root` variables: `--nav-height: 56px`, `--gap: 14px`, `--radius: 14px`, `--bg-primary: #1a1d23`, `--bg-secondary: #2b2f35`, `--bg-card: #1e2128`, `--text-primary: #e5e7eb`, `--text-secondary: #d5d8dd`, `--text-muted: #9ca3af`, `--border: #363b43`, `--border-light: #414750`, `--accent: #4f8cff`, `--danger: #ef4444`, `--success: #22c55e`, `--warning: #f59e0b`
  - Body: Poppins font, background `var(--bg-primary)`, color `var(--text-primary)`
  - `.sr-only` utility class
  - Grid layouts: `.grid-4` (4 columns), `.grid-2` (2 columns), `.chart-grid` (3 columns)
  - Responsive: `@media (max-width: 1024px)` grid 4→2, chart-grid 3→2; `@media (max-width: 768px)` semua jadi 1 kolom
  - `.hidden` utility class, `.text-center`, `.mt-1`, `.mb-1`

- [ ] **Step 2: Buat `css/components.css`**
  - `.card` base + semantic variants: `.card-daya`, `.card-energi`, `.card-thi`, `.card-cop`, `.card-suhu`, `.card-kelembaban`, `.card-pir`, `.card-ac` (masing-masing dengan gradient warna seperti style.css lama, dengan nama baru)
  - `.nav`, `.nav-tab`, `.nav-tab.active`, `.nav-tab:focus-visible`
  - `.filter-group`, `.filter-btn`, `.filter-btn--period`, `.filter-btn.active`
  - `.toggle`, `.toggle-slider`, `.toggle input:checked + .toggle-slider`
  - `.config-card`, `.config-card-title`, `.config-row`, `.config-row-label`
  - `.btn-ac`, `.btn-ac-on`, `.btn-ac-off`, `.btn-save`, hover/focus states
  - `.notification`, `.notification-info`, `.notification-error`, `.notification-success`
  - `@media (prefers-reduced-motion)` nonaktifkan animasi
  - `.section-title` untuk judul section

- [ ] **Step 3: Ubah `css/style.css` jadi hanya @import**
  ```css
  @import url('base.css');
  @import url('components.css');
  ```

- [ ] **Step 4: Hapus duplikasi CSS .grafik-grid dari style.css lama**
  - Baris 218-227 (blok pertama .grafik-grid 2 kolom) — hapus karena ditimpa oleh lines 245-260

---

### Task 2: core/config.js + core/helpers.js

**Files:**
- Create: `js/core/helpers.js`
- Modify: `js/core/config.js` (copy dari `js/config.js` + tambah AC_COMMAND + Object.freeze)

**Interfaces:**
- Produces: `CONFIG` (dengan `TOPICS.AC_COMMAND`), `Helpers` module
- Consumed by: semua file lain

- [ ] **Step 1: Buat `js/core/config.js`**
  - Copy isi `js/config.js` persis
  - Tambah `AC_COMMAND: "2204129/esp1/ac/command"` di TOPICS
  - Tambah `Object.freeze(CONFIG.TOPICS); Object.freeze(CONFIG);` di akhir

- [ ] **Step 2: Buat `js/core/helpers.js`**
  - `const Helpers = (() => { ... })(); window.Dashboard.Helpers = Helpers;`
  - Konstanta: `THI = { CONSTANT: 14.5, SEJUK: 21, NYAMAN: 24, PANAS: 27 }`, `COP = { BAGUS: 4, CUKUP: 2.5 }`, `CHART = { MAX_TICKS: 10, BORDER_WIDTH: 3, TENSION: 0.3, MONTHS: 12 }`, `RANGE_MAP = { today: "daily", "7d": "weekly", "30d": "monthly" }`, `MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]`
  - `calcTHI(suhu, kelembaban)`: `suhu - (THI.CONSTANT * (1 - (kelembaban / 100)))`
  - `classifyTHI(value)`: return `{ label, color }` — Sejuk (<21, green), Nyaman (<24, blue), Agak Panas (<27, yellow), Panas (>=27, red)
  - `classifyCOP(value)`: return `{ label, color }` — NaN → "-", grey; >=4 "Bagus" green; >=2.5 "Cukup" yellow; else "Buruk" red
  - `formatTimestamp(ts)`: parse Date, return "HH:MM" atau "-" jika invalid
  - `formatDate(ts)`: parse Date, return "DD/MM" atau "-" jika invalid
  - `mapRange(range)`: `RANGE_MAP[range] || "monthly"`

---

### Task 3: core/mqtt.js — Resilience + Promise

**Files:**
- Modify: `js/core/mqtt.js` (pindah ke `js/core/mqtt.js`)

**Interfaces:**
- Produces: `MQTTClient` with `{ connect, on, off, publish, onConnectionChange }`
- Consumed by: ui/monitoring.js, ui/config-tab.js, app.js

- [ ] **Step 1: Buat `js/core/mqtt.js`**
  - Module scope: `client`, `handlers = {}`, `reconnectTimer`, `reconnectDelay = 1000`, `MAX_RECONNECT = 30000`, `connectionCallbacks = []`
  - `connect()`: buat `new Paho.MQTT.Client(...)`, set `onConnectionLost`, `onMessageArrived`, `onConnect`, `onFailure`
  - `onConnect`: reset delay, notify true, subscribe semua TOPICS values
  - `onConnectionLost` / `onFailure`: notify false, `scheduleReconnect()`
  - `scheduleReconnect()`: setTimeout dengan exponential backoff (1s → 2s → 4s → ... → 30s max)
  - `notifyConnection(status)`: panggil semua `connectionCallbacks`
  - `onConnectionChange(cb)`: push ke array
  - `on(topicKey, handler)`: map topic key ke topic string di CONFIG.TOPICS, simpan di handlers
  - `off(topicKey)`: delete dari handlers
  - `publish(topicKey, payload)`: return Promise — reject jika client null/!connected, else `client.send(msg)` lalu resolve

---

### Task 4: core/api.js — Error handling, -getCop, -getMonthly

**Files:**
- Modify: `js/core/api.js` (pindah dari `js/api.js`)

**Interfaces:**
- Produces: `API` with `{ getToday, getTodayEnergi, getHistorical, getEnergyHistory, getTDL }`
- Consumed by: ui/charts.js, app.js

- [ ] **Step 1: Buat `js/core/api.js`**
  - Fungsi `buildUrl(endpoint, params)` — pakai `URL` + `searchParams`
  - `async get(endpoint, params)` — fetch, cek `res.ok`, throw error jika gagal, log dengan `console.debug`, return JSON
  - `getToday()` → `get("ESP1_SensorLog")`
  - `getTodayEnergi()` → `get("ESP2_SensorLog")`
  - `getHistorical(range)` → `get("history", { range })`
  - `getEnergyHistory(range)` → `get("energy_history", { range })`
  - `getTDL(range)` → `get("tdl", { range })`
  - HAPUS `getCop()`, `getMonthly()` — tidak dipakai setelah Grafik tab dihapus

---

### Task 5: ui/notification.js — Toast system

**Files:**
- Create: `js/ui/notification.js`

**Interfaces:**
- Produces: `Notification` with `{ show, info, error, success }`
- Consumed by: semua ui/ modules, app.js

- [ ] **Step 1: Buat `js/ui/notification.js`**
  - Cari `#notification-area`, buat jika belum ada (fixed, top-right, z-index 9999)
  - `show(msg, type="info", duration=5000)`: buat div `.notification.notification-{type}`, append, setTimeout remove
  - `info(msg)`: `show(msg, "info")`
  - `error(msg, dur=8000)`: `show(msg, "error", dur)`
  - `success(msg)`: `show(msg, "success")`
  - Ekspos: `window.Dashboard.Notification = Notification`

---

### Task 6: ui/monitoring.js — Cache DOM + Helpers

**Files:**
- Modify: `js/ui/monitoring.js` (pindah ke `js/ui/monitoring.js`)

**Interfaces:**
- Consumes: `MQTTClient`, `Helpers`
- Produces: `Monitoring` with `{ setCOP, setTHI, bindMQTT }`

- [ ] **Step 1: Buat `js/ui/monitoring.js`**
  - Module scope `els = {}`
  - `cacheElements()`: query `getElementById` untuk: metric-daya, metric-energi, metric-thi, metric-cop, metric-suhu, metric-kelembaban, metric-pir, metric-ac, metric-thi-label, metric-cop-label, metric-cop-indicator, metric-suhu-inlet, metric-suhu-outlet
  - `setTHI(suhu, kelembaban)`: pakai `Helpers.calcTHI()` dan `Helpers.classifyTHI()`, update text + warna
  - `setCOP(val)`: pakai `Helpers.classifyCOP()`, update text + warna
  - `bindMQTT()`: panggil `cacheElements()`, daftarkan handler untuk SUHU, KELEMBABAN, DAYA, ENERGI, PIR, AC_STATE, SUHU_INLET, SUHU_OUTLET, KELEMBABAN_INLET (trigger setTHI)
  - Ekspos: `window.Dashboard.Monitoring = Monitoring`

---

### Task 7: ui/charts.js — Lazy init, -grafik charts

**Files:**
- Modify: `js/ui/charts.js` (pindah ke `js/ui/charts.js`)
- Delete: `js/charts.js` (lama)

**Interfaces:**
- Consumes: `API`, `Helpers`
- Produces: `Charts` with `{ getOrCreate, defaults, lineDataset, values, loadHistorical, loadEnergyTdl }`

- [ ] **Step 1: Buat `js/ui/charts.js`**
  - `chartInstances = new Map()`
  - `getOrCreate(id, config)`: destroy existing instance jika ada, create baru, simpan di Map
  - `defaults(isBar=false)`: Chart.js defaults object (sama seperti charts.js lama)
  - `lineDataset(label, data, color, fill=false)`: dataset object
  - `values(row, ...keys)`: cari key pertama yang ada di row, return float
  - `loadHistorical(range)`: `Promise.all([API.getHistorical(range), API.getEnergyHistory(range)])`
  - `loadEnergyTdl(rows)`: panggil render energi filtered + TDL
  - HAPUS semua chart instance eager (suhuChart, kelembabanChart, dll) — semua via getOrCreate
  - HAPUS `loadMonthly()` — tidak diperlukan setelah Grafik tab dihapus
  - HAPUS render functions untuk bulanan charts
  - Ekspos: `window.Dashboard.Charts = Charts`

---

### Task 8: Hapus ui/grafik.js

**Files:**
- Delete: `js/grafik.js` (lama)
- Delete: `js/ui/grafik.js` (tidak dibuat — tidak ada)

- [ ] **Step 1: Hapus file yang tidak perlu**
  - `Remove-Item js/grafik.js` (file lama)
  - Tidak perlu buat grafik.js baru — Grafik tab dihapus

---

### Task 9: ui/config-tab.js — Topic split, WiFi disabled, module

**Files:**
- Modify: `js/ui/config-tab.js` (pindah ke `js/ui/config-tab.js`)

**Interfaces:**
- Consumes: `MQTTClient`, `Notification`
- Produces: `ConfigTab` with `{ onModeACChange, sendACCommand, onModeESPChange, startCapture, confirmCapture, bindCaptureResult, sendWifiConfig }`

- [ ] **Step 1: Buat `js/ui/config-tab.js`**
  - `onModeACChange()`: publish ke `AC_MODE` topic, pakai `.catch()` dengan Notification.error()
  - `sendACCommand(cmd)`: publish ke `AC_COMMAND` topic (BUKAN `CAPTURE_CONFIRM`), error handling
  - `onModeESPChange()`: toggle class `hidden` di `#ir-section` (jangan inline style)
  - `startCapture()`: publish ke `CAPTURE` topic dengan button + temperature
  - `confirmCapture()`: validasi `#capture-result` tidak kosong, publish ke `CAPTURE_CONFIRM`
  - `bindCaptureResult()`: register handler `CAPTURE_RESULT`, update textarea + status
  - `sendWifiConfig()`: hanya `Notification.info("Fitur WiFi config belum tersedia")` — KOMENTAR di kode: `// TODO: implement secure WiFi config via ESP AP mode`
  - Ekspos: `window.Dashboard.ConfigTab = ConfigTab`

---

### Task 10: index.html — data-*, hapus grafik tab

**Files:**
- Modify: `index.html`
- Note: update class names sesuai CSS semantic names, hapus semua onclick/onchange

- [ ] **Step 1: Ubah navigasi tab — hapus Grafik**
  ```html
  <!-- Sebelum: 3 tab -->
  <button class="nav-tab" onclick="switchTab('monitoring')">Monitoring</button>
  <button class="nav-tab" onclick="switchTab('grafik')">Grafik</button>
  <button class="nav-tab" onclick="switchTab('config')">Config</button>

  <!-- Sesudah: 2 tab -->
  <button class="nav-tab" data-tab="monitoring">Monitoring</button>
  <button class="nav-tab" data-tab="config">Config</button>
  ```

- [ ] **Step 2: Hapus seluruh `#tab-grafik` content section**
  - Hapus `<div id="tab-grafik" class="tab-content hidden">...</div>` dan semua isinya

- [ ] **Step 3: Ubah semua class card ke semantic name**
  - `.card-blue` → `.card-daya`
  - `.card-teal` → `.card-energi`
  - `.card-purple` → `.card-thi`
  - `.card-pink` → `.card-cop`
  - `.card-green` → `.card-suhu`
  - `.card-orange` → `.card-kelembaban`
  - `.card-red` → `.card-pir`
  - `.card-dark` → `.card-ac`
  - Tambah class `.card` pada setiap card

- [ ] **Step 4: Ubah filter buttons ke data-* attributes**
  - `.period-filter-btn[onclick="setEnergyTdlFilter('daily', this)"]` → `.filter-btn--period[data-filter-energy="daily"]`
  - `.period-filter-btn[onclick="setEnergyTdlFilter('weekly', this)"]` → `.filter-btn--period[data-filter-energy="weekly"]`
  - class `.period-filter-btn` → `.filter-btn--period`

- [ ] **Step 5: Ubah AC/ESP toggle ke data-* attributes**
  - `onchange="onModeACChange()"` → `data-toggle="ac-mode"`
  - `onchange="onModeESPChange()"` → `data-toggle="esp-mode"`

- [ ] **Step 6: Ubah AC buttons ke data-* attributes**
  - `onclick="sendACCommand('on')"` → `data-ac-cmd="on"`
  - `onclick="sendACCommand('off')"` → `data-ac-cmd="off"`

- [ ] **Step 7: Ubah capture buttons ke data-* attributes**
  - `onclick="startCapture()"` → `data-capture="start"`
  - `onclick="confirmCapture()"` → `data-capture="confirm"`
  - `onclick="sendWifiConfig()"` → `data-wifi="send"`

- [ ] **Step 8: Hapus inline styles — pindah ke class**
  - `style="display:none"` → class `hidden`
  - `style="opacity:0.4;pointer-events:none"` → class `hidden`
  - `style="display:inline-block"` → class (atau biarkan)

- [ ] **Step 9: Update script src paths**
  ```html
  <script src="js/core/config.js"></script>
  <script src="js/core/helpers.js"></script>
  <script src="js/core/mqtt.js"></script>
  <script src="js/core/api.js"></script>
  <script src="js/ui/notification.js"></script>
  <script src="js/ui/monitoring.js"></script>
  <script src="js/ui/charts.js"></script>
  <script src="js/ui/config-tab.js"></script>
  <script src="js/app.js"></script>
  ```

---

### Task 11: app.js — Event delegation, Page Visibility, -grafik

**Files:**
- Modify: `js/app.js`
- Note: implementasi baru tanpa kode grafik

- [ ] **Step 1: Buat `js/app.js` baru**
  - Module scope: `pollTimer`, `energyTdlRange`
  - `init()`: panggil `MQTTClient.connect()`, `Monitoring.bindMQTT()`, `ConfigTab.bindCaptureResult()`, register `MQTTClient.onConnectionChange()` untuk update indicator `#mqtt-status`, start polling, `bindEvents()`
  - `bindEvents()`: event delegation untuk:
    - `.nav [data-tab]` → click → `switchTab()`
    - `[data-filter-energy]` parent → click → `loadEnergyTdl()`
    - `[data-toggle="ac-mode"]` → change → `ConfigTab.onModeACChange`
    - `[data-toggle="esp-mode"]` → change → `ConfigTab.onModeESPChange`
    - `[data-ac-cmd]` parent → click → `ConfigTab.sendACCommand()`
    - `[data-capture]` parent → click → `ConfigTab.startCapture()` atau `ConfigTab.confirmCapture()`
    - `[data-wifi]` → click → `ConfigTab.sendWifiConfig`
  - `switchTab(name)`: toggle `.hidden` + `.active` — hanya monitoring dan config
  - `loadEnergyTdl(range, btn)`: toggle active class, update title, panggil API + Charts
  - `startPolling()`: `setInterval` setiap 60s panggil `Charts.loadHistorical()`, plus Page Visibility API (pause/resume)
  - Ekspos: `window.Dashboard.switchTab = switchTab; window.Dashboard.loadEnergyTdl = loadEnergyTdl;`
  - Boot: `document.addEventListener("DOMContentLoaded", init)`

---

### Task 12: Final test & verify

- [ ] **Step 1: Verifikasi struktur file**
  - Semua file ada di path yang benar
  - Tidak ada file js/ lama yang masih di-refer

- [ ] **Step 2: Buka index.html di browser**
  - Pastikan tidak ada error di console
  - Pastikan tab Monitoring dan Config berfungsi
  - Pastikan card menampilkan data (MQTT + API)

- [ ] **Step 3: Commit**
  - `git add -A`
  - `git commit -m "refactor: modular restructure + security fixes + grafik tab removal"`
