window.onload = function () {
    loadAllLists();
    setupListSelector();

    document.getElementById('newListButton').addEventListener('click', createNewList);
    document.getElementById('addButton').addEventListener('click', Add);
    document.getElementById('groceryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        Add();
    });

    document.getElementById('shareButton').addEventListener('click', handleShareButton);
    document.getElementById('listSelector').addEventListener('change', loadSelectedList);
    document.getElementById('deleteListButton').addEventListener('click', deleteSelectedList);
};

function createNewList() {
    const listName = prompt("Enter a name for your new list:");
    if (listName && listName.trim()) {
        // Save empty list to localStorage
        localStorage.setItem(listName.trim(), JSON.stringify([]));
        
        // Add to selector
        const listSelector = document.getElementById('listSelector');
        const option = document.createElement('option');
        option.value = listName.trim();
        option.textContent = listName.trim();
        listSelector.appendChild(option);
        
        // Select the new list
        listSelector.value = listName.trim();
        
        // Clear current list display
        document.getElementById('groceryList').innerHTML = `<tr><th>Item</th></tr>`;
    }
}

function handleShareButton() {
    const listName = document.getElementById('listSelector').value;
    if (!listName) {
        alert('Please select a list first.');
        return;
    }

    const table = document.getElementById('groceryList');
    const items = [];

    for (let i = 1; i < table.rows.length; i++) {
        const cell = table.rows[i].cells[0];
        const text = cell.childNodes[1].textContent.trim();
        items.push(text);
    }

    const encodedItems = encodeURIComponent(JSON.stringify(items));
    const shareableLink = `${window.location.href}?list=${listName}&items=${encodedItems}`;

    if (navigator.share) {
        navigator.share({
            title: `Share ${listName} List`,
            text: `Check out this list:`,
            url: shareableLink,
        })
        .then(() => console.log('Shared successfully!'))
        .catch(error => console.log('Sharing failed', error));
    } else {
        alert(`You can share this link: ${shareableLink}`);
    }
}

function Add() {
    const listName = document.getElementById('listSelector').value;
    if (!listName) {
        alert('Please create or select a list first.');
        return;
    }

    const table = document.getElementById('groceryList');
    let item = document.getElementById('item').value.trim();

    if (item) {
        const sanitizedItem = sanitizeInput(item);
        const newRow = createRow(sanitizedItem);
        table.appendChild(newRow);
        document.getElementById('groceryForm').reset();
        saveItems(listName);
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
            saveItems(document.getElementById('listSelector').value);
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
        saveItems(document.getElementById('listSelector').value);
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

function saveItems(listName) {
    const table = document.getElementById('groceryList');
    const items = [];

    for (let i = 1; i < table.rows.length; i++) {
        const cell = table.rows[i].cells[0];
        const text = cell.childNodes[1].textContent.trim();
        items.push(text);
    }

    localStorage.setItem(listName, JSON.stringify(items));
}

function loadItems(listName) {
    const items = JSON.parse(localStorage.getItem(listName)) || [];
    const table = document.getElementById('groceryList');
    
    // Clear existing items
    table.innerHTML = `<tr><th>Item</th></tr>`;

    items.forEach(item => {
        const newRow = createRow(item);
        table.appendChild(newRow);
    });
}

function loadAllLists() {
    const allLists = Object.keys(localStorage);
    const listSelector = document.getElementById('listSelector');

    // Clear existing options except the default one
    listSelector.innerHTML = '<option value="" disabled selected>Select a list</option>';

    allLists.forEach(listName => {
        const option = document.createElement('option');
        option.value = listName;
        option.textContent = listName;
        listSelector.appendChild(option);
    });
}

function loadSelectedList() {
    const listName = document.getElementById('listSelector').value;
    if (listName) {
        loadItems(listName);
    }
}

function deleteSelectedList() {
    const listSelector = document.getElementById('listSelector');
    const listName = listSelector.value;

    if (!listName) {
        alert('Please select a list first.');
        return;
    }

    if (confirm(`Are you sure you want to delete the list "${listName}"?`)) {
        // Remove the list from localStorage
        localStorage.removeItem(listName);

        // Remove the list from the dropdown
        listSelector.remove(listSelector.selectedIndex);

        // Reset the selection to the default option
        listSelector.value = "";

        // Clear the current list display
        document.getElementById('groceryList').innerHTML = `<tr><th>Item</th></tr>`;
    }
}

function setupListSelector() {
    const urlParams = new URLSearchParams(window.location.search);
    const listName = urlParams.get('list');
    const items = urlParams.get('items');

    if (listName && items) {
        try {
            const decodedItems = JSON.parse(decodeURIComponent(items));
            
            // Ask user if they want to save the shared list
            const saveChoice = confirm(`Would you like to save "${listName}" to your lists?`);
            
            if (saveChoice) {
                // Check if a list with this name already exists
                if (localStorage.getItem(listName)) {
                    // Ask for a new name to avoid overwriting
                    let newListName = prompt(`A list named "${listName}" already exists. Please enter a new name for this list:`, `${listName} (Shared)`);
                    
                    while (newListName && localStorage.getItem(newListName)) {
                        newListName = prompt(`A list named "${newListName}" already exists. Please enter a different name:`, `${newListName} (1)`);
                    }
                    
                    if (newListName) {
                        localStorage.setItem(newListName, JSON.stringify(decodedItems));
                        loadAllLists();
                        const listSelector = document.getElementById('listSelector');
                        listSelector.value = newListName;
                        loadItems(newListName);
                    }
                } else {
                    // Save with original name if it doesn't exist
                    localStorage.setItem(listName, JSON.stringify(decodedItems));
                    loadAllLists();
                    const listSelector = document.getElementById('listSelector');
                    listSelector.value = listName;
                    loadItems(listName);
                }
            } else {
                // Just display the shared list temporarily without saving
                const table = document.getElementById('groceryList');
                table.innerHTML = `<tr><th>Shared List: ${listName} (Not Saved)</th></tr>`;
                decodedItems.forEach(item => {
                    const newRow = createRow(item);
                    table.appendChild(newRow);
                });
            }
            
            // Clear the URL parameters after handling
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error loading shared list:', error);
            alert('There was an error loading the shared list.');
        }
    }
}

function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}
