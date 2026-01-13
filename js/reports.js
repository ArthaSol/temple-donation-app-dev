// =====================================================
// REPORTS MODULE — FINAL, DATA-SAFE, AUDIT-READY
// =====================================================

function renderReports() {
  if (!state.entries.length) {
    view.innerHTML = "<p>No data available for reports.</p>";
    return;
  }

  view.innerHTML = `
    <div class="card">
      <h3>Reports</h3>

      <label>From Date (DD.MM.YYYY)</label>
      <input id="r_from" placeholder="01.01.2025">

      <label>To Date (DD.MM.YYYY)</label>
      <input id="r_to" placeholder="31.12.2025">

      <button class="primary" onclick="generateFullReport()">Generate Full PDF</button>
    </div>
  `;
}

// -----------------------------------------------------

function generateFullReport() {
  const fromDate = r_from.value ? parseForFilter(r_from.value) : null;
  const toDate = r_to.value ? parseForFilter(r_to.value) : null;

  const filtered = state.entries.filter(e => {
    const d = parseForFilter(e.date);
    if (!d) return false;
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });

  if (!filtered.length) {
    alert("No entries in selected range");
    return;
  }

  generatePDF(filtered);
}

// =====================================================
// PDF GENERATION — LEDGER / TYPEWRITER FORMAT
// =====================================================

function generatePDF(entries) {
  const { jsPDF } = jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFont("courier", "normal");
  const RUPEE = "Rs.";

  // ---------------- TITLE ----------------
  doc.setFontSize(14);
  doc.text(
    "LIST OF DONARS FOR THE CONSTRUCTION OF\n" +
    "SRI VENKATESWRA SWAMY TEMPLE,\n" +
    "YANAM – 533464",
    105,
    15,
    { align: "center" }
  );

  let startY = 32;
  let grandTotal = 0;

  // -------- GROUP BY DENOMINATION --------
  const grouped = {};
  entries.forEach(e => {
    const key = String(e.denomination || e.amount || "");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .forEach(denom => {

      doc.setFontSize(11);
      doc.text(`DENOMINATION : ${RUPEE} ${denom}`, 10, startY);
      startY += 4;

      let subTotal = 0;

      const body = grouped[denom].map(e => {
        subTotal += Number(e.amount);
        grandTotal += Number(e.amount);

        // -------- SAFE NAME & ADDRESS NORMALIZATION --------
        const cleanNameAddress = (e.nameAddress || "")
          // Replace ONLY the rupee symbol (no deletion)
          .replace(/₹/g, "Rs.")
          // Normalize whitespace
          .replace(/\s+/g, " ")
          .trim();

        return [
          normalizeDate(e.date),
          e.slNo || "",
          cleanNameAddress,
          e.receiptNo || "",
          Number(e.amount).toLocaleString()
        ];
      });

      // -------- SUBTOTAL ROW --------
      body.push([
        "",
        "",
        "SUBTOTAL",
        "",
        subTotal.toLocaleString()
      ]);

      doc.autoTable({
        startY: startY + 2,
        theme: "grid",

        styles: {
          font: "courier",
          fontSize: 10,
          textColor: 0,
          lineColor: 0,
          lineWidth: 0.3,
          cellPadding: 3,
          valign: "top"
        },

        headStyles: {
          fillColor: [210, 210, 210],
          fontStyle: "bold",
          lineWidth: 0.4
        },

        // -------- PER-COLUMN BEHAVIOR (STABLE) --------
        columnStyles: {
          0: { cellWidth: 32, halign: "center", overflow: "hidden" }, // Date
          1: { cellWidth: 14, halign: "center", overflow: "hidden" }, // Sl.No
          2: { cellWidth: 82, overflow: "linebreak" },               // Name & Address
          3: { cellWidth: 26, halign: "center", overflow: "hidden" }, // Receipt No
          4: { cellWidth: 28, halign: "right", overflow: "hidden" }   // Amount
        },

        head: [[
          "Date",
          "Sl.No",
          "Name & Address",
          "Receipt No",
          "Amount (Rs.)"
        ]],

        body,

        didParseCell: function (data) {
          if (data.row.index === body.length - 1) {
            data.cell.styles.fontStyle = "bold";
          }
        }
      });

      startY = doc.lastAutoTable.finalY + 8;
    });

  // -------- GRAND TOTAL --------
  doc.setFontSize(12);
  doc.text(
    `TOTAL AMOUNT : ${RUPEE} ${grandTotal.toLocaleString()}`,
    190,
    startY,
    { align: "right" }
  );

  doc.save("Temple_Donation_Report.pdf");
}

// =====================================================
// DATE NORMALIZATION — SINGLE SOURCE OF TRUTH
// =====================================================

function normalizeDate(value) {
  if (!value) return "";

  // Excel serial number
  if (typeof value === "number") {
    const epoch = new Date(1899, 11, 30);
    return formatDDMMYYYY(new Date(epoch.getTime() + value * 86400000));
  }

  // DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return value;

  // DD.MM.YY → expand year
  if (/^\d{2}\.\d{2}\.\d{2}$/.test(value)) {
    let [d, m, y] = value.split(".");
    return `${d}.${m}.${Number(y) <= 49 ? "20" + y : "19" + y}`;
  }

  // Timestamp / ISO date
  const d = new Date(value);
  return isNaN(d) ? "" : formatDDMMYYYY(d);
}

function formatDDMMYYYY(d) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${d.getFullYear()}`;
}

// Used ONLY for date range filtering
function parseForFilter(value) {
  const s = normalizeDate(value);
  if (!s) return null;
  const [d, m, y] = s.split(".");
  return new Date(y, m - 1, d);
}