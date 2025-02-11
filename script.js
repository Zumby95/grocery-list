let currentListName = "";
let videoStream = null;

window.onload = function () {
    loadAllLists();
    setupSharedList();

    // Event Listeners
    document.getElementById("newListButton").addEventListener("click", createNewList);
    document.getElementById("addButton").addEventListener("click", Add);
    document.getElementById("groceryForm").addEventListener("submit", function (e) {
        e.preventDefault();
        Add();
    });
    document.getElementById("shareButton").addEventListener("click", handleShareButton);
    document.getElementById("deleteListButton").addEventListener("click", deleteSelectedList);
    document.getElementById("renameListButton").addEventListener("click", renameList);
    document.getElementById("scanButton").addEventListener("click", openScanner);
    document.getElementById("captureButton").addEventListener("click", captureScan);

    // Sidebar toggle functionality
    document.getElementById("sidebarToggle").addEventListener("click", toggleSidebar);
};

// ========================
// Sidebar Toggle Function
// ========================
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("show");
}

// ========================
// Side Navigation Functions
// ========================
function loadAllLists() {
    const allLists = Object.keys(localStorage);
    const listMenu = document.getElementById("listMenu");
    listMenu.innerHTML = ""; // Clear existing menu items

    allLists.forEach((listName) => {
        const itemCount = getListCount(listName);
        const a = document.createElement("a");
        a.href = "javascript:void(0)";
        a.innerHTML = `${listName} <span class="item-count">(${itemCount})</span>`;
        a.addEventListener("click", () => {
            currentListName = listName;
            loadItems(listName);
            highlightCurrentList(listName); // Highlight the active list
        });
        listMenu.appendChild(a);
    });
}

function getListCount(listName) {
    const items = JSON.parse(localStorage.getItem(listName)) || [];
    return items.length;
}

function highlightCurrentList(listName) {
    const listMenu = document.getElementById("listMenu");
    const links = listMenu.querySelectorAll("a");
    links.forEach((link) => {
        if (link.textContent.startsWith(listName)) {
            link.classList.add("active-list");
        } else {
            link.classList.remove("active-list");
        }
    });
}

// ========================
// Shared List Setup from URL (if any)
// ========================
function setupSharedList() {
    const urlParams = new URLSearchParams(window.location.search);
    const listName = urlParams.get("list");
    const items = urlParams.get("items");

    if (listName && items) {
        try {
            const decodedItems = JSON.parse(decodeURIComponent(items));
            const saveChoice = confirm(`Would you like to save "${listName}" to your lists?`);

            if (saveChoice) {
                if (localStorage.getItem(listName)) {
                    let newListName = prompt(
                        `A list named "${listName}" already exists. Please enter a new name for this list:`,
                        `${listName} (Shared)`
                    );

                    while (newListName && localStorage.getItem(newListName)) {
                        newListName = prompt(
                            `A list named "${newListName}" already exists. Please enter a different name:`,
                            `${newListName} (1)`
                        );
                    }

                    if (newListName) {
                        localStorage.setItem(newListName, JSON.stringify(decodedItems));
                        currentListName = newListName;
                        loadAllLists();
                        loadItems(newListName);
                    }
                } else {
                    localStorage.setItem(listName, JSON.stringify(decodedItems));
                    currentListName = listName;
                    loadAllLists();
                    loadItems(listName);
                }
            } else {
                const table = document.getElementById("groceryList");
                table.innerHTML = `<tr><th>Shared List: ${listName} (Not Saved)</th></tr>`;
                decodedItems.forEach((item) => {
                    const newRow = createRow(item);
                    table.appendChild(newRow);
                });
            }

            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error("Error loading shared list:", error);
            alert("There was an error loading the shared list.");
        }
    }
}

// ========================
// List Operations
// ========================
function createNewList() {
    const listNameInput = prompt("Enter a name for your new list:");
    if (listNameInput && listNameInput.trim()) {
        const listName = listNameInput.trim();
        localStorage.setItem(listName, JSON.stringify([]));
        currentListName = listName;
        loadAllLists();
        // Clear current list display
        document.getElementById("groceryList").innerHTML = `<tr><th>Item</th></tr>`;
    }
}

function handleShareButton() {
    if (!currentListName) {
        alert("Please select a list first.");
        return;
    }
    const table = document.getElementById("groceryList");
    const items = [];
    for (let i = 1; i < table.rows.length; i++) {
        const cell = table.rows[i].cells[0];
        const text = cell.childNodes[1].textContent.trim();
        items.push(text);
    }
    const encodedItems = encodeURIComponent(JSON.stringify(items));
    const shareableLink = `${window.location.href}?list=${currentListName}&items=${encodedItems}`;

    if (navigator.share) {
        navigator
            .share({
                title: `Share ${currentListName} List`,
                text: `Check out this list:`,
                url: shareableLink,
            })
            .then(() => console.log("Shared successfully!"))
            .catch((error) => console.log("Sharing failed", error));
    } else {
        alert(`You can share this link: ${shareableLink}`);
    }
}

