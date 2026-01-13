const state = {
  ledgerLoaded: false,
  entries: []
};
loadState();
function nav(page) {
  if (page === "home") renderHome();
  if (page === "add") renderAdd();
  if (page === "entries") renderEntries();
  if (page === "reports") renderReports();
  if (page === "backup") renderBackup();
}

function renderHome() {
  view.innerHTML = `
    <div class="card">
      <h3>Status</h3>
      <p>${state.ledgerLoaded ? "Ledger loaded • Offline" : "No ledger loaded"}</p>
      <input type="file" accept=".xlsx" onchange="importExcel(event)">
    </div>
  `;
}

function renderBackup() {
  view.innerHTML = `
    <div class="card">
      <h3>Backup / Handover</h3>

      <button class="primary" onclick="exportExcel()">Export Excel</button>

      <hr>

      <button onclick="resetLedger()">Reset Ledger</button>
      <p style="color:#a00;font-size:12px">
        Reset clears data only from this device.
        Export Excel before resetting.
      </p>
    </div>
  `;
}

nav("home");