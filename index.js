// ---------------- NAVBAR ----------------
document.querySelector(".navbars").innerHTML = `
  <div class="navbar">
    <div class="logo"><a href="index.html">ABC I/C</a></div>
    <div class="hamburger" id="hamburger">&#9776;</div>
    <ul class="nav-links" id="navLinks">
      <li><a href="wall.html">Wall</a></li>
      <li><a href="celling.html">Celling</a></li>
      <li><a href="flooring.html">Flooring</a></li>
      <li><a href="Electric.html">Electric</a></li>
      <li><a href="waterprofing.html">Waterproofing</a></li>
    </ul>
  </div>
`;

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
  }
});

// ---------------- TABULAR FORMAT & GRAPH ----------------
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".service-form");
  if (!form) return;

  // ---------- CREATE TABLE ----------
  const tableWrapper = document.createElement("div");
  tableWrapper.style.margin = "40px auto";
  tableWrapper.style.width = "90%";
  tableWrapper.style.background = "#fff";
  tableWrapper.style.padding = "20px";
  tableWrapper.style.borderRadius = "8px";
  tableWrapper.innerHTML = `
    <h2 style="text-align:center;margin-bottom:15px;">Submitted Data</h2>
    <table border="1" style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Service Type</th>
          <th>Room</th>
          <th>Problem</th>
          <th>Inspection Comments</th>
          <th>Image</th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
    </table>
  `;
  form.after(tableWrapper);
  const tableBody = document.getElementById("tableBody");

  // ---------- CREATE GRAPH ----------
  const graphWrapper = document.createElement("div");
  graphWrapper.style.width = "90%";
  graphWrapper.style.margin = "40px auto";
  graphWrapper.style.background = "#fff";
  graphWrapper.style.padding = "20px";
  graphWrapper.style.borderRadius = "8px";
  graphWrapper.innerHTML = `
    <h2 style="text-align:center;margin-bottom:15px;">Room-wise Inspection Graph</h2>
    <canvas id="roomChart" height="300"></canvas>
  `;
  tableWrapper.after(graphWrapper);

  const canvas = document.getElementById("roomChart");
  const ctx = canvas.getContext("2d");
  const roomCount = {};

  function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const labels = Object.keys(roomCount);
    const values = Object.values(roomCount);
    if (!labels.length) return;

    const maxValue = Math.max(...values);
    const barWidth = 50;
    const gap = 30;
    const startX = 50;
    const baseY = 250;

    // Dynamically expand canvas width to fit all bars
    canvas.width = Math.max(500, labels.length * (barWidth + gap) + 100);

    ctx.font = "14px Arial";
    labels.forEach((label, index) => {
      const barHeight = (values[index] / maxValue) * 180;
      const x = startX + index * (barWidth + gap);
      const y = baseY - barHeight;

      // Bar
       ctx.font = "16px Arial";   // change size here
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(x, y, barWidth, barHeight);

      // Value
      ctx.fillStyle = "#000";
      ctx.fillText(values[index], x + 15, y - 5);

      // Label
      ctx.font = "9.5px Arial";   // change size here
      ctx.fillText(label, x - 5, baseY + 20);
    });
  }

  // ---------- FORM SUBMIT ----------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const serviceType = document.getElementById("serviceType").value;
    const room = document.getElementById("roomType").value;
    const problem = document.getElementById("problemType").value;
    const comments = document.getElementById("area").value;
    const imageInput = document.getElementById("image");
    const file = imageInput.files[0];

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${serviceType}</td>
      <td>${room}</td>
      <td>${problem}</td>
      <td>${comments}</td>
      <td></td>
    `;

    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        row.cells[4].dataset.imgData = event.target.result; // store image data for PDF
        row.cells[4].textContent = file.name; // display image name in table
      }
      reader.readAsDataURL(file);
    } else {
      row.cells[4].textContent = "No Image";
    }

    tableBody.appendChild(row);

    roomCount[room] = roomCount[room] ? roomCount[room] + 1 : 1;
    drawChart();

    form.reset();
  });

  // ---------- DOWNLOAD PDF BUTTON ----------
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download PDF";
  downloadBtn.style.display = "block";
  downloadBtn.style.margin = "20px auto";
  downloadBtn.style.padding = "12px 25px";
  downloadBtn.style.background = "#2563eb";
  downloadBtn.style.color = "#fff";
  downloadBtn.style.border = "none";
  downloadBtn.style.borderRadius = "5px";
  downloadBtn.style.cursor = "pointer";
  graphWrapper.appendChild(downloadBtn);

  // ---------- DOWNLOAD PDF FUNCTIONALITY ----------
  downloadBtn.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    let y = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    const lineHeight = 18;
    const cellSpacing = 10;

    // PDF TITLE
    pdf.setFontSize(20);
    pdf.text("ABC Interior Solutions - Inspection Report", pageWidth / 2, y, { align: "center" });
    y += 30;

    // ---------------- TABLE ----------------
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    if (rows.length === 0) {
      pdf.setFontSize(14);
      pdf.text("No inspection data submitted yet.", margin, y);
      y += lineHeight;
    } else {
      rows.forEach((row, i) => {
        const cells = row.querySelectorAll("td");
        pdf.setFontSize(12);
        pdf.text(`Entry ${i + 1}`, margin, y);
        y += lineHeight;

        pdf.text(`Service: ${cells[0].textContent}`, margin, y); y += lineHeight;
        pdf.text(`Room: ${cells[1].textContent}`, margin, y); y += lineHeight;
        pdf.text(`Problem: ${cells[2].textContent}`, margin, y); y += lineHeight;
        pdf.text(`Comments: ${cells[3].textContent}`, margin, y); y += lineHeight;

        const imgData = cells[4].dataset.imgData;
        if (imgData) {
          const imgProps = pdf.getImageProperties(imgData);
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          if (y + imgHeight > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
          pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
          y += imgHeight + cellSpacing;
        } else {
          y += cellSpacing;
        }

        if (y > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
      });
    }

    // ---------------- CHART ----------------
    y += 20; // spacing before chart
    pdf.setFontSize(16);
    pdf.text("Room-wise Inspection Graph", pageWidth / 2, y, { align: "center" });
    y += 10;

    // Capture chart
    const chartCanvas = document.getElementById("roomChart");
    const chartImg = chartCanvas.toDataURL("image/png");
    const chartProps = pdf.getImageProperties(chartImg);
    const chartHeight = (chartProps.height * pageWidth) / chartProps.width;

    if (y + chartHeight > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
    pdf.addImage(chartImg, 'PNG', 0, y, pageWidth, chartHeight);

    pdf.save("inspection_report.pdf");
  });
});
