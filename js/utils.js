const view = document.getElementById("view");

// ---- Persistence helpers ----
function saveState() {
  localStorage.setItem("temple_entries", JSON.stringify(state.entries));
}

function loadState() {
  const data = localStorage.getItem("temple_entries");
  if (data) {
    state.entries = JSON.parse(data);
    state.ledgerLoaded = state.entries.length > 0;
  }
}