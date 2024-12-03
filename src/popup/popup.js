(() => {
  const osToggle = document.getElementById("osToggle");
  const windowsShortcuts = document.getElementById("windowsShortcuts");
  const macShortcuts = document.getElementById("macShortcuts");

  // Function to update the display based on the toggle state
  function updateDisplay() {
    if (osToggle.checked) {
      windowsShortcuts.style.display = "none";
      macShortcuts.style.display = "block";
    } else {
      windowsShortcuts.style.display = "block";
      macShortcuts.style.display = "none";
    }
  }

  // Load the saved OS preference when the popup is opened
  document.addEventListener("DOMContentLoaded", () => {
    // Add the 'no-transition' class to the body to disable transitions
    document.body.classList.add("no-transition");

    chrome.storage.local.get(["osPreference"], function (result) {
      if (result.osPreference === "mac") {
        osToggle.checked = true;
      } else {
        osToggle.checked = false;
      }
      updateDisplay();

      // Remove the 'no-transition' class after setting the initial state
      // Use setTimeout to ensure it happens after the DOM updates
      setTimeout(() => {
        document.body.classList.remove("no-transition");
      }, 0);
    });
  });

  // Save the OS preference when the toggle is changed
  osToggle.addEventListener("change", () => {
    if (osToggle.checked) {
      chrome.storage.local.set({ osPreference: "mac" });
    } else {
      chrome.storage.local.set({ osPreference: "windows" });
    }
    updateDisplay();
  });
})();
