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
    let quantity = document.getElementById('quantity').value.trim();

    if (item && quantity && quantity > 0) {
        const sanitizedItem = sanitizeInput(item);
        const sanitizedQty = sanitizeInput(quantity);

        const newRow = createRow(sanitizedItem, sanitizedQty);
        table.appendChild(newRow);
        document.getElementById('groceryForm').reset();
        saveItems();
    } else {
        alert('Please enter a valid item and quantity.');
    }
}

function createRow(itemText, quantity) {
    const newRow = document.createElement('tr');
    newRow.draggable = true;

    const cell = document.createElement('td');

    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '☰';

    const textNode = document.createTextNode(` ${quantity} ${itemText} `);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = function () {
        newRow.classList.add('fade-out');
        setTimeout(() => {
            newRow.remove();
            saveItems();
        }, 300);
    };

    cell.appendChild(dragHandle);
    cell.appendChild(textNode);
    cell.appendChild(deleteBtn);
    newRow.appendChild(cell);

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
        const cell = table.rows[i].cells[0];
        const fullText = cell.childNodes[1].textContent.trim(); // Example: "3 Apples"
        items.push(fullText);
    }

    localStorage.setItem('groceryItems', JSON.stringify(items));
}

function loadItems() {
    const items = JSON.parse(localStorage.getItem('groceryItems')) || [];
    const table = document.getElementById('groceryList');

    items.forEach(item => {
        const [quantity, ...itemText] = item.split(' '); // Split first part as quantity
        const newRow = createRow(itemText.join(' '), quantity);
        table.appendChild(newRow);
    });
}
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}
