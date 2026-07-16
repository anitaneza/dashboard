# Agent Notes: Dashboard AC

## Project type
Static browser dashboard (HTML + vanilla JS + CSS). No build tool, no package manager, no tests.

## Run locally
- Open `index.html` directly in a browser.
- Or serve the folder with any static server:
  ```bash
  python -m http.server 8000
  # then open http://localhost:8000
  ```
- If using VS Code Live Server, `.vscode/settings.json` pins the port to `5501`.

## External dependencies
Loaded from CDN in `index.html`:
- `mqtt` (HiveMQ public broker via `wss://broker.hivemq.com:8884/mqtt`)
- `chart.js`
- Google Fonts

Do not assume these are installed locally.

## Backend & data
- Historical data comes from a Google Apps Script endpoint (`CONFIG.APPS_SCRIPT_URL` in `js/config.js`).
- Real-time data and commands use MQTT topics defined in `js/config.js`.
- If the dashboard appears blank or charts never load, check the browser network tab for Apps Script CORS/errors and MQTT connection failures first.

## Code architecture
- `js/config.js` — single source of truth: Apps Script URL, MQTT broker, topic names.
- `js/mqtt.js` — MQTT client wrapper; auto-subscribes to all topics on connect.
- `js/api.js` — fetch wrapper for Google Sheets-backed Apps Script endpoints.
- `js/charts.js` — Chart.js setup for the monitoring tab.
- `js/monitoring.js` — live metric card updates and MQTT handlers.
- `js/grafik.js` — chart rendering for the "Grafik" tab.
- `js/config-tab.js` — config tab UI handlers and command publishing.
- `js/app.js` — entry point: connects MQTT, binds handlers, polls historical data every 60 s.

## Important conventions
- Script load order in `index.html` matters (`config.js` must load first; `app.js` last).
- All JS is global-scope vanilla JS; modules are simple IIFEs (`API`, `MQTTClient`, `Charts`, `Monitoring`).
- Use the `CONFIG.TOPICS` map for any new MQTT topic; do not hard-code topic strings elsewhere.
- Keep UI text in Indonesian; the dashboard language is `id`.
- Several functions are called directly from HTML `onclick` handlers and must remain global: `switchTab`, `setFilter`, `onModeACChange`, `sendACCommand`, `onModeESPChange`, `startCapture`, `confirmCapture`, `sendWifiConfig`, `bindCaptureResult`.

## IR capture flow
- `CAPTURE` — publishes the selected button/temperature to start capturing.
- `CAPTURE_RESULT` — ESP publishes the raw IR code back here; `bindCaptureResult()` displays it.
- `CAPTURE_CONFIRM` — confirms/saves the captured code. `sendACCommand()` also reuses this topic to send ON/OFF/setpoint commands.

## What not to expect
- No lint, formatter, typecheck, or CI config.
- No `package.json`, lockfile, or framework router.
- No automated tests.
