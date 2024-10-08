document.addEventListener('DOMContentLoaded', function() {
    const pasteArea = document.getElementById('pasteArea');
    const pasteButton = document.getElementById('pasteButton');
    const resetButton = document.getElementById('resetButton');
    const salesData = document.getElementById('salesData').querySelector('tbody');
    const duplicateTotalCGR = document.getElementById('duplicateTotalCGR');
    const copyButton = document.getElementById('copyButton');

    pasteButton.addEventListener('click', function() {
        const pastedData = pasteArea.value.trim();
        const rows = pastedData.split('\n');
        
        salesData.innerHTML = ''; // Clear any existing rows

        rows.forEach((row) => {
            // Split by tab, but limit to 5 splits to keep the description intact
            const cells = row.split('\t', 5);
            const tr = document.createElement('tr');

            // Trim each cell and remove any trailing tabs, carriage returns, or line feeds
            cells.forEach((cell, index) => {
                const td = document.createElement('td');
                td.textContent = cell.trim().replace(/[\t\r\n]+$/, '');
                tr.appendChild(td);
            });

            // Generate Identifier (I) column
            const details = cells[4]?.trim().replace(/[\t\r\n]+$/, '');
            const identifierCell = document.createElement('td');
            let identifier = "-";
            if (details) {
                const firstSpaceIndex = details.indexOf(" ");
                if (firstSpaceIndex !== -1) {
                    identifier = details.substring(0, firstSpaceIndex);
                }
            }
            identifierCell.textContent = identifier;
            tr.appendChild(identifierCell);

            // Generate WM/PPV (J) column based on Amount 1
            const amount1Text = cells[1]?.trim().replace(/[^0-9.-]+/g, "");
            const wmPpvCell = document.createElement('td');
            let wmPpv = "-";

            if (identifier === "Payment" && amount1Text) {
                const decimalPart = amount1Text.split('.')[1] || "00";
                if (decimalPart === "98") {
                    wmPpv = "WM";
                } else if (["90", "91", "92", "93", "94", "95", "96", "97", "99"].includes(decimalPart)) {
                    wmPpv = "PPV";
                }
            }

            wmPpvCell.textContent = wmPpv;
            tr.appendChild(wmPpvCell);

            salesData.appendChild(tr);
        });

        calculateSales(); // Recalculate totals after pasting
        triggerPulse(); // Trigger the pulse effect
    });

    function calculateSales() {
        let messageSales = 0;
        let tipSales = 0;
        let wmSales = 0;
        let ppvSales = 0;
        let postSales = 0;

        const rows = salesData.querySelectorAll('tr');

        rows.forEach(row => {
            const amount3 = parseFloat(row.cells[3]?.textContent.replace(/[^0-9.-]+/g, "")) || 0; // Amount 3
            const identifier = row.cells[5]?.textContent; // Identifier (I)
            const wmPpv = row.cells[6]?.textContent; // WM/PPV (J)

            // Calculate CGR Sales
            if (identifier === 'Payment' && wmPpv === '-') {
                messageSales += amount3;
            }

            // Calculate Tip Sales
            if (identifier === 'Tip') {
                tipSales += amount3;
            }

            // Calculate Non-CGR Sales
            if (identifier === 'Payment' && wmPpv === 'WM') {
                wmSales += amount3;
            } else if (identifier === 'Payment' && wmPpv === 'PPV') {
                ppvSales += amount3;
            } else if (identifier === 'Post') {
                postSales += amount3;
            }
        });

        const totalCGR = messageSales + tipSales;
        const totalNonCGR = wmSales + ppvSales + postSales;
        const totalSales = totalCGR + totalNonCGR;

        // Update the HTML elements with calculated values
        document.getElementById('messageSales').innerText = messageSales.toFixed(2);
        document.getElementById('tipSales').innerText = tipSales.toFixed(2);
        document.getElementById('totalCGR').innerText = totalCGR.toFixed(2);

        document.getElementById('wmSales').innerText = wmSales.toFixed(2);
        document.getElementById('ppvSales').innerText = ppvSales.toFixed(2);
        document.getElementById('postSales').innerText = postSales.toFixed(2);
        document.getElementById('totalNonCGR').innerText = totalNonCGR.toFixed(2);

        document.getElementById('totalSales').innerText = totalSales.toFixed(2);

        // Update the duplicate Total CGR Sales element
        duplicateTotalCGR.innerText = totalCGR.toFixed(2);
    }

    function triggerPulse() {
        const cgrSection = document.querySelector('.duplicate-total-cgr-section');
        cgrSection.classList.add('pulsing');
        setTimeout(() => {
            cgrSection.classList.remove('pulsing');
        }, 3000); // Pulsing effect duration (3 pulses)
    }

    // Copy button functionality
    copyButton.addEventListener('click', function() {
        const totalCGRText = duplicateTotalCGR.innerText;
        navigator.clipboard.writeText(totalCGRText).then(() => {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerText = 'Copied to clipboard!';
            
            // Append the notification within the duplicate Total CGR Sales section
            const duplicateSection = document.querySelector('.duplicate-total-cgr-section');
            duplicateSection.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => duplicateSection.removeChild(notification), 500);
            }, 3000); // Show the notification for 3 seconds
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    // Reset button functionality
    resetButton.addEventListener('click', function() {
        location.reload(); // This will refresh the page
    });
});

const toggleTableButton = document.getElementById('toggleTableButton');
const tableContainer = document.querySelector('.table-container');
const horizontalSections = document.querySelector('.horizontal-sections');
const toggleIcon = document.getElementById('toggleIcon');

toggleTableButton.addEventListener('click', () => {
    const isTableVisible = getComputedStyle(tableContainer).display !== 'none';
    const isSectionsVisible = getComputedStyle(horizontalSections).display !== 'none';

    // Toggle both the table and the horizontal sections
    if (isTableVisible || isSectionsVisible) {
        tableContainer.style.display = 'none';
        horizontalSections.style.display = 'none';
    } else {
        tableContainer.style.display = 'block';
        horizontalSections.style.display = 'flex';
    }

    toggleIcon.classList.toggle('expanded'); // Toggle class for CSS styling
    toggleTableButton.querySelector('span').textContent = isTableVisible || isSectionsVisible ? 'Show Details' : 'Hide Details';
});

