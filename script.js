// Function to save the list to localStorage
function saveListToLocalStorage() {
    const groceryList = [];
    const rows = document.querySelectorAll('#groceryList tr');
    
    // Loop through all rows (skip the header)
    for (let i = 1; i < rows.length; i++) {
        const itemCell = rows[i].cells[0];
        groceryList.push(itemCell.textContent);
    }
    
    // Save the list to localStorage
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
}

// Function to load the list from localStorage
function loadListFromLocalStorage() {
    const storedList = localStorage.getItem('groceryList');
    if (storedList) {
        const groceryList = JSON.parse(storedList);
        
        // Add each item from the stored list back to the table
        groceryList.forEach(item => {
            const table = document.getElementById('groceryList');
            const newRow = table.insertRow();
            const itemCell = newRow.insertCell(0);
            const deleteCell = newRow.insertCell(1);
            
            itemCell.textContent = item;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = function () {
                table.deleteRow(newRow.rowIndex);
                saveListToLocalStorage(); // Update localStorage after deletion
            };
            deleteCell.appendChild(deleteButton);
            
            deleteCell.style.cssText = `
                width: 30px;
                text-align: center;
                vertical-align: middle;
            `;
        });
    }
}

// Function to sanitize input (to avoid harmful content)
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

// Function to add a new item
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
            saveListToLocalStorage(); // Update localStorage after deletion
        };
        deleteCell.appendChild(deleteButton);

        deleteCell.style.cssText = `
            width: 30px;
            text-align: center;
            vertical-align: middle;
        `;

        document.getElementById('groceryForm').reset();
        saveListToLocalStorage(); // Save the updated list after adding an item
    } else {
        alert('Please enter a valid item.');
    }
}

// Load the list from localStorage when the page is loaded
window.onload = function () {
    loadListFromLocalStorage();
};

// Handle form submission with Enter key
document.getElementById('groceryForm').addEventListener('submit', function (e) {
    e.preventDefault();
    Add();
});

// Restrict input to valid characters and limit length
document.getElementById('item').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
});
