// ======================================
// EXCEL IMPORT / EXPORT / RESET (FINAL)
// ======================================

function importExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: "binary" });

    state.entries = [];

    workbook.SheetNames.forEach(sheetName => {
      // Sheet name = denomination (e.g. 100, 1000, 100000)
      const denomination = Number(sheetName.replace(/,/g, ""));
      if (isNaN(denomination)) return;

      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      rows.forEach(row => {
        // Skip headers / junk rows
        if (
          !row["Date"] ||
          String(row["Sl.No"]).toUpperCase().includes("SL") ||
          String(row["Name & Address"]).toUpperCase() === "NAME"
        ) {
          return;
        }

        const safeSlNo =
          row["Sl.No"] === undefined ||
          row["Sl.No"] === null ||
          String(row["Sl.No"]).toLowerCase() === "undefined"
            ? ""
            : String(row["Sl.No"]);

        const safeReceiptNo =
          row["Receipt No"] === undefined ||
          row["Receipt No"] === null ||
          String(row["Receipt No"]).toLowerCase() === "undefined"
            ? ""
            : String(row["Receipt No"]);

        state.entries.push({
          date: String(row["Date"]),
          denomination: denomination,
          slNo: safeSlNo,
          receiptNo: safeReceiptNo,
          nameAddress: row["Name & Address"] || "TO BE UPDATED",
          amount: Number(row["Amount"]) || denomination,
          status: "ACTIVE"
        });
      });
    });

    state.ledgerLoaded = true;
    saveState();
    alert("Ledger imported successfully");
    nav("home");
  };

  reader.readAsBinaryString(file);
}

// ======================================
// EXPORT UPDATED EXCEL (CLEAN)
// ======================================

function exportExcel() {
  if (!state.entries.length) {
    alert("No data to export");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Group entries by denomination
  const groups = {};
  state.entries.forEach(e => {
    if (!groups[e.denomination]) groups[e.denomination] = [];
    groups[e.denomination].push(e);
  });

  Object.keys(groups)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(denom => {
      const data = groups[denom].map(e => ({
        "Date": formatDate(e.date),
        "Sl.No": e.slNo || "",
        "Name & Address": e.nameAddress || "TO BE UPDATED",
        "Receipt No": e.receiptNo || "",
        "Amount": Number(e.amount) || Number(denom)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, String(denom));
    });

  XLSX.writeFile(wb, "Temple_Donation_Updated.xlsx");
}

// ======================================
// RESET LEDGER (SAFE, EXPLICIT)
// ======================================

function resetLedger() {
  const c1 = confirm("This will clear the ledger from this device. Continue?");
  if (!c1) return;

  const c2 = confirm("Have you exported the Excel backup?");
  if (!c2) return;

  localStorage.removeItem("temple_entries");
  state.entries = [];
  state.ledgerLoaded = false;

  alert("Ledger cleared. You can import a new file.");
  nav("home");
}
function formatDate(value) {
  if (!value) return "";

  // If already in DD.MM.YYYY
  if (typeof value === "string" && value.includes(".")) {
    return value;
  }

  const d = new Date(value);
  if (isNaN(d)) return String(value);

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${dd}.${mm}.${yyyy}`;
}