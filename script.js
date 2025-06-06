function addItem() {
    const table = document.getElementById("itemsTable");
    const row = table.insertRow();
    row.innerHTML = `
        <td><textarea class="form-control description" rows="5" placeholder="description..."></textarea></td>
        <td><input type="number" class="form-control amount" oninput="updateTotal()"></td>
        <td><button class="btn btn-danger btn-sm no-print" onclick="removeItem(this)">X</button></td>
    `;
}

function removeItem(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotal();
}

function updateTotal() {
    let total = 0;
    document.querySelectorAll(".amount").forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    document.getElementById("totalAmount").textContent = total.toFixed(2);
}


function generatePDF() {
    const element = document.getElementById("invoice");
    html2pdf()
        .set({
            margin: 10,
            filename: 'invoice.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, scrollY: 0, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(element)
        .save();
}


function generatePDF() {
    if (!validateForm()) {
        alert("Please fill in all required fields before generating the PDF.");
        return;
    }

    const clientName = document.getElementById("clientName").value.trim().replace(/\s+/g, "_");
    const invoiceDate = document.getElementById("invoiceDate").value.trim();
    const fileName = `invoice_${invoiceDate}_${clientName}.pdf`;

    // Ocultar botones antes de generar el PDF
    const buttons = document.querySelectorAll(".no-print");
    buttons.forEach(button => button.style.display = "none");

    // const element = document.getElementById("invoice");
    const element = cloneInvoiceWithValues();

    html2pdf()
        .set({
            margin: 10, // Márgenes mínimos
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, scrollY: 0, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(element)
        .toPdf()
        .get('pdf')
        .then(function (pdf) {
            // Ajustar automáticamente la altura del documento
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setDrawColor(0);
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 280, 210, 297, 'F');
            }
        })
        .save()
        .then(() => {
            // Restaurar botones después de generar el PDF
            buttons.forEach(button => button.style.display = "block");
        });
}

function validateForm() {
    const requiredFields = [
        document.getElementById("clientName").value.trim(),
        // document.getElementById("clientAddress").value.trim(),
        document.getElementById("invoiceDate").value.trim(),
        document.getElementById("invoiceNo").value.trim(),
        // document.getElementById("customerId").value.trim(),
        // document.getElementById("jobDescription").value.trim(),
    ];

    // Verifica si hay al menos un ítem en la tabla
    const items = document.querySelectorAll(".description");
    const amounts = document.querySelectorAll(".amount");
    
    if (requiredFields.includes("") || items.length === 0) {
        return false;
    }

    // Asegurar que cada ítem tiene una descripción y un monto válido
    for (let i = 0; i < items.length; i++) {
        if (items[i].value.trim() === "" || parseFloat(amounts[i].value) <= 0 || isNaN(parseFloat(amounts[i].value))) {
            return false;
        }
    }

    return true;
}


function cloneInvoiceWithValues() {
    const clone = document.getElementById("invoice").cloneNode(true);

    // Reemplazar todos los inputs por sus valores
    clone.querySelectorAll("input").forEach(input => {
        const span = document.createElement("span");
        span.textContent = input.value;
        input.parentNode.replaceChild(span, input);
    });

    // Reemplazar textareas por sus valores
    clone.querySelectorAll("textarea").forEach(textarea => {
        const div = document.createElement("div");
        div.innerHTML = textarea.value.replace(/\n/g, "<br>"); // Reemplaza saltos de línea por <br>
        textarea.parentNode.replaceChild(div, textarea);
    });

    return clone;
}