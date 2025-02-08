// Event listener for adding the item when the button is clicked
document.getElementById('addButton').addEventListener('click', Add);

// Event listener for pressing Enter (form submission)
document.getElementById('groceryForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission (page refresh)
    Add();
});

// Sanitize input to avoid malicious characters
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

// Function to add an item to the grocery list
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

        document.getElementById('groceryForm').reset(); // Clear input field
    } else {
        alert('Please enter a valid item.');
    }
}

// Restrict input to alphanumeric characters only
document.getElementById('item').addEventListener('input', function () {
    this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
});
