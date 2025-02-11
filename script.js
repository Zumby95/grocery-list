window.onload = function () {
    loadItems();
    document.getElementById('addButton').addEventListener('click', Add);
    document.getElementById('groceryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        Add();
    });

    // Add event listener for shareButton
    document.getElementById('shareButton').addEventListener('click', generateShareableLink);
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
    
    const cell = document.createElement('td');
    
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '☰';
    
    const textNode = document.createTextNode(` ${itemText} `);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = function() {
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
        // Get the cell's text content but exclude the drag handle and delete button
        const cell = table.rows[i].cells[0];
        const text = cell.childNodes[1].textContent.trim(); // Get the text node between drag handle and delete button
        items.push(text);
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

// Function to create a shareable URL
function generateShareableLink() {
    const table = document.getElementById('groceryList');
    const items = [];

    for (let i = 1; i < table.rows.length; i++) {
        const cell = table.rows[i].cells[0];
        const text = cell.childNodes[1].textContent.trim();
        items.push(text);
    }

    const encodedItems = encodeURIComponent(JSON.stringify(items));
    const shareableLink = `${window.location.href}?items=${encodedItems}`;
    
    // Display the link to the user
    alert(`Shareable link: ${shareableLink}`);
}

// Function to load items from URL parameters
function loadItemsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const items = JSON.parse(decodeURIComponent(urlParams.get('items'))) || [];

    const table = document.getElementById('groceryList');
    items.forEach(item => {
        const newRow = createRow(item);
        table.appendChild(newRow);
    });
}

// Call this on page load to check if the URL contains shared items
window.onload = function () {
    loadItemsFromURL();
    loadItems();
    document.getElementById('addButton').addEventListener('click', Add);
    document.getElementById('groceryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        Add();
    });
};
