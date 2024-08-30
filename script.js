document.addEventListener('DOMContentLoaded', function() {
    const pasteArea = document.getElementById('pasteArea');
    const pasteButton = document.getElementById('pasteButton');
    const salesData = document.getElementById('salesData').querySelector('tbody');
    const duplicateTotalCGR = document.getElementById('duplicateTotalCGR');
    const copyButton = document.getElementById('copyButton');

    pasteButton.addEventListener('click', function() {
        const pastedData = pasteArea.value.replace(/\r\n|\r|\n/g, '\n').trim(); // Normalize newlines to LF and trim the data
        const rows = pastedData.split('\n');

        salesData.innerHTML = ''; // Clear any existing rows

        rows.forEach((row) => {
            const cells = row.split('\t').map(cell => cell.trim()); // Split by tab and trim spaces

            const tr = document.createElement('tr');
            cells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });

            // Extra columns (Identifier and WM/PPV) logic here
            appendExtraColumns(cells, tr);
            salesData.appendChild(tr);
        });

        calculateSales(); // Call to calculate and update sales figures
        triggerPulse(); // Visual feedback for update
    });

    function appendExtraColumns(cells, tr) {
        // Identifier logic
        const identifierCell = document.createElement('td');
        identifierCell.textContent = cells[4].split(' ')[0]; // Assuming identifier is the first word in the Details column
        tr.appendChild(identifierCell);

        // WM/PPV logic
        const amount1 = parseFloat(cells[1].replace(/[^0-9.-]+/g, ''));
        const wmPpvCell = document.createElement('td');
        wmPpvCell.textContent = determineWMPPV(amount1);
        tr.appendChild(wmPpvCell);
    }

    function determineWMPPV(amount) {
        const decimalPart = amount.toString().split('.')[1] || '00';
        if (decimalPart.endsWith('98')) return 'WM';
        if (decimalPart.startsWith('9')) return 'PPV';
        return '-';
    }

    function calculateSales() {
        let messageSales = 0, tipSales = 0, wmSales = 0, ppvSales = 0, postSales = 0;
        document.querySelectorAll('#salesData tr').forEach(row => {
            const amount3 = parseFloat(row.cells[3].textContent);
            const identifier = row.cells[5].textContent;
            const wmPpv = row.cells[6].textContent;

            switch (identifier) {
                case 'Payment':
                    if (wmPpv === '-') messageSales += amount3;
                    else if (wmPpv === 'WM') wmSales += amount3;
                    else if (wmPpv === 'PPV') ppvSales += amount3;
                    break;
                case 'Tip':
                    tipSales += amount3;
                    break;
                case 'Post':
                    postSales += amount3;
                    break;
            }
        });

        updateUI(messageSales, tipSales, wmSales, ppvSales, postSales);
    }

    function updateUI(message, tip, wm, ppv, post) {
        document.getElementById('messageSales').textContent = message.toFixed(2);
        document.getElementById('tipSales').textContent = tip.toFixed(2);
        document.getElementById('wmSales').textContent = wm.toFixed(2);
        document.getElementById('ppvSales').textContent = ppv.toFixed(2);
        document.getElementById('postSales').textContent = post.toFixed(2);
        document.getElementById('totalCGR').textContent = (message + tip).toFixed(2);
        document.getElementById('totalNonCGR').textContent = (wm + ppv + post).toFixed(2);
        document.getElementById('totalSales').textContent = (message + tip + wm + ppv + post).toFixed(2);
        duplicateTotalCGR.textContent = (message + tip).toFixed(2);
    }

    function triggerPulse() {
        duplicateTotalCGR.classList.add('pulsing');
        setTimeout(() => duplicateTotalCGR.classList.remove('pulsing'), 3000);
    }

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(duplicateTotalCGR.textContent)
            .then(() => alert('Copied to clipboard!'))
            .catch(err => alert('Failed to copy!'));
    });
});
