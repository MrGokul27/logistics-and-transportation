let preloaderInitialized = false;

function initThemePreloader() {
  if (preloaderInitialized) return;
  const preloader = document.getElementById("site-preloader");
  if (!preloader) return;

  preloaderInitialized = true;
  document.body.classList.add("preloader-active");

  const progressBar = document.getElementById("preloader-progress-bar");
  const percentageEl = document.getElementById("preloader-percentage");
  const statusEl = document.getElementById("preloader-status");
  const carrierEl = document.getElementById("preloader-carrier");
  const routeActiveLine = document.getElementById("preloader-route-path");
  const modeIcons = document.querySelectorAll(
    ".preloader-mode-icons .mode-icon",
  );

  const DURATION = 2000; // 2.0 Seconds
  const startTime = performance.now();

  let pathLength = 0;
  if (routeActiveLine) {
    try {
      pathLength = routeActiveLine.getTotalLength();
      routeActiveLine.style.strokeDasharray = `${pathLength} ${pathLength}`;
      routeActiveLine.style.strokeDashoffset = `${pathLength}`;
    } catch (e) {
      pathLength = 320;
    }
  }

  const statusMessages = [
    { threshold: 0, text: "Connecting Global Fleet Network...", modeIndex: 0 },
    { threshold: 30, text: "Routing Freight Corridors...", modeIndex: 0 },
    {
      threshold: 55,
      text: "Synchronizing Multi-Modal Telemetry...",
      modeIndex: 1,
    },
    { threshold: 80, text: "Calibrating Live Supply Chain...", modeIndex: 2 },
    {
      threshold: 96,
      text: "Dispatch Ready. Launching Experience...",
      modeIndex: 0,
    },
  ];

  let lastModeIndex = -1;

  function updatePreloader(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / DURATION, 1);

    // Smooth cubic ease out curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const percent = Math.min(Math.round(easeProgress * 100), 100);

    if (percentageEl) {
      percentageEl.textContent = `${percent}%`;
    }

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    if (routeActiveLine && pathLength > 0) {
      const offset = pathLength * (1 - easeProgress);
      routeActiveLine.style.strokeDashoffset = `${offset}`;
    }

    if (carrierEl) {
      const minX = 8;
      const maxX = 92;
      const carrierPos = minX + (maxX - minX) * easeProgress;
      carrierEl.style.left = `${carrierPos}%`;
    }

    for (let i = statusMessages.length - 1; i >= 0; i--) {
      if (percent >= statusMessages[i].threshold) {
        if (statusEl && statusEl.textContent !== statusMessages[i].text) {
          statusEl.textContent = statusMessages[i].text;
        }
        if (modeIcons.length && statusMessages[i].modeIndex !== lastModeIndex) {
          lastModeIndex = statusMessages[i].modeIndex;
          modeIcons.forEach((icon, idx) => {
            icon.classList.toggle("active", idx === lastModeIndex);
          });
        }
        break;
      }
    }

    if (progress < 1) {
      requestAnimationFrame(updatePreloader);
    } else {
      finishPreloader();
    }
  }

  function finishPreloader() {
    if (percentageEl) percentageEl.textContent = "100%";
    if (progressBar) progressBar.style.width = "100%";
    if (routeActiveLine && pathLength > 0)
      routeActiveLine.style.strokeDashoffset = "0";
    if (carrierEl) carrierEl.style.left = "92%";
    if (statusEl)
      statusEl.textContent = "Dispatch Ready. Launching Experience...";

    setTimeout(() => {
      preloader.classList.add("is-loaded");
      document.body.classList.remove("preloader-active");
      document.body.classList.add("preloader-complete");

      // Trigger scroll reveal animations as the preloader unveils the hero section
      setTimeout(() => {
        if (typeof initScrollReveal === "function") {
          initScrollReveal();
        }
      }, 100);

      setTimeout(() => {
        preloader.style.display = "none";
      }, 700);
    }, 150);
  }

  requestAnimationFrame(updatePreloader);
}

// Auto-run if element is in DOM already
if (document.getElementById("site-preloader")) {
  initThemePreloader();
}

// --------------------------------------------------------------------------
// 1. Dynamic Header & Footer Component Loaders
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

