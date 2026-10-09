document.addEventListener("DOMContentLoaded", () => {
  initEmptyLinksRedirect();
  initPasswordToggles();
  initPasswordStrength();
  initUsernameValidation();
  initConfirmPasswordCheck();
  initLoginForm();
  initRegisterForm();
  initGoogleAuth();
});

/* --------------------------------------------------------------------------
   1. Toast Notification Helper
   -------------------------------------------------------------------------- */
function showToast(message, type = "success", duration = 3000) {
  let container = document.querySelector(".auth-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "auth-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `auth-toast ${type}`;

  const iconClass =
    type === "success"
      ? "fa-solid fa-circle-check"
      : type === "warning"
        ? "fa-solid fa-triangle-exclamation"
        : "fa-solid fa-circle-xmark";

  toast.innerHTML = `
    <i class="${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.35s ease";
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* --------------------------------------------------------------------------
   2. Show / Hide Password Toggles
   -------------------------------------------------------------------------- */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".btn-toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = button.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      const icon = button.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
      } else {
        input.type = "password";
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. Password Strength Checker (for Login and Register)
   -------------------------------------------------------------------------- */
function calculatePasswordStrength(password) {
  let score = 0;
  if (!password) {
    return {
      score: 0,
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (hasLength) score += 1;
  if (hasUpper && hasLower) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  return {
    score,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

function initPasswordStrength() {
  const passwordInputs = document.querySelectorAll(
    'input[type="password"].validate-strength, input[type="text"].validate-strength',
  );

  passwordInputs.forEach((input) => {
    const strengthBox = input
      .closest(".auth-form-group")
      ?.querySelector(".password-strength-box");
    if (!strengthBox) return;

    const bars = strengthBox.querySelector(".strength-bars");
    const statusText = strengthBox.querySelector(".strength-status");
    const ruleLength = strengthBox.querySelector(".rule-length");
    const ruleUpper = strengthBox.querySelector(".rule-upper");
    const ruleLower = strengthBox.querySelector(".rule-lower");
    const ruleNumber = strengthBox.querySelector(".rule-number");
    const ruleSpecial = strengthBox.querySelector(".rule-special");

    const updateUI = () => {
      const val = input.value;
      if (!val) {
        strengthBox.classList.remove("is-active");
        input.classList.remove("is-invalid", "is-valid");
        return;
      }

      strengthBox.classList.add("is-active");
      const { score, hasLength, hasUpper, hasLower, hasNumber, hasSpecial } =
        calculatePasswordStrength(val);

      // Update rules checklist
      const setRule = (el, valid) => {
        if (!el) return;
        if (valid) {
          el.classList.add("valid");
          const icon = el.querySelector("i");
          if (icon) icon.className = "fa-solid fa-circle-check";
        } else {
          el.classList.remove("valid");
          const icon = el.querySelector("i");
          if (icon) icon.className = "fa-regular fa-circle";
        }
      };

      setRule(ruleLength, hasLength);
      setRule(ruleUpper, hasUpper);
      setRule(ruleLower, hasLower);
      setRule(ruleNumber, hasNumber);
      setRule(ruleSpecial, hasSpecial);

      // Update strength bars & status
      if (bars) {
        bars.className = `strength-bars level-${score}`;
      }

      if (statusText) {
        statusText.className = "strength-status";
        if (score <= 1) {
          statusText.textContent = "Weak";
          statusText.classList.add("weak");
        } else if (score === 2 || score === 3) {
          statusText.textContent = "Medium";
          statusText.classList.add("medium");
        } else {
          statusText.textContent = "Strong";
          statusText.classList.add("strong");
        }
      }

      // Input visual validation state
      if (score < 2 || !hasLength) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
      } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
      }
    };

    input.addEventListener("input", updateUI);
    input.addEventListener("focus", () => {
      if (input.value) strengthBox.classList.add("is-active");
    });
  });
}

/* --------------------------------------------------------------------------
   4. Username Validation & Real-Time Input Restriction
   - Prevent user from typing numbers or special characters in the field itself
   - Prevent space to type or enter
   - Only allow alphabets (A-Z, a-z)
   -------------------------------------------------------------------------- */
function initUsernameValidation() {
  const usernameInput = document.getElementById("registerUsername");
  if (!usernameInput) return;

  const feedback = usernameInput
    .closest(".auth-form-group")
    ?.querySelector(".field-feedback");

  // Prevent invalid keystrokes immediately on keydown
  usernameInput.addEventListener("keydown", (e) => {
    // Allow control keys (Backspace, Tab, Enter, Delete, Arrow keys, etc.)
    if (
      [
        "Backspace",
        "Tab",
        "Enter",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Explicitly reject space
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      showFeedback("Spaces are not allowed in username", "warning");
      return;
    }

    // Reject numbers and special characters (only allow a-zA-Z)
    if (!/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      showFeedback(
        "Only letters (a-z, A-Z) allowed. No numbers or special characters.",
        "warning",
      );
    }
  });

  // Sanitize on input / paste / drop to ensure nothing slips through
  usernameInput.addEventListener("input", () => {
    const originalValue = usernameInput.value;
    // Strip everything that is not an English letter
    const sanitized = originalValue.replace(/[^a-zA-Z]/g, "");

    if (originalValue !== sanitized) {
      usernameInput.value = sanitized;
      showFeedback(
        "Numbers, spaces, and special characters were removed.",
        "warning",
      );
    }

    if (sanitized.length >= 2) {
      usernameInput.classList.remove("is-invalid");
      usernameInput.classList.add("is-valid");
      if (feedback && feedback.classList.contains("error")) {
        feedback.style.display = "none";
      }
    } else if (sanitized.length === 0) {
      usernameInput.classList.remove("is-invalid", "is-valid");
      if (feedback) feedback.style.display = "none";
    } else {
      usernameInput.classList.add("is-invalid");
      usernameInput.classList.remove("is-valid");
      showFeedback("Username must be at least 2 characters.", "error");
    }
  });

  function showFeedback(text, type) {
    if (!feedback) return;
    feedback.textContent = text;
    feedback.className = `field-feedback ${type}`;
    feedback.style.display = "flex";
  }
}

/* --------------------------------------------------------------------------
   5. Confirm Password Matching Check
   -------------------------------------------------------------------------- */
function initConfirmPasswordCheck() {
  const passwordInput = document.getElementById("registerPassword");
  const confirmInput = document.getElementById("registerConfirmPassword");
  if (!passwordInput || !confirmInput) return;

  const feedback = confirmInput
    .closest(".auth-form-group")
    ?.querySelector(".field-feedback");

  const checkMatch = () => {
    const pass = passwordInput.value;
    const confirm = confirmInput.value;

    if (!confirm) {
      confirmInput.classList.remove("is-invalid", "is-valid");
      if (feedback) feedback.style.display = "none";
      return;
    }

    if (pass === confirm) {
      confirmInput.classList.remove("is-invalid");
      confirmInput.classList.add("is-valid");
      if (feedback) {
        feedback.textContent = "Passwords match";
        feedback.className = "field-feedback success";
        feedback.style.display = "flex";
      }
    } else {
      confirmInput.classList.add("is-invalid");
      confirmInput.classList.remove("is-valid");
      if (feedback) {
        feedback.textContent = "Passwords do not match";
        feedback.className = "field-feedback error";
        feedback.style.display = "flex";
      }
    }
  };

  confirmInput.addEventListener("input", checkMatch);
  passwordInput.addEventListener("input", () => {
    if (confirmInput.value) checkMatch();
  });
}

/* --------------------------------------------------------------------------
   6. Login Form Submission & Validation
   - Required fields: Role, Email, Password, Remember Me
   - Password validation
   - Redirect to Home upon success
   -------------------------------------------------------------------------- */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const role = document.getElementById("loginRole");
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    const rememberMe = document.getElementById("loginRememberMe");

    let isValid = true;

    // Validate Role
    if (!role.value) {
      role.classList.add("is-invalid");
      showFieldError(role, "Please select your role.");
      isValid = false;
    } else {
      role.classList.remove("is-invalid");
      role.classList.add("is-valid");
      hideFieldError(role);
    }

    // Validate Email
    if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) {
      email.classList.add("is-invalid");
      showFieldError(email, "Please enter a valid email address.");
      isValid = false;
    } else {
      email.classList.remove("is-invalid");
      email.classList.add("is-valid");
      hideFieldError(email);
    }

    // Validate Password
    if (!password.value) {
      password.classList.add("is-invalid");
      showFieldError(password, "Password is required.");
      isValid = false;
    } else {
      const strength = calculatePasswordStrength(password.value);
      if (strength.score < 2 || !strength.hasLength) {
        password.classList.add("is-invalid");
        showFieldError(
          password,
          "Password is too weak. Please meet password requirements.",
        );
        isValid = false;
      } else {
        password.classList.remove("is-invalid");
        password.classList.add("is-valid");
        hideFieldError(password);
      }
    }

    if (!isValid) {
      showToast("Please correct the highlighted fields.", "error");
      return;
    }

    const submitBtn = form.querySelector(".btn-auth-submit");
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

    showToast(
      "Logged in successfully! Redirecting to home...",
      "success",
      2000,
    );

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  });
}

/* --------------------------------------------------------------------------
   7. Register Form Submission & Validation
   - Required fields: Username, Role, Email, Password, Confirm Password, Terms
   - Password match check
   - Weak password validation
   - Redirect to Login page upon success
   -------------------------------------------------------------------------- */
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername");
    const role = document.getElementById("registerRole");
    const email = document.getElementById("registerEmail");
    const password = document.getElementById("registerPassword");
    const confirmPassword = document.getElementById("registerConfirmPassword");
    const terms = document.getElementById("registerTerms");

    let isValid = true;

    // Validate Username (letters only, no space, no numbers/special char, min 2 chars)
    if (!username.value || !/^[a-zA-Z]{2,30}$/.test(username.value)) {
      username.classList.add("is-invalid");
      showFieldError(
        username,
        "Username is required and must contain letters only (no spaces/numbers).",
      );
      isValid = false;
    } else {
      username.classList.remove("is-invalid");
      username.classList.add("is-valid");
      hideFieldError(username);
    }

    // Validate Role
    if (!role.value) {
      role.classList.add("is-invalid");
      showFieldError(role, "Please select your role.");
      isValid = false;
    } else {
      role.classList.remove("is-invalid");
      role.classList.add("is-valid");
      hideFieldError(role);
    }

    // Validate Email
    if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) {
      email.classList.add("is-invalid");
      showFieldError(email, "Please enter a valid email address.");
      isValid = false;
    } else {
      email.classList.remove("is-invalid");
      email.classList.add("is-valid");
      hideFieldError(email);
    }

    // Validate Password (Weak Password Validation)
    if (!password.value) {
      password.classList.add("is-invalid");
      showFieldError(password, "Password is required.");
      isValid = false;
    } else {
      const strength = calculatePasswordStrength(password.value);
      if (strength.score < 2 || !strength.hasLength) {
        password.classList.add("is-invalid");
        showFieldError(
          password,
          "Password is too weak. Minimum 8 characters with letters, numbers, and symbols.",
        );
        isValid = false;
      } else {
        password.classList.remove("is-invalid");
        password.classList.add("is-valid");
        hideFieldError(password);
      }
    }

    // Validate Confirm Password Match
    if (!confirmPassword.value) {
      confirmPassword.classList.add("is-invalid");
      showFieldError(confirmPassword, "Please confirm your password.");
      isValid = false;
    } else if (confirmPassword.value !== password.value) {
      confirmPassword.classList.add("is-invalid");
      showFieldError(confirmPassword, "Passwords do not match.");
      isValid = false;
    } else {
      confirmPassword.classList.remove("is-invalid");
      confirmPassword.classList.add("is-valid");
      hideFieldError(confirmPassword);
    }

    // Validate Terms & Conditions Checkbox
    if (!terms.checked) {
      showFieldError(terms, "You must agree to the Terms and Privacy Policy.");
      isValid = false;
    } else {
      hideFieldError(terms);
    }

    if (!isValid) {
      showToast(
        "Please fix the errors in the form before submitting.",
        "error",
      );
      return;
    }

    const submitBtn = form.querySelector(".btn-auth-submit");
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

    showToast(
      "Account created successfully! Redirecting to login...",
      "success",
      2500,
    );

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });
}

function showFieldError(element, msg) {
  const parent = element.closest(".auth-form-group");
  if (!parent) return;
  let feedback = parent.querySelector(".field-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "field-feedback error";
    parent.appendChild(feedback);
  }
  feedback.textContent = msg;
  feedback.className = "field-feedback error";
  feedback.style.display = "flex";
}

function hideFieldError(element) {
  const parent = element.closest(".auth-form-group");
  if (!parent) return;
  const feedback = parent.querySelector(".field-feedback");
  if (feedback && feedback.classList.contains("error")) {
    feedback.style.display = "none";
  }
}

/* --------------------------------------------------------------------------
   8. Google OAuth Simulation
   -------------------------------------------------------------------------- */
function initGoogleAuth() {
  const googleBtns = document.querySelectorAll(".btn-google-auth");
  googleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("Connecting with Google...", "warning", 1500);
      setTimeout(() => {
        showToast(
          "Google authentication successful! Redirecting...",
          "success",
          2000,
        );
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1200);
      }, 1000);
    });
  });
}

/* --------------------------------------------------------------------------
   8. Global Redirection of Empty / '#' Links to 404 Page
   -------------------------------------------------------------------------- */
function initEmptyLinksRedirect() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    if (
      link.hasAttribute("data-bs-toggle") ||
      link.hasAttribute("data-bs-target") ||
      link.hasAttribute("data-bs-slide") ||
      link.classList.contains("dropdown-toggle") ||
      link.id === "scrollToTopBtn" ||
      link.id === "mobileMenuToggle" ||
      link.id === "mobileMenuClose"
    ) {
      return;
    }

    const onclickAttr = link.getAttribute("onclick");
    if (
      onclickAttr &&
      (onclickAttr.includes("history.back") ||
        onclickAttr.includes("preventDefault"))
    ) {
      return;
    }

    const href = link.getAttribute("href");
    if (
      href === null ||
      href === "" ||
      href === "#" ||
      href === "#!" ||
      href.startsWith("javascript:void") ||
      href.startsWith("javascript:;")
    ) {
      e.preventDefault();
      const isInPagesDir =
        document.querySelector('link[href*="../assets/"]') !== null ||
        window.location.pathname.includes("/pages/") ||
        window.location.pathname.includes("\\pages\\");
      const target404 = isInPagesDir ? "404.html" : "pages/404.html";
      window.location.href = target404;
    }
  });
}
