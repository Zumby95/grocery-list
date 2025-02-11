let currentListName = ""; // Tracks the currently selected list
let videoStream = null;   // For the scanner

window.onload = function () {
  loadAllLists();
  setupSharedList();

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
  document.getElementById("openSidenav").addEventListener("click", openNav);
  document.getElementById("captureButton").addEventListener("click", captureScan);
};

// ========================
// Side Navigation Functions
// ========================

function openNav() {
  document.getElementById("sidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("sidenav").style.width = "0";
}

// Load lists into the side menu
function loadAllLists() {
  const allLists = Object.keys(localStorage);
  const listMenu = document.getElementById("listMenu");
  listMenu.innerHTML = ""; // Clear existing menu items
  allLists.forEach((listName) => {
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.textContent = listName;
    a.addEventListener("click", () => {
      currentListName = listName;
      loadItems(listName);
      closeNav();
    });
    listMenu.appendChild(a);
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
    // Assumes that the text node is at index 1 (after the drag handle)
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
  newRow.draggable = true;

  const cell = document.createElement("td");
  const dragHandle = document.createElement("span");
  dragHandle.className = "drag-handle";
  dragHandle.textContent = "☰";

  const textNode = document.createTextNode(` ${itemText} `);

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

  cell.appendChild(dragHandle);
  cell.appendChild(textNode);
  cell.appendChild(deleteBtn);
  newRow.appendChild(cell);

  setupDragEvents(newRow);
  return newRow;
}

function setupDragEvents(row) {
  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let initialRow;

  // Touch events
  row.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      const handleElement = e.target.closest(".drag-handle");
      if (!handleElement) return;
      isDragging = true;
      startY = touch.pageY;
      initialRow = row;
      row.classList.add("dragging");

      const rows = Array.from(row.parentElement.children);
      rows.forEach((r) => {
        r.initialPosition = r.getBoundingClientRect().top;
      });
    },
    { passive: false }
  );

  row.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      currentY = touch.pageY;
      const deltaY = currentY - startY;
      row.style.transform = `translateY(${deltaY}px)`;

      const rows = Array.from(row.parentElement.children);
      const hoverRow = rows.find((r) => {
        if (r === row) return false;
        const rect = r.getBoundingClientRect();
        return currentY >= rect.top && currentY <= rect.bottom;
      });

      if (hoverRow) {
        const movingDown = deltaY > 0;
        const siblingRow = movingDown ? hoverRow.nextElementSibling : hoverRow;
        row.parentElement.insertBefore(row, siblingRow);
        requestAnimationFrame(() => {
          row.style.transform = "";
          startY = touch.pageY;
        });
      }
    },
    { passive: false }
  );

  row.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;
    row.classList.remove("dragging");
    row.style.transform = "";
    saveItems(currentListName);
  });

  // Mouse events
  row.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", row.rowIndex);
    row.classList.add("dragging");
  });

  row.addEventListener("dragend", () => {
    row.classList.remove("dragging");
    const tableRows = document.querySelectorAll("#groceryList tr");
    tableRows.forEach((r) => r.classList.remove("drag-over"));
    saveItems(currentListName);