async function loadCommonFooter() {
  const placeholder = document.getElementById("footer-placeholder");
  if (!placeholder) {
    initScrollToTop();
    return;
  }

  const isInPagesDir =
    document.querySelector('link[href*="../assets/"]') !== null ||
    window.location.pathname.includes("/pages/") ||
    window.location.pathname.includes("\\pages\\");

  const componentPath = isInPagesDir
    ? "components/footer.html"
    : "pages/components/footer.html";

  try {
    const res = await fetch(componentPath);
    if (!res.ok) {
      throw new Error(
        `Failed to load ${componentPath} (Status: ${res.status})`,
      );
    }
    let footerHtml = await res.text();

    // Adjust relative paths for pages inside the /pages/ directory
    if (isInPagesDir) {
      footerHtml = footerHtml.replace(
        /href="index\.html"/g,
        'href="../index.html"',
      );
      footerHtml = footerHtml.replace(/src="assets\//g, 'src="../assets/');
      footerHtml = footerHtml.replace(/href="pages\//g, 'href="');
    }

    placeholder.outerHTML = footerHtml;
    initScrollToTop();
    initScrollReveal();
  } catch (err) {
    console.error("Error loading common footer component:", err);
  }
}

// --------------------------------------------------------------------------
// 2. Scroll To Top Interaction
// --------------------------------------------------------------------------
function initScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTopBtn");
  if (!scrollBtn) return;

  const handleScroll = () => {
    if (window.scrollY > 280) {
      scrollBtn.classList.add("is-visible");
    } else {
      scrollBtn.classList.remove("is-visible");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (!scrollBtn.dataset.bound) {
    scrollBtn.dataset.bound = "true";
    scrollBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
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
  // Theme Preloader Initialization
  initThemePreloader();

  // Global Empty / '#' Link Redirection to 404
  initEmptyLinksRedirect();

  // Load Common Header & Footer components
  loadCommonHeader();
  loadCommonFooter();
  initScrollToTop();
  initCountUpAnimation();

  initScrollReveal();

  // Button Ripple Effect
  const buttonsWithRipple = document.querySelectorAll(
    ".btn-primary, .btn-header-contact, .btn-take-step, .btn-subscribe, .btn-story-learn",
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

  // Newsletter Subscribe Form Submission Feedback
  const subscribeForm = document.getElementById("subscribeForm");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = subscribeForm.querySelector(".subscribe-input");
      const btn = subscribeForm.querySelector(".btn-subscribe");
      if (input && input.value.trim()) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Subscribed!';
        btn.style.backgroundColor = "#16a34a";
        input.value = "";
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.backgroundColor = "";
        }, 3000);
      }
    });
  }

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

  // Initialize Blog Category Filter
  initBlogFilter();
});

// --------------------------------------------------------------------------
// Blog Category Filter Interaction
// --------------------------------------------------------------------------
function initBlogFilter() {
  const filterBtns = document.querySelectorAll(".blog-filter-btn");
  const articleCols = document.querySelectorAll(".article-card-col");
  if (!filterBtns.length || !articleCols.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterVal = btn.getAttribute("data-filter");

      articleCols.forEach((col) => {
        const category = col.getAttribute("data-category");
        if (filterVal === "all" || category === filterVal) {
          col.style.display = "";
          col.classList.add("is-visible");
          col.style.animation = "fadeInCard 0.35s ease forwards";
        } else {
          col.style.display = "none";
        }
      });
    });
  });
}

// --------------------------------------------------------------------------
// 4. Animated Number Counters
// --------------------------------------------------------------------------
function initCountUpAnimation() {
  const counterElements = document.querySelectorAll(".counter-val");
  if (!counterElements.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-target"), 10);
    if (isNaN(target)) return;

    const duration = 1800; // 1.8 seconds duration
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // easeOutExpo easing curve for smooth counter slowdown at the end
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeProgress * target);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    };

    window.requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll(".counter-val");
            if (counters.length) {
              counters.forEach((c) => animateCount(c));
            } else if (entry.target.classList.contains("counter-val")) {
              animateCount(entry.target);
            }
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    const statsSections = document.querySelectorAll(
      ".about-commitment-section, .counter-section",
    );
    if (statsSections.length) {
      statsSections.forEach((sec) => observer.observe(sec));
    } else {
      counterElements.forEach((el) => observer.observe(el));
    }
  } else {
    counterElements.forEach((el) => {
      el.textContent = el.getAttribute("data-target");
    });
  }
}

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

// --------------------------------------------------------------------------
// 5. Global Redirection of Empty / '#' Links to 404 Page
// --------------------------------------------------------------------------
function initEmptyLinksRedirect() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // Ignore interactive UI toggles (dropdowns, accordions, modals, tabs, scroll-to-top)
    if (
      link.hasAttribute("data-bs-toggle") ||
      link.hasAttribute("data-bs-target") ||
      link.hasAttribute("data-bs-slide") ||
      link.classList.contains("dropdown-toggle") ||
      link.classList.contains("carousel-control-prev") ||
      link.classList.contains("carousel-control-next") ||
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

// --------------------------------------------------------------------------
// 6. Scroll Reveal Animations (Intersection Observer)
// --------------------------------------------------------------------------
function initScrollReveal() {
  // If preloader is active or hasn't finished, postpone revealing elements until preloader completes
  const preloader = document.getElementById("site-preloader");
  if (preloader && !document.body.classList.contains("preloader-complete")) {
    return;
  }

  const animateElements = document.querySelectorAll(
    ".fade-in-element:not(.is-visible), .fade-in-left:not(.is-visible), .fade-in-right:not(.is-visible), .fade-in-scale:not(.is-visible)",
  );

  if (!animateElements.length) return;

  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.12,
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
}
