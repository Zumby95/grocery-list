window.onload = function () {
    loadItems();
    document.getElementById('addButton').addEventListener('click', Add);
    document.getElementById('groceryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        Add();
    });
};

function Add() {
    const table = document.getElementById('groceryList');
    let item = document.getElementById('item').value.trim();

    if (item) {
        const sanitizedItem = sanitizeInput(item);
        const newRow = createRow(sanitizedItem);
        table.appendChild(newRow);
        document.getElementById('groceryForm').reset();
        saveItems();
    } else {
        alert('Please enter a valid item.');
    }
}

function createRow(itemText) {
    const newRow = document.createElement('tr');
    newRow.draggable = true;
    newRow.innerHTML = `
        <td>
            <span class="drag-handle">☰</span> ${itemText}
            <button class="delete-btn">X</button>
        </td>
    `;

    newRow.querySelector('.delete-btn').onclick = function () {
        newRow.classList.add('fade-out');
        setTimeout(() => {
            newRow.remove();
            saveItems();
        }, 300);
    };

    setupDragEvents(newRow);
    return newRow;
}

function setupDragEvents(row) {
    row.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', row.rowIndex);
        row.classList.add('dragging');
    });

    row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        const tableRows = document.querySelectorAll('#groceryList tr');
        tableRows.forEach(row => row.classList.remove('drag-over'));
        saveItems();
    });

    row.addEventListener('dragover', (e) => {
        e.preventDefault();
        const table = row.parentElement;
        const draggingRow = document.querySelector('.dragging');
        
        if (draggingRow !== row) {
            row.classList.add('drag-over');
            table.insertBefore(draggingRow, row.nextSibling);
        }
    });

    row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
    });

    row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
    });
}

function saveItems() {
    const table = document.getElementById('groceryList');
    const items = [];

    for (let i = 1; i < table.rows.length; i++) {
        items.push(table.rows[i].cells[0].textContent.replace('☰', '').trim()); // Remove drag handle text
    }

    localStorage.setItem('groceryItems', JSON.stringify(items));
}

function loadItems() {
    const items = JSON.parse(localStorage.getItem('groceryItems')) || [];
    const table = document.getElementById('groceryList');

    items.forEach(item => {
        const newRow = createRow(item);
        table.appendChild(newRow);
    });
}

function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}
