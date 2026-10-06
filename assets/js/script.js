// --------------------------------------------------------------------------
// 1. Dynamic Header Component Loader
// --------------------------------------------------------------------------
async function loadCommonHeader() {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) {
    initHeader();
    return;
  }

  const isInPagesDir =
    document.querySelector('link[href*="../assets/"]') !== null ||
    window.location.pathname.includes("/pages/") ||
    window.location.pathname.includes("\\pages\\");

  const componentPath = isInPagesDir
    ? "components/header.html"
    : "pages/components/header.html";

  try {
    const res = await fetch(componentPath);
    if (!res.ok) {
      throw new Error(
        `Failed to load ${componentPath} (Status: ${res.status})`,
      );
    }
    let headerHtml = await res.text();

    // Adjust relative paths for pages inside the /pages/ directory
    if (isInPagesDir) {
      headerHtml = headerHtml.replace(
        /href="index\.html"/g,
        'href="../index.html"',
      );
      headerHtml = headerHtml.replace(/src="assets\//g, 'src="../assets/');
      headerHtml = headerHtml.replace(/href="pages\//g, 'href="');
    }

    placeholder.outerHTML = headerHtml;
    initHeader();
  } catch (err) {
    console.error("Error loading common header component:", err);
  }
}

// --------------------------------------------------------------------------
// 2. Header Interactions (Sticky Scroll, Fullscreen Mobile Menu, Active Nav)
// --------------------------------------------------------------------------
function initHeader() {
  const siteHeader = document.getElementById("site-header");
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileMenuClose = document.getElementById("mobileMenuClose");
  const mobileNavFullscreen = document.getElementById("mobileNavFullscreen");
  const mobileLinks = document.querySelectorAll(".mobile-menu-link");

  // Sticky Scroll Handling
  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        siteHeader.classList.add("is-scrolled");
      } else {
        siteHeader.classList.remove("is-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  // Mobile Menu Fullscreen Drawer Handling
  const openMobileMenu = () => {
    if (mobileNavFullscreen) {
      mobileNavFullscreen.classList.add("is-open");
      mobileNavFullscreen.setAttribute("aria-hidden", "false");
      document.body.classList.add("mobile-menu-open");
    }
  };

  const closeMobileMenu = () => {
    if (mobileNavFullscreen) {
      mobileNavFullscreen.classList.remove("is-open");
      mobileNavFullscreen.setAttribute("aria-hidden", "true");
      document.body.classList.remove("mobile-menu-open");
    }
  };

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      openMobileMenu();
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", (e) => {
      e.preventDefault();
      closeMobileMenu();
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      mobileNavFullscreen &&
      mobileNavFullscreen.classList.contains("is-open")
    ) {
      closeMobileMenu();
    }
  });

  // Highlight Active Nav Item Based on Current Page URL
  const highlightActiveNav = () => {
    const currentPath = window.location.pathname.toLowerCase();
    let activeKey = "home";

    if (currentPath.includes("about")) {
      activeKey = "about";
    } else if (currentPath.includes("service")) {
      activeKey = "services";
    } else if (currentPath.includes("blog")) {
      activeKey = "blog";
    } else if (currentPath.includes("contact")) {
      activeKey = "contact";
    } else if (
      currentPath.endsWith("index.html") ||
      currentPath.endsWith("/") ||
      currentPath === ""
    ) {
      activeKey = "home";
    }

    const desktopLinks = document.querySelectorAll(".nav-menu .nav-link");
    desktopLinks.forEach((link) => {
      const page = link.getAttribute("data-page");
      if (page === activeKey) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    const mobileMenuLinks = document.querySelectorAll(".mobile-menu-link");
    mobileMenuLinks.forEach((link) => {
      const page = link.getAttribute("data-page");
      if (page === activeKey) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  highlightActiveNav();
}

// --------------------------------------------------------------------------
// 3. Page Lifecycle & Additional Animations
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Load Common Header from pages/components/header.html
  loadCommonHeader();

  // Reveal Animations with Intersection Observer
  const animateElements = document.querySelectorAll(".fade-in-element");

  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observerInstance.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animateElements.forEach((el) => observer.observe(el));
  } else {
    animateElements.forEach((el) => el.classList.add("is-visible"));
  }

  // Button Ripple Effect
  const buttonsWithRipple = document.querySelectorAll(
    ".btn-primary, .btn-header-contact",
  );
  buttonsWithRipple.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.style.position = "absolute";
      ripple.style.width = "20px";
      ripple.style.height = "20px";
      ripple.style.background = "rgba(255, 255, 255, 0.4)";
      ripple.style.borderRadius = "50%";
      ripple.style.transform = "translate(-50%, -50%) scale(0)";
      ripple.style.animation = "ripple 0.6s linear";
      ripple.style.pointerEvents = "none";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // FAQ Accordion State Management
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const collapseEl = item.querySelector(".accordion-collapse");
    if (collapseEl) {
      collapseEl.addEventListener("show.bs.collapse", () => {
        item.classList.add("active");
      });
      collapseEl.addEventListener("hide.bs.collapse", () => {
        item.classList.remove("active");
      });
    }
  });

  // Testimonials Slider
  const slides = document.querySelectorAll(".testimonial-slide");
  const prevBtn = document.getElementById("testimonialPrev");
  const nextBtn = document.getElementById("testimonialNext");
  const counterEl = document.getElementById("testimonialCounter");

  if (slides.length > 0 && prevBtn && nextBtn && counterEl) {
    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateSlider = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
      const formattedCurrent = String(index + 1).padStart(2, "0");
      const formattedTotal = String(totalSlides).padStart(2, "0");
      counterEl.textContent = `${formattedCurrent}/${formattedTotal}`;
    };

    nextBtn.addEventListener("click", () => {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateSlider(currentSlide);
    });

    prevBtn.addEventListener("click", () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateSlider(currentSlide);
    });
  }

  // Success Stories Slider
  const storyTrack = document.getElementById("successStoriesTrack");
  const storySlides = document.querySelectorAll(".success-story-slide");
  const storyPrevBtn = document.getElementById("storyPrevBtn");
  const storyNextBtn = document.getElementById("storyNextBtn");
  const storyIndicators = document.querySelectorAll(".story-indicator-dash");

  if (storyTrack && storySlides.length > 0) {
    let currentStoryIndex = 0;
    const totalStorySlides = storySlides.length;

    const updateStorySlider = (index) => {
      currentStoryIndex = (index + totalStorySlides) % totalStorySlides;
      storyTrack.style.transform = `translateX(-${currentStoryIndex * 100}%)`;

      storySlides.forEach((slide, i) => {
        slide.classList.toggle("active", i === currentStoryIndex);
      });

      storyIndicators.forEach((indicator, i) => {
        indicator.classList.toggle("active", i === currentStoryIndex);
      });
    };

    if (storyPrevBtn) {
      storyPrevBtn.addEventListener("click", () => {
        updateStorySlider(currentStoryIndex - 1);
      });
    }

    if (storyNextBtn) {
      storyNextBtn.addEventListener("click", () => {
        updateStorySlider(currentStoryIndex + 1);
      });
    }

    storyIndicators.forEach((indicator) => {
      indicator.addEventListener("click", () => {
        const index = parseInt(indicator.getAttribute("data-index"), 10);
        updateStorySlider(index);
      });
    });
  }
});

// Dynamic ripple keyframes injection
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes ripple {
    to {
        transform: translate(-50%, -50%) scale(15);
        opacity: 0;
    }
}
`;
document.head.appendChild(styleSheet);
