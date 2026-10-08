document.addEventListener("DOMContentLoaded", function () {
  const firstNameInput = document.getElementById("firstName");
  const contactForm = document.getElementById("contactMainForm");

  // ------------------------------------------------------------------------
  // Strict prevention: Block numbers & special characters in First Name field
  // ------------------------------------------------------------------------
  if (firstNameInput) {
    // 1. Block keydown events for any key that is not an alphabet letter (A-Z, a-z) or space
    firstNameInput.addEventListener("keydown", function (e) {
      // Allow navigation & standard control keys
      const allowedControlKeys = [
        "Backspace",
        "Tab",
        "Enter",
        "Escape",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Shift",
        "CapsLock",
        "Control",
        "Alt",
        "Meta",
      ];

      // Allow standard Ctrl/Cmd keyboard shortcuts (copy, paste, cut, select-all, undo)
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      if (allowedControlKeys.includes(e.key)) {
        return;
      }

      // Check if key pressed is a single letter (a-z, A-Z) or space
      // Directly prevent typing of digits (0-9) and any special characters (!@#$%^&* etc.)
      const isAllowedChar = /^[a-zA-Z\s]$/.test(e.key);
      if (!isAllowedChar) {
        e.preventDefault();
      }
    });

    // 2. Intercept beforeinput (for virtual/mobile keyboards, auto-complete & IME)
    firstNameInput.addEventListener("beforeinput", function (e) {
      if (e.data) {
        // If data being entered contains anything other than letters or spaces, prevent insertion
        if (!/^[a-zA-Z\s]+$/.test(e.data)) {
          e.preventDefault();
        }
      }
    });

    // 3. Intercept paste event (sanitize clipboard text before inserting)
    firstNameInput.addEventListener("paste", function (e) {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData).getData(
        "text",
      );
      // Strip everything except letters and spaces
      const cleanText = pasteText.replace(/[^a-zA-Z\s]/g, "");

      const start = this.selectionStart;
      const end = this.selectionEnd;
      const currentVal = this.value;

      this.value =
        currentVal.substring(0, start) + cleanText + currentVal.substring(end);
      this.selectionStart = this.selectionEnd = start + cleanText.length;

      // Trigger input event
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // 4. Fail-safe real-time input event sanitizer
    firstNameInput.addEventListener("input", function () {
      const originalVal = this.value;
      const sanitizedVal = originalVal.replace(/[^a-zA-Z\s]/g, "");
      if (originalVal !== sanitizedVal) {
        this.value = sanitizedVal;
      }
    });

    // 5. Drag-and-drop sanitizer
    firstNameInput.addEventListener("drop", function (e) {
      e.preventDefault();
      const droppedText = e.dataTransfer.getData("text");
      const cleanText = droppedText.replace(/[^a-zA-Z\s]/g, "");
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const currentVal = this.value;
      this.value =
        currentVal.substring(0, start) + cleanText + currentVal.substring(end);
      this.selectionStart = this.selectionEnd = start + cleanText.length;
    });
  }

  // ------------------------------------------------------------------------
  // Form submission handler
  // ------------------------------------------------------------------------
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector(".btn-contact-submit");
      const alertBox = document.getElementById("contactSuccessAlert");

      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          if (alertBox) {
            alertBox.classList.add("show");
            setTimeout(() => {
              alertBox.classList.remove("show");
            }, 6000);
          }
          contactForm.reset();
        }, 600);
      }
    });
  }
});
