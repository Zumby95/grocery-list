document.addEventListener("DOMContentLoaded", () => {
  let lists = {};            // Object to hold multiple lists
  let currentListId = null;  // The currently active list

  // Initialize lists from localStorage, if any
  if (localStorage.getItem("groceryLists")) {
    lists = JSON.parse(localStorage.getItem("groceryLists"));
  }

  // Grab essential elements
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  const newListButton = document.getElementById("newListButton");
  const listMenu = document.getElementById("listMenu");
  const addButton = document.getElementById("addButton");
  const itemInput = document.getElementById("item");
  const groceryListTable = document.getElementById("groceryList").querySelector("tbody");
  const deleteListButton = document.getElementById("deleteListButton");
  const renameListButton = document.getElementById("renameListButton");
  const shareButton = document.getElementById("shareButton");
  const scanButton = document.getElementById("scanButton");
  const scannerModal = document.getElementById("scannerModal");
  const video = document.getElementById("video");
  const captureButton = document.getElementById("captureButton");

  // Toggle sidebar for mobile devices with touch support
  function toggleSidebar() {
    if (sidebar.classList.contains("show")) {
      sidebar.classList.remove("show");
      sidebar.classList.add("hidden");
    } else {
      sidebar.classList.remove("hidden");
      sidebar.classList.add("show");
    }
  }
  sidebarToggle.addEventListener("click", toggleSidebar);
  sidebarToggle.addEventListener("touchstart", (e) => {
    e.preventDefault();
    toggleSidebar();
  });

  // Save lists to phone storage (localStorage)
  function saveLists() {
    localStorage.setItem("groceryLists", JSON.stringify(lists));
  }

  // Render the list items on the sidebar (with counts)
  function renderListMenu() {
    listMenu.innerHTML = "";
    for (let listId in lists) {
      const listData = lists[listId];
      const a = document.createElement("a");
      a.href = "#";
      a.dataset.id = listId;
      a.textContent = listData.name + " (" + listData.items.length + ")";
      if (listId === currentListId) {
        a.classList.add("active-list");
      }
      a.addEventListener("click", (e) => {
        e.preventDefault();
        loadList(e.currentTarget.dataset.id);
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("show");
          sidebar.classList.add("hidden");
        }
      });
      listMenu.appendChild(a);
    }
  }

  // Load a list in the main content view based on its ID
  function loadList(listId) {
    currentListId = listId;
    renderGroceryList();
    renderListMenu();
  }

  // Render the grocery list table based on the active list
  function renderGroceryList() {
    groceryListTable.innerHTML = "";
    if (currentListId && lists[currentListId]) {
      lists[currentListId].items.forEach((item) => {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.textContent = item;
        tr.appendChild(td);
        groceryListTable.appendChild(tr);
      });
    }
  }

  // Sanitize user inputs to prevent HTML injections
  function sanitizeInput(input) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
  }

  // Create a new list
  newListButton.addEventListener("click", (e) => {
    e.preventDefault();
    let listName = prompt("Enter new list name:");
    if (listName) {
      listName = sanitizeInput(listName);
      const listId = "list-" + Date.now();
      lists[listId] = { name: listName, items: [] };
      currentListId = listId;
      saveLists();
      renderListMenu();
      renderGroceryList();
    }
  });

  // Add a new item to the currently active list
  addButton.addEventListener("click", (e) => {
    e.preventDefault();
    const itemVal = itemInput.value.trim();
    if (itemVal && currentListId) {
      const sanitizedItem = sanitizeInput(itemVal);
      lists[currentListId].items.push(sanitizedItem);
      saveLists();
      renderGroceryList();
      renderListMenu();
      itemInput.value = "";
    }
  });

  // Delete the current list
  deleteListButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentListId && confirm("Delete current list?")) {
      delete lists[currentListId];
      currentListId = null;
      saveLists();
      renderListMenu();
      renderGroceryList();
    }
  });

  // Rename the current list
  renameListButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentListId) {
      let newName = prompt("Enter new name for the list:", lists[currentListId].name);
      if (newName) {
        newName = sanitizeInput(newName);
        lists[currentListId].name = newName;
        saveLists();
        renderListMenu();
      }
    }
  });

  // Share the current list using the Web Share API (or fallback to clipboard)
  shareButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentListId) {
      const listContent = lists[currentListId].items.join("\n");
      if (navigator.share) {
        navigator
          .share({
            title: lists[currentListId].name,
            text: listContent,
          })
          .catch((error) => console.log("Error sharing", error));
      } else {
        navigator.clipboard
          .writeText(listContent)
          .then(() => alert("List copied to clipboard"))
          .catch(() => alert("Failed to copy list"));
      }
    }
  });

  // Open the scanner modal and start video stream from the device's camera
  scanButton.addEventListener("click", (e) => {
    e.preventDefault();
    openScanner();
  });

  function openScanner() {
    scannerModal.classList.remove("hidden");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          console.error("Error accessing camera: " + err);
          alert("Cannot access camera.");
        });
    }
  }

  // Close the scanner modal and stop the video stream
  function closeScanner() {
    scannerModal.classList.add("hidden");
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  }
  window.closeScanner = closeScanner; // Expose for inline onclick handler

  // Capture image from video, process OCR, and add detected text as items
  captureButton.addEventListener("click", (e) => {
    e.preventDefault();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function (blob) {
      Tesseract.recognize(blob, "eng")
        .then((result) => {
          const text = result.data.text;
          const lines = text.split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
          if (lines.length === 0) {
            alert("No text detected.");
          } else if (currentListId) {
            lines.forEach((line) => {
              lists[currentListId].items.push(sanitizeInput(line));
            });
            saveLists();
            renderGroceryList();
            renderListMenu();
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Error processing image.");
        })
        .finally(() => {
          closeScanner();
        });
    }, "image/jpeg");
  });

  // Initial render of the sidebar menu
  renderListMenu();
});
