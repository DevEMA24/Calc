document.addEventListener('DOMContentLoaded', function() {
    const pasteArea = document.getElementById('pasteArea');
    const pasteButton = document.getElementById('pasteButton');
    const salesData = document.getElementById('salesData').querySelector('tbody');
    const duplicateTotalCGR = document.getElementById('duplicateTotalCGR');
    const copyButton = document.getElementById('copyButton');

    function cleanInput(input) {
        return input.replace(/[^\x20-\x7E]/g, '').trim(); // Remove non-printable characters and trim
    }

    pasteButton.addEventListener('click', function() {
        const pastedData = pasteArea.value.trim();
        const rows = pastedData.split('\n').filter(row => row.trim() !== ''); // Filter out empty rows

        salesData.innerHTML = ''; // Clear existing rows

        rows.forEach(row => {
            const cells = row.split('\t').map(cell => cleanInput(cell)); // Clean each cell

            if (cells.length < 5) {
                console.log('Skipping malformed row:', cells);
                return; // Skip rows with insufficient data
            }

            const tr = document.createElement('tr');
            cells.forEach((cell, index) => {
                if (index < 5) { // Only process the first five columns
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                }
            });

            // Append custom columns if necessary
            appendCustomColumns(tr, cells);
            salesData.appendChild(tr);
        });

        calculateSales();
        triggerPulse();
    });

    function appendCustomColumns(tr, cells) {
        const identifierCell = document.createElement('td');
        const details = cells[4];
        const firstWord = details.split(' ')[0];
        identifierCell.textContent = firstWord;
        tr.appendChild(identifierCell);

        const wmPpvCell = document.createElement('td');
        const amount1 = cells[1].replace(/[^0-9.-]/g, '');
        const decimalPart = amount1.split('.')[1] || '';
        wmPpvCell.textContent = ['98'].includes(decimalPart) ? 'WM' : (['90', '91', '92', '93', '94', '95', '96', '97', '99'].includes(decimalPart) ? 'PPV' : '-');
        tr.appendChild(wmPpvCell);
    }

    function calculateSales() {
        let messageSales = 0, tipSales = 0, wmSales = 0, ppvSales = 0, postSales = 0;
        salesData.querySelectorAll('tr').forEach(tr => {
            const amount3 = parseFloat(tr.cells[3].textContent) || 0;
            const identifier = tr.cells[5].textContent;
            const wmPpv = tr.cells[6].textContent;

            if (identifier === 'Payment' && wmPpv === '-') messageSales += amount3;
            if (identifier === 'Tip') tipSales += amount3;
            if (identifier === 'Payment' && wmPpv === 'WM') wmSales += amount3;
            if (identifier === 'Payment' && wmPpv === 'PPV') ppvSales += amount3;
            if (identifier === 'Post') postSales += amount3;
        });

        const totalCGR = messageSales + tipSales;
        const totalNonCGR = wmSales + ppvSales + postSales;
        updateDisplay(totalCGR, totalNonCGR);
    }

    function updateDisplay(totalCGR, totalNonCGR) {
        const totalSales = totalCGR + totalNonCGR;
        document.getElementById('messageSales').textContent = totalCGR.toFixed(2);
        document.getElementById('totalNonCGR').textContent = totalNonCGR.toFixed(2);
        document.getElementById('totalSales').textContent = totalSales.toFixed(2);
        duplicateTotalCGR.textContent = totalCGR.toFixed(2);
    }

    function triggerPulse() {
        const cgrSection = document.querySelector('.duplicate-total-cgr-section');
        cgrSection.classList.add('pulsing');
        setTimeout(() => cgrSection.classList.remove('pulsing'), 3000);
    }

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(duplicateTotalCGR.textContent).then(() => {
            alert('Copied to clipboard!');
        }, err => console.error('Failed to copy text: ', err));
    });

    resetButton.addEventListener('click', () => window.location.reload());
});
