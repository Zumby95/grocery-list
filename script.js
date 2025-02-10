window.onload = function () {
    // Apply dark mode immediately
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Check if dark mode was previously enabled
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true; // Set the toggle to "on"
    }

    // Load saved items and set up event listeners
    loadItems();

    document.getElementById('addButton').addEventListener('click', Add);

    document.getElementById('groceryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        Add();
    });

    darkModeToggle.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', darkModeToggle.checked); // Save state to localStorage
    });
};

// Sanitize input to prevent malicious content
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

// Add a new item to the list
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
            newRow.classList.add('fade-out');
            setTimeout(() => {
                table.deleteRow(newRow.rowIndex);
                saveItems();
            }, 300);
        };

        deleteCell.appendChild(deleteButton);
        deleteCell.style.cssText = `
            width: 30px;
            text-align: center;
            vertical-align: middle;
        `;

        document.getElementById('groceryForm').reset();
        saveItems(); // Save the updated list to localStorage
    } else {
        alert('Please enter a valid item.');
    }
}

// Save items to localStorage
function saveItems() {
    const table = document.getElementById('groceryList');
    const items = [];
    for (let i = 1; i < table.rows.length; i++) {
        items.push(table.rows[i].cells[0].textContent);
    }
    localStorage.setItem('groceryItems', JSON.stringify(items));
}

// Load items from localStorage
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
            newRow.classList.add('fade-out');
            setTimeout(() => {
                table.deleteRow(newRow.rowIndex);
                saveItems();
            }, 300);
        };

        deleteCell.appendChild(deleteButton);
        deleteCell.style.cssText = `
            width: 30px;
            text-align: center;
            vertical-align: middle;
        `;
    });
}
