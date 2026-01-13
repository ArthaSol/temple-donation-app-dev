function renderAdd() {
  view.innerHTML = `
    <div class="card">
      <h3>Add Donation Entry</h3>

      <label>Date</label>
      <input id="e_date" placeholder="DD.MM.YY">

      <label>Denomination</label>
      <select id="e_denom">
        <option value="100000">100000</option>
        <option value="50000">50000</option>
        <option value="25000">25000</option>
        <option value="10000">10000</option>
        <option value="5000">5000</option>
        <option value="1000">1000</option>
        <option value="500">500</option>
        <option value="200">200</option>
        <option value="100">100</option>
      </select>

      <label>Serial No</label>
      <input id="e_sl">

      <label>Receipt No</label>
      <input id="e_receipt">

      <label>Name & Address</label>
      <textarea id="e_name"></textarea>

      <button class="primary" onclick="saveEntry()">Save Entry</button>
    </div>
  `;
}

function saveEntry() {
  const date = e_date.value.trim();
  const denom = Number(e_denom.value);
  const sl = e_sl.value.trim();
  const receipt = e_receipt.value.trim();
  const name = e_name.value.trim() || "TO BE UPDATED";

  if (!date || !sl) {
    alert("Date and Serial No are required");
    return;
  }

  state.entries.push({
    date: date,
    denomination: denom,
    slNo: sl || "",
    receiptNo: receipt || "",
    nameAddress: name,
    amount: denom,
    status: "ACTIVE"
  });

  saveState();
  alert("Entry added");
  nav("entries");
}

function renderEntries() {
  if (!state.entries.length) {
    view.innerHTML = "<p>No entries</p>";
    return;
  }

  let html = `<div class="card"><h3>Entries</h3>`;

  state.entries.forEach((e, i) => {
    html += `
      <div style="border-bottom:1px solid #ccc; padding:6px 0">
        <b>${e.date}</b> | ₹${e.amount} <br>
        ${e.nameAddress}<br>
        <small>Denom: ${e.denomination} | Sl: ${e.slNo || "-"}</small><br>
        <small>Status: ${e.status}</small><br>
        ${e.status === "ACTIVE" ? `<button onclick="reverseEntry(${i})">Reverse</button>` : ""}
      </div>
    `;
  });

  html += `</div>`;
  view.innerHTML = html;
}

function reverseEntry(index) {
  const reason = prompt("Reason for reversal?");
  if (!reason) return;

  state.entries[index].status = "REVERSED";
  state.entries[index].reversedReason = reason;

  saveState();
  alert("Entry reversed");
  nav("entries");
}