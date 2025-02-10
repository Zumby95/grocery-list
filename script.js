window.onload = function () {
    // First load the saved items
    loadItems();
    
    // Then set up the event listeners
    document.getElementById('addButton').addEventListener('click', Add);
    document.getElementById('groceryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        Add();
    });
};

// Sanitize input to prevent malicious content
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
            saveItems();
        };
        deleteCell.appendChild(deleteButton);

        deleteCell.style.cssText = `
            width: 30px;
            text-align: center;
            vertical-align: middle;
        `;

        document.getElementById('groceryForm').reset();

        // Save the updated list to localStorage
        saveItems();
    } else {
        alert('Please enter a valid item.');
    }
}

function saveItems() {
    const table = document.getElementById('groceryList');
    const items = [];

    for (let i = 1; i < table.rows.length; i++) {  // Start at 1 to skip the header row
        items.push(table.rows[i].cells[0].textContent);
    }

    localStorage.setItem('groceryItems', JSON.stringify(items));
}

function loadItems() {
    const items = JSON.parse(localStorage.getItem('groceryItems')) || [];
    const table = document.getElementById('groceryList');

    items.forEach(item => {
        const newRow = table.insertRow();
        const itemCell = newRow.insertCell(0);
        const deleteCell = newRow.insertCell(1);

        itemCell.textContent = item;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = function () {
            table.deleteRow(newRow.rowIndex);
            saveItems();
        };
        deleteCell.appendChild(deleteButton);

        deleteCell.style.cssText = `
            width: 30px;
            text-align: center;
            vertical-align: middle;
        `;
    });
}