function Add() {
    if (!currentListName) {
        alert("Please select or create a list first.");
        return;
    }
    const table = document.getElementById("groceryList");
    let item = document.getElementById("item").value.trim();
    if (item) {
        const sanitizedItem = sanitizeInput(item);
        const newRow = createRow(sanitizedItem);
        table.appendChild(newRow);
        document.getElementById("groceryForm").reset();
        saveItems(currentListName);
    } else {
        alert("Please enter a valid item.");
    }
}

function createRow(itemText) {
    const newRow = document.createElement("tr");

    const cell = document.createElement("td");

    // Add drag handle
    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "☰";

    // Add text node
    const textNode = document.createTextNode(` ${itemText} `);

    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "X";
    deleteBtn.onclick = function () {
        newRow.classList.add("fade-out");
        setTimeout(() => {
            newRow.remove();
            saveItems(currentListName);
        }, 300);
    };

    // Append elements to the cell
    cell.appendChild(dragHandle);
    cell.appendChild(textNode);
    cell.appendChild(deleteBtn);
    newRow.appendChild(cell);

    return newRow;
}

function saveItems(listName) {
    const table = document.getElementById("groceryList");
    const items = [];

    for (let i = 1; i < table.rows.length; i++) {
        const cell = table.rows[i].cells[0];
        const text = cell.childNodes[1].textContent.trim();
        items.push(text);
    }

    localStorage.setItem(listName, JSON.stringify(items));
    loadAllLists();
}

function loadItems(listName) {
    const items = JSON.parse(localStorage.getItem(listName)) || [];
    const table = document.getElementById("groceryList");

    // Clear existing items
    table.innerHTML = `<tr><th>Item</th></tr>`;

    items.forEach((item) => {
        const newRow = createRow(item);
        table.appendChild(newRow);
    });
}

function deleteSelectedList() {
    if (!currentListName) {
        alert("Please select a list first.");
        return;
    }

    if (confirm(`Are you sure you want to delete the list "${currentListName}"?`)) {
        localStorage.removeItem(currentListName);

        // Clear current list display
        document.getElementById("groceryList").innerHTML = `<tr><th>Item</th></tr>`;
        currentListName = "";
        loadAllLists();
    }
}

function renameList() {
    if (!currentListName) {
        alert("Please select a list first.");
        return;
    }

    const newName = prompt(`Enter new name for "${currentListName}":`, currentListName);

    if (newName && newName.trim() && newName !== currentListName) {
        if (localStorage.getItem(newName)) {
            alert("A list with this name already exists.");
            return;
        }

        // Get the current items
        const items = JSON.parse(localStorage.getItem(currentListName));

        // Remove old list and create new one
        localStorage.removeItem(currentListName);
        localStorage.setItem(newName, JSON.stringify(items));

        // Update current list name
        currentListName = newName;

        // Update side menu
        loadAllLists();
        loadItems(newName);
    }
}

function sanitizeInput(input) {
    const temp = document.createElement("div");
    temp.textContent = input;
    return temp.innerHTML;
}

// ========================
// Scanner Functions
// ========================
function openScanner() {
    const modal = document.getElementById("scannerModal");
    const video = document.getElementById("video");

    modal.classList.remove("hidden");

    // Prefer rear camera if available
    const constraints = {
        video: { facingMode: { exact: "environment" } },
        audio: false,
    };

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            videoStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.error("Error accessing camera:", err);
            alert(
                "Error accessing camera. Please make sure you have granted camera permissions."
            );
            closeScanner();
        });
}

function closeScanner() {
    const modal = document.getElementById("scannerModal");
    const video = document.getElementById("video");

    modal.classList.add("hidden");

    if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        videoStream = null;
    }
}

function captureScan() {
    const video = document.getElementById("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
	    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(function (blob) {
        if (!blob) {
            console.error("Blob is null");
            return;
        }
        performOCR(blob);
    }, "image/jpeg");
}

function performOCR(imageBlob) {
    Tesseract.recognize(
        imageBlob,
        "eng", // Specify language code (English in this case)
        { logger: (m) => console.log(m) } // Optional logging
    )
        .then(({ data: { text } }) => {
            // OCR completed
            console.log("OCR Result:", text);
            processScannedText(text);
            closeScanner();
        })
        .catch((err) => {
            console.error("OCR Error:", err);
            alert("OCR process failed. Please try again.");
            closeScanner();
        });
}

function processScannedText(text) {
    if (!currentListName) {
        alert("Please select a list first.");
        return;
    }

    const items = text
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item);
    const table = document.getElementById("groceryList");
    items.forEach((item) => {
        const sanitizedItem = sanitizeInput(item);
        const newRow = createRow(sanitizedItem);
        table.appendChild(newRow);
    });
    saveItems(currentListName);
}
