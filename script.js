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
        <td>${itemText}</td>
        <td style="width: 30px; text-align: center;">
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
        saveItems(); // Save the new order after reordering
    });

    row.addEventListener('dragover', (e) => e.preventDefault());

    row.addEventListener('drop', (e) => {
        e.preventDefault();
        const table = row.parentElement;
        const draggedRowIndex = e.dataTransfer.getData('text/plain');
        const draggedRow = table.rows[draggedRowIndex];
        table.insertBefore(draggedRow, row.nextSibling);
    });
}

function saveItems() {
    const table = document.getElementById('groceryList');
    const items = [];

    for (let i = 1; i < table.rows.length; i++) {
        items.push(table.rows[i].cells[0].textContent);
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
