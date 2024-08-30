document.addEventListener('DOMContentLoaded', function() {
    const pasteArea = document.getElementById('pasteArea');
    const pasteButton = document.getElementById('pasteButton');
    const resetButton = document.getElementById('resetButton');
    const salesData = document.getElementById('salesData').querySelector('tbody');
    const duplicateTotalCGR = document.getElementById('duplicateTotalCGR');
    const copyButton = document.getElementById('copyButton');

    pasteButton.addEventListener('click', function() {
        const pastedData = pasteArea.value.trim();
        const rows = pastedData.split('\n').map(row => row.trim());
        
        salesData.innerHTML = ''; // Clear any existing rows

        rows.forEach((row) => {
            // Split by tab, trim each cell, and filter out empty cells
            const cells = row.split('\t').map(cell => cell.trim()).filter(cell => cell !== '');
            
            if (cells.length < 5) return; // Skip rows with insufficient data

            const tr = document.createElement('tr');

            // Add original data cells
            cells.forEach((cell, index) => {
                if (index < 5) { // Only add the first 5 columns
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                }
            });

            // Generate Identifier (I) column
            const details = cells[4] || '';
            const identifierCell = document.createElement('td');
            let identifier = "-";
            const firstSpace = details.indexOf(' ');
            if (firstSpace !== -1) {
                identifier = details.substring(0, firstSpace);
            }
            identifierCell.textContent = identifier;
            identifierCell.style.display = 'none'; // Hide this column
            tr.appendChild(identifierCell);

            // Generate WM/PPV (J) column based on Amount 1
            const amount1Text = cells[1]?.replace(/[^0-9.-]+/g, "") || '';
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
            wmPpvCell.style.display = 'none'; // Hide this column
            tr.appendChild(wmPpvCell);

            salesData.appendChild(tr);
        });

        calculateSales();
        triggerPulse();
    });

    function calculateSales() {
        let messageSales = 0;
        let tipSales = 0;
        let wmSales = 0;
        let ppvSales = 0;
        let postSales = 0;

        const rows = salesData.querySelectorAll('tr');

        rows.forEach(row => {
            const amount3 = parseFloat(row.cells[3]?.textContent.replace(/[^0-9.-]+/g, "")) || 0;
            const identifier = row.cells[5]?.textContent;
            const wmPpv = row.cells[6]?.textContent;

            if (identifier === 'Payment' && wmPpv === '-') {
                messageSales += amount3;
            } else if (identifier === 'Tip') {
                tipSales += amount3;
            } else if (identifier === 'Payment' && wmPpv === 'WM') {
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

        updateDisplays(messageSales, tipSales, totalCGR, wmSales, ppvSales, postSales, totalNonCGR, totalSales);
    }

    function updateDisplays(messageSales, tipSales, totalCGR, wmSales, ppvSales, postSales, totalNonCGR, totalSales) {
        document.getElementById('messageSales').innerText = messageSales.toFixed(2);
        document.getElementById('tipSales').innerText = tipSales.toFixed(2);
        document.getElementById('totalCGR').innerText = totalCGR.toFixed(2);
        document.getElementById('wmSales').innerText = wmSales.toFixed(2);
        document.getElementById('ppvSales').innerText = ppvSales.toFixed(2);
        document.getElementById('postSales').innerText = postSales.toFixed(2);
        document.getElementById('totalNonCGR').innerText = totalNonCGR.toFixed(2);
        document.getElementById('totalSales').innerText = totalSales.toFixed(2);
        duplicateTotalCGR.innerText = totalCGR.toFixed(2);
    }

    function triggerPulse() {
        const cgrSection = document.querySelector('.duplicate-total-cgr-section');
        cgrSection.classList.add('pulsing');
        setTimeout(() => {
            cgrSection.classList.remove('pulsing');
        }, 3000);
    }

    copyButton.addEventListener('click', function() {
        const totalCGRText = duplicateTotalCGR.innerText;
        navigator.clipboard.writeText(totalCGRText).then(() => {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerText = 'Copied to clipboard!';
            
            const duplicateSection = document.querySelector('.duplicate-total-cgr-section');
            duplicateSection.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => duplicateSection.removeChild(notification), 500);
            }, 3000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    resetButton.addEventListener('click', function() {
        location.reload();
    });
});
