document.getElementById('addButton').addEventListener('click', Add);
document.getElementById('groceryForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent page refresh
    Add();
});

function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

function Add() {
    const table = document.getElementById('groceryList');
    let item = document.getElementById('item').value.trim();

    if (item) {
        const sanitizedItem = sanitizeInput(item);
        const newRow = table.insertRow();
        const itemCell = newRow.insertCell(0);
        const deleteCell = newRow.insertCell(1);

        itemCell.textContent = sanitizedItem;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = function () {
            table.deleteRow(newRow.rowIndex);
        };
        deleteCell.appendChild(deleteButton);

        deleteCell.style.cssText = `
            width: 30px;
            text-align: center;
            vertical-align: middle;
        `;

        document.getElementById('groceryForm').reset();
    } else {
        alert('Please enter a valid item.');
    }
}

document.getElementById('item').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
});
