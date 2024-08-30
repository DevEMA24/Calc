document.addEventListener('DOMContentLoaded', function() {
    const pasteArea = document.getElementById('pasteArea');
    const pasteButton = document.getElementById('pasteButton');
    const resetButton = document.getElementById('resetButton');
    const salesData = document.getElementById('salesData').querySelector('tbody');
    const duplicateTotalCGR = document.getElementById('duplicateTotalCGR');
    const copyButton = document.getElementById('copyButton');

    pasteButton.addEventListener('click', function() {
        // Replace CR, LF, and tab characters from the pasted data
        const pastedData = pasteArea.value.replace(/[\r\n\t]+/g, ' ').trim();
        const rows = pastedData.split('\n');

        salesData.innerHTML = ''; // Clear any existing rows

        rows.forEach((row) => {
            // Split cells by whitespace, assuming tabs are replaced with spaces
            const cells = row.split(' ').filter(cell => cell.trim() !== ''); // Ensure no empty cells

            const tr = document.createElement('tr');

            // Process cells and append to row
            cells.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });

            // Generate Identifier (I) and WM/PPV (J) columns dynamically
            const details = cells[4]?.trim();
            const identifierCell = document.createElement('td');
            identifierCell.textContent = details.split(' ')[0];
            tr.appendChild(identifierCell);

            const amount1Text = cells[1]?.replace(/[^0-9.]+/g, '');
            const wmPpvCell = document.createElement('td');
            wmPpvCell.textContent = determineCategory(amount1Text);
            tr.appendChild(wmPpvCell);

            salesData.appendChild(tr);
        });

        calculateSales();
        triggerPulse();
    });

    // Helper function to determine WM/PPV category based on decimal part
    function determineCategory(amountText) {
        const decimalPart = amountText.split('.')[1] || "00";
        if (decimalPart === "98") return "WM";
        if (["90", "91", "92", "93", "94", "95", "96", "97", "99"].includes(decimalPart)) return "PPV";
        return "-";
    }

    function calculateSales() {
        let messageSales = 0, tipSales = 0, wmSales = 0, ppvSales = 0, postSales = 0;

        const rows = salesData.querySelectorAll('tr');
        rows.forEach(row => {
            const amount3 = parseFloat(row.cells[3]?.textContent) || 0;
            const identifier = row.cells[5]?.textContent;
            const wmPpv = row.cells[6]?.textContent;

            if (identifier === 'Payment' && wmPpv === '-') messageSales += amount3;
            else if (identifier === 'Tip') tipSales += amount3;
            else if (identifier === 'Payment' && wmPpv !== '-') (wmPpv === 'WM' ? wmSales : ppvSales) += amount3;
            else if (identifier === 'Post') postSales += amount3;
        });

        const totalCGR = messageSales + tipSales;
        const totalNonCGR = wmSales + ppvSales + postSales;
        const totalSales = totalCGR + totalNonCGR;

        updateSalesDisplays(totalCGR, totalNonCGR, totalSales);
    }

    function updateSalesDisplays(totalCGR, totalNonCGR, totalSales) {
        document.getElementById('messageSales').textContent = totalCGR.toFixed(2);
        document.getElementById('tipSales').textContent = totalNonCGR.toFixed(2);
        document.getElementById('totalSales').textContent = totalSales.toFixed(2);
        duplicateTotalCGR.textContent = totalCGR.toFixed(2);
    }

    function triggerPulse() {
        const cgrSection = document.querySelector('.duplicate-total-cgr-section');
        cgrSection.classList.add('pulsing');
        setTimeout(() => cgrSection.classList.remove('pulsing'), 3000);
    }

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(duplicateTotalCGR.textContent)
            .then(() => alert('Copied to clipboard!'))
            .catch(err => console.error('Error copying text: ', err));
    });

    resetButton.addEventListener('click', () => window.location.reload());
});
