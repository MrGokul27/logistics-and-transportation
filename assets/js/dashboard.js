document.addEventListener("DOMContentLoaded", () => {
  initDashboardApp();
});

// Role definitions & Metadata
const ROLE_CONFIGS = {
  customer: {
    id: "customer",
    name: "Customer / Shipper",
    badgeTitle: "Shipper Portal",
    avatarIcon: "fa-solid fa-user",
    defaultView: "customer-overview",
    sidebarMenu: [
      {
        id: "customer-overview",
        title: "Shipment Overview",
        icon: "fa-solid fa-gauge-high",
        badge: "Live",
      },
      {
        id: "customer-bookings",
        title: "My Bookings & Orders",
        icon: "fa-solid fa-box-archive",
        badge: "14 Active",
      },
      {
        id: "customer-tracking",
        title: "Live Freight Radar",
        icon: "fa-solid fa-location-crosshairs",
      },
      {
        id: "customer-quotes",
        title: "Instant Freight Quote",
        icon: "fa-solid fa-calculator",
      },
      {
        id: "customer-billing",
        title: "Invoices & Payments",
        icon: "fa-solid fa-file-invoice-dollar",
        badge: "2 Due",
      },
      {
        id: "customer-support",
        title: "Cargo Support & Claims",
        icon: "fa-solid fa-headset",
      },
    ],
  },
  driver: {
    id: "driver",
    name: "Driver / Carrier",
    badgeTitle: "Driver Hub",
    avatarIcon: "fa-solid fa-truck-moving",
    defaultView: "driver-overview",
    sidebarMenu: [
      {
        id: "driver-overview",
        title: "Driver Command",
        icon: "fa-solid fa-gauge-high",
        badge: "On Duty",
      },
      {
        id: "driver-trips",
        title: "Assigned Trips & Manifest",
        icon: "fa-solid fa-route",
        badge: "3 Today",
      },
      {
        id: "driver-stops",
        title: "Stops & Waypoints",
        icon: "fa-solid fa-list-check",
      },
      {
        id: "driver-vehicle",
        title: "Vehicle Health & DVIR",
        icon: "fa-solid fa-screwdriver-wrench",
        badge: "Passed",
      },
      {
        id: "driver-expenses",
        title: "Fuel & Toll Log",
        icon: "fa-solid fa-gas-pump",
      },
      {
        id: "driver-compliance",
        title: "Logbook & HOS (Hours)",
        icon: "fa-solid fa-id-card-clip",
      },
    ],
  },
  fleet_manager: {
    id: "fleet_manager",
    name: "Fleet Manager",
    badgeTitle: "Fleet Operations Console",
    avatarIcon: "fa-solid fa-truck-ramp-box",
    defaultView: "fleet-overview",
    sidebarMenu: [
      {
        id: "fleet-overview",
        title: "Fleet Overview",
        icon: "fa-solid fa-gauge-high",
        badge: "98% Health",
      },
      {
        id: "fleet-registry",
        title: "Vehicle Fleet Registry",
        icon: "fa-solid fa-truck-fast",
        badge: "142 Units",
      },
      {
        id: "fleet-telematics",
        title: "Live GPS Telematics",
        icon: "fa-solid fa-satellite-dish",
        badge: "Active",
      },
      {
        id: "fleet-maintenance",
        title: "Maintenance & Repairs",
        icon: "fa-solid fa-wrench",
        badge: "4 Urgent",
      },
      {
        id: "fleet-fuel",
        title: "Fuel Economy & Cards",
        icon: "fa-solid fa-chart-line",
      },
      {
        id: "fleet-safety",
        title: "Driver Safety & Telemetry",
        icon: "fa-solid fa-shield-halved",
      },
    ],
  },
  logistics_coordinator: {
    id: "logistics_coordinator",
    name: "Logistics Coordinator",
    badgeTitle: "Dispatch & Lane Control",
    avatarIcon: "fa-solid fa-network-wired",
    defaultView: "coordinator-overview",
    sidebarMenu: [
      {
        id: "coordinator-overview",
        title: "Dispatch Board",
        icon: "fa-solid fa-gauge-high",
        badge: "28 Dispatches",
      },
      {
        id: "coordinator-dispatch",
        title: "Load Planning & Routing",
        icon: "fa-solid fa-boxes-packing",
        badge: "High Load",
      },
      {
        id: "coordinator-carriers",
        title: "3PL Carrier Network",
        icon: "fa-solid fa-handshake",
      },
      {
        id: "coordinator-warehouse",
        title: "Hub & Cross-Docking",
        icon: "fa-solid fa-warehouse",
        badge: "92% Cap",
      },
      {
        id: "coordinator-incidents",
        title: "Incident & Delay Center",
        icon: "fa-solid fa-triangle-exclamation",
        badge: "2 Alerts",
      },
      {
        id: "coordinator-analytics",
        title: "Lane Performance & SLA",
        icon: "fa-solid fa-chart-pie",
      },
    ],
  },
  admin: {
    id: "admin",
    name: "Administrator",
    badgeTitle: "Global Command HQ",
    avatarIcon: "fa-solid fa-user-shield",
    defaultView: "admin-overview",
    sidebarMenu: [
      {
        id: "admin-overview",
        title: "Executive Overview",
        icon: "fa-solid fa-gauge-high",
        badge: "System OK",
      },
      {
        id: "admin-users",
        title: "Users & Role Access",
        icon: "fa-solid fa-users-gear",
        badge: "1,248 Users",
      },
      {
        id: "admin-freight",
        title: "Global Freight Master",
        icon: "fa-solid fa-earth-americas",
      },
      {
        id: "admin-financials",
        title: "Financials & Gateway",
        icon: "fa-solid fa-money-bill-trend-up",
      },
      {
        id: "admin-system",
        title: "API Integrations & IoT",
        icon: "fa-solid fa-server",
        badge: "All Up",
      },
      {
        id: "admin-logs",
        title: "Audit Trail & Security",
        icon: "fa-solid fa-shield-cat",
      },
    ],
  },
};

let currentRole = "customer";
let currentUser = {
  name: "Gokul Nath",
  email: "gokul.transport@stackly.com",
  role: "customer",
  roleTitle: "Customer / Shipper",
  loginTime: "Just now",
};
let currentActiveView = "";

function initDashboardApp() {
  loadAuthUser();
  setupRoleSelector();
  setupSidebarNavigation();
  setupMobileDrawer();
  setupLogout();
  setupEmptyLinksRedirect();
  renderRoleDashboard(currentRole);

  // Show welcome toast
  setTimeout(() => {
    showDashToast(
      `Authenticated as ${currentUser.name} (${ROLE_CONFIGS[currentRole].name})`,
      "success",
    );
  }, 400);
}

/* --------------------------------------------------------------------------
   1. User Auth & Session Loading
   -------------------------------------------------------------------------- */
function loadAuthUser() {
  // Check URL params first
  const params = new URLSearchParams(window.location.search);
  const paramRole = params.get("role");
  const paramEmail = params.get("email");

  // Check Storage
  let storedUser = null;
  try {
    const raw =
      localStorage.getItem("stackly_auth_user") ||
      sessionStorage.getItem("stackly_auth_user");
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read auth storage", e);
  }

  if (paramRole && ROLE_CONFIGS[paramRole]) {
    currentRole = paramRole;
  } else if (storedUser && storedUser.role && ROLE_CONFIGS[storedUser.role]) {
    currentRole = storedUser.role;
  } else {
    currentRole = "admin"; // Default fallback to Administrator
  }

  if (paramEmail) {
    currentUser.email = paramEmail;
    currentUser.name = formatNameFromEmail(paramEmail);
  } else if (storedUser && storedUser.email) {
    currentUser.email = storedUser.email;
    currentUser.name = storedUser.name || formatNameFromEmail(storedUser.email);
    currentUser.loginTime = storedUser.loginTime || "Logged in today";
  } else {
    currentUser.email = `${currentRole}@stacklylogistics.com`;
    currentUser.name = formatNameFromEmail(currentUser.email);
    currentUser.loginTime = "Active Session";
  }

  currentUser.role = currentRole;
  currentUser.roleTitle = ROLE_CONFIGS[currentRole].name;
}

function formatNameFromEmail(email) {
  if (!email || !email.includes("@")) return "Stackly Operator";
  const prefix = email.split("@")[0];
  return prefix.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* --------------------------------------------------------------------------
   2. Role Switcher & Header Controls
   -------------------------------------------------------------------------- */
function setupRoleSelector() {
  const selectEl = document.getElementById("dashRoleSelect");
  if (!selectEl) return;

  selectEl.value = currentRole;
  selectEl.addEventListener("change", (e) => {
    const newRole = e.target.value;
    if (ROLE_CONFIGS[newRole]) {
      currentRole = newRole;
      currentUser.role = newRole;
      currentUser.roleTitle = ROLE_CONFIGS[newRole].name;

      // Update storage
      try {
        const updated = {
          ...currentUser,
          role: newRole,
          roleTitle: ROLE_CONFIGS[newRole].name,
        };
        localStorage.setItem("stackly_auth_user", JSON.stringify(updated));
      } catch (err) {}

      renderRoleDashboard(currentRole);
      showDashToast(
        `Role switched to ${ROLE_CONFIGS[newRole].name}`,
        "success",
      );
    }
  });
}

function updateHeaderUserInfo() {
  const roleCfg = ROLE_CONFIGS[currentRole];

  // Update Header & Topbar elements
  const userRoleBadge = document.getElementById("topbarUserRole");
  if (userRoleBadge) userRoleBadge.textContent = roleCfg.badgeTitle;

  const topbarUserName = document.getElementById("topbarUserName");
  if (topbarUserName) topbarUserName.textContent = currentUser.name;

  const topbarUserAvatar = document.getElementById("topbarUserAvatar");
  if (topbarUserAvatar) {
    topbarUserAvatar.innerHTML = `<i class="${roleCfg.avatarIcon}"></i>`;
  }

  const roleSelect = document.getElementById("dashRoleSelect");
  if (roleSelect) roleSelect.value = currentRole;

  // Sidebar User Card
  const sidebarUserName = document.getElementById("sidebarUserName");
  if (sidebarUserName) sidebarUserName.textContent = currentUser.name;

  const sidebarUserRole = document.getElementById("sidebarUserRole");
  if (sidebarUserRole) {
    sidebarUserRole.innerHTML = `<i class="${roleCfg.avatarIcon} me-1"></i> ${roleCfg.name}`;
  }

  const sidebarUserAvatar = document.getElementById("sidebarUserAvatar");
  if (sidebarUserAvatar) {
    const initials = currentUser.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    sidebarUserAvatar.textContent = initials || "SL";
  }
}

/* --------------------------------------------------------------------------
   3. Sidebar Rendering & View Switching
   -------------------------------------------------------------------------- */
function setupSidebarNavigation() {
  const sidebarNavList = document.getElementById("sidebarNavList");
  if (!sidebarNavList) return;

  sidebarNavList.addEventListener("click", (e) => {
    const link = e.target.closest(".sidebar-nav-link");
    if (!link) return;

    e.preventDefault();
    const targetView = link.getAttribute("data-view");
    if (targetView) {
      switchView(targetView);
      // Close mobile drawer on selection
      closeMobileSidebar();
    }
  });
}

function renderSidebarMenu(roleKey) {
  const sidebarNavList = document.getElementById("sidebarNavList");
  if (!sidebarNavList) return;

  const config = ROLE_CONFIGS[roleKey];
  if (!config) return;

  let html = "";
  config.sidebarMenu.forEach((item, index) => {
    const isActive = index === 0 ? "active" : "";
    const badgeHtml = item.badge
      ? `<span class="sidebar-badge badge-primary">${item.badge}</span>`
      : "";

    html += `
      <li class="sidebar-nav-item">
        <a href="#" class="sidebar-nav-link ${isActive}" data-view="${item.id}">
          <i class="${item.icon}" aria-hidden="true"></i>
          <span>${item.title}</span>
          ${badgeHtml}
        </a>
      </li>
    `;
  });

  sidebarNavList.innerHTML = html;
}

function switchView(viewId) {
  currentActiveView = viewId;

  // Update active state in sidebar
  const links = document.querySelectorAll(".sidebar-nav-link");
  links.forEach((l) => {
    if (l.getAttribute("data-view") === viewId) {
      l.classList.add("active");
    } else {
      l.classList.remove("active");
    }
  });

  // Update Page Title in Topbar
  const config = ROLE_CONFIGS[currentRole];
  const menuItem = config.sidebarMenu.find((m) => m.id === viewId);
  const titleEl = document.getElementById("topbarPageTitle");
  if (titleEl && menuItem) {
    titleEl.textContent = menuItem.title;
  }

  // Show corresponding view panel
  const container = document.getElementById("dashboardViewContainer");
  if (!container) return;

  const viewHtml = generateViewContent(currentRole, viewId);
  container.innerHTML = viewHtml;

  // Re-attach view-specific handlers (like quote calculator, search filters, DVIR checklist)
  initViewInteractions(viewId);
}

/* --------------------------------------------------------------------------
   4. Render Full Role Dashboard
   -------------------------------------------------------------------------- */
function renderRoleDashboard(roleKey) {
  updateHeaderUserInfo();
  renderSidebarMenu(roleKey);
  const defaultView = ROLE_CONFIGS[roleKey].defaultView;
  switchView(defaultView);
}

/* --------------------------------------------------------------------------
   5. Dynamic View Content Generator (Rich Authentic Logistics Data)
   -------------------------------------------------------------------------- */
function generateViewContent(role, viewId) {
  switch (role) {
    case "customer":
      return getCustomerView(viewId);
    case "driver":
      return getDriverView(viewId);
    case "fleet_manager":
      return getFleetManagerView(viewId);
    case "logistics_coordinator":
      return getCoordinatorView(viewId);
    case "admin":
      return getAdminView(viewId);
    default:
      return `<div class="p-4 text-center"><h4>Select a view</h4></div>`;
  }
}

/* ==========================================================================
   ROLE 1: CUSTOMER / SHIPPER VIEWS
   ========================================================================== */
function getCustomerView(viewId) {
  if (viewId === "customer-overview") {
    return `
      <!-- Welcome Hero Banner -->
      <div class="welcome-hero-card">
        <span class="welcome-badge"><i class="fa-solid fa-boxes-packing"></i> Shipper Command Portal</span>
        <h1 class="welcome-title">Welcome back, <span>${currentUser.name}</span></h1>
        <p class="welcome-desc">Track your global ocean containers, air cargo consignments, and domestic line-haul freight in real-time with automated SLA tracking.</p>
        <div class="welcome-meta-pills">
          <span class="meta-pill"><i class="fa-solid fa-envelope"></i> ${currentUser.email}</span>
          <span class="meta-pill"><i class="fa-solid fa-clock"></i> Last Login: ${currentUser.loginTime}</span>
          <span class="meta-pill"><i class="fa-solid fa-shield-check"></i> Enterprise Account Tier-1</span>
        </div>
      </div>

      <!-- KPI Metrics Row (Equally Aligned) -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap orange"><i class="fa-solid fa-truck-ramp-box"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +8.4%</span>
            </div>
            <div>
              <div class="metric-title">Active Shipments</div>
              <div class="metric-value">14</div>
              <p class="metric-subtitle">8 Sea Freight • 4 Road • 2 Air Cargo</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap green"><i class="fa-solid fa-circle-check"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-arrow-up"></i> 99.2%</span>
            </div>
            <div>
              <div class="metric-title">On-Time Delivery Rate</div>
              <div class="metric-value">98.8%</div>
              <p class="metric-subtitle">+1.4% better than industry benchmark</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap blue"><i class="fa-solid fa-weight-hanging"></i></div>
              <span class="metric-trend neutral"><i class="fa-solid fa-minus"></i> Stable</span>
            </div>
            <div>
              <div class="metric-title">Total Tonnage (MTD)</div>
              <div class="metric-value">142.8 MT</div>
              <p class="metric-subtitle">48 Full Container Loads (FCL)</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap purple"><i class="fa-solid fa-receipt"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-check"></i> Clean</span>
            </div>
            <div>
              <div class="metric-title">Pending Invoices</div>
              <div class="metric-value">$8,420</div>
              <p class="metric-subtitle">2 freight bills due in 15 days</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Live Shipment Table & Quick Actions -->
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-list-check"></i> Active Consignment Pipeline</h2>
              <div class="dash-card-actions">
                <button class="btn btn-sm btn-outline-secondary" onclick="exportDataToast('shipments')"><i class="fa-solid fa-download me-1"></i> Export CSV</button>
              </div>
            </div>
            <div class="dash-card-body p-0">
              <div class="table-responsive">
                <table class="table dash-table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Tracking / Waybill</th>
                      <th>Origin & Destination</th>
                      <th>Freight Mode</th>
                      <th>Carrier / Vessel</th>
                      <th>ETA Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">AXT-99482-SEA</span>
                        <span class="dash-table-subtext">40ft HC Reefer Container</span>
                      </td>
                      <td>
                        <span class="dash-table-primary-text">Rotterdam Hub (NLD)</span>
                        <span class="dash-table-subtext">to Newark Port (USA)</span>
                      </td>
                      <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="fa-solid fa-ship me-1"></i> Ocean FCL</span></td>
                      <td>Maersk Line (Vessel Madrid)</td>
                      <td><span class="status-badge in-transit"><i class="fa-solid fa-circle-dot"></i> In Transit (ETA Oct 14)</span></td>
                      <td>
                        <button class="btn-table-action" title="View Telemetry" onclick="switchView('customer-tracking')"><i class="fa-solid fa-eye"></i></button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">AXT-88214-AIR</span>
                        <span class="dash-table-subtext">High-Value Tech Hardware</span>
                      </td>
                      <td>
                        <span class="dash-table-primary-text">Frankfurt CargoCity (DEU)</span>
                        <span class="dash-table-subtext">to Chicago O'Hare (USA)</span>
                      </td>
                      <td><span class="badge bg-info-subtle text-info border border-info-subtle"><i class="fa-solid fa-plane me-1"></i> Air Priority</span></td>
                      <td>Lufthansa Cargo Flight 824</td>
                      <td><span class="status-badge delivered"><i class="fa-solid fa-check-double"></i> Customs Cleared</span></td>
                      <td>
                        <button class="btn-table-action" title="View Telemetry" onclick="switchView('customer-tracking')"><i class="fa-solid fa-eye"></i></button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">AXT-77401-ROD</span>
                        <span class="dash-table-subtext">Automotive Spare Parts</span>
                      </td>
                      <td>
                        <span class="dash-table-primary-text">Detroit Logistics Center</span>
                        <span class="dash-table-subtext">to Dallas Distribution Hub</span>
                      </td>
                      <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle"><i class="fa-solid fa-truck me-1"></i> Road FTL</span></td>
                      <td>Stackly Dedicated Fleet #TRK-104</td>
                      <td><span class="status-badge in-transit"><i class="fa-solid fa-location-arrow"></i> En Route (ETA Today 18:00)</span></td>
                      <td>
                        <button class="btn-table-action" title="View Telemetry" onclick="switchView('customer-tracking')"><i class="fa-solid fa-eye"></i></button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">AXT-66520-EXP</span>
                        <span class="dash-table-subtext">Pharma Cold-Chain Batch #92</span>
                      </td>
                      <td>
                        <span class="dash-table-primary-text">Basel Biotech Park (CHE)</span>
                        <span class="dash-table-subtext">to London Gateway Hub (GBR)</span>
                      </td>
                      <td><span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="fa-solid fa-temperature-arrow-down me-1"></i> Cold Chain</span></td>
                      <td>Stackly Cryo-Express Unit</td>
                      <td><span class="status-badge active"><i class="fa-solid fa-snowflake"></i> Temp Monitored (-18.2°C)</span></td>
                      <td>
                        <button class="btn-table-action" title="View Telemetry" onclick="switchView('customer-tracking')"><i class="fa-solid fa-eye"></i></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="dash-card-footer">
              <span class="text-muted small">Showing 4 of 14 active consignments</span>
              <button class="btn btn-sm btn-link text-primary text-decoration-none fw-bold" onclick="switchView('customer-bookings')">View All Shipments <i class="fa-solid fa-arrow-right ms-1"></i></button>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-bolt"></i> Quick Freight Actions</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <button class="btn btn-primary d-flex align-items-center justify-content-between p-3" onclick="switchView('customer-quotes')">
                <div class="text-start">
                  <div class="fw-bold"><i class="fa-solid fa-calculator me-2"></i> Instant Freight Quote</div>
                  <small class="opacity-75">Calculate multi-modal rates</small>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
              </button>

              <button class="btn btn-outline-secondary d-flex align-items-center justify-content-between p-3" onclick="switchView('customer-tracking')">
                <div class="text-start">
                  <div class="fw-bold"><i class="fa-solid fa-map-location-dot me-2"></i> Track Consignment</div>
                  <small class="text-muted">Enter AXT-Waybill or Container ID</small>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
              </button>

              <button class="btn btn-outline-secondary d-flex align-items-center justify-content-between p-3" onclick="switchView('customer-billing')">
                <div class="text-start">
                  <div class="fw-bold"><i class="fa-solid fa-file-invoice-dollar me-2"></i> Download Invoices</div>
                  <small class="text-muted">Generate consolidated tax bills</small>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
              </button>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="fa-solid fa-headset text-primary"></i>
                  <span class="fw-bold small">Dedicated Account Dispatcher</span>
                </div>
                <p class="small text-muted mb-2">Marcus Vance • Senior Logistics Desk</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-xs btn-outline-primary btn-sm flex-fill" onclick="showDashToast('Connecting to dispatch hotline...', 'success')"><i class="fa-solid fa-phone me-1"></i> Call Hub</button>
                  <button class="btn btn-xs btn-outline-dark btn-sm flex-fill" onclick="switchView('customer-support')"><i class="fa-solid fa-message me-1"></i> Open Ticket</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "customer-bookings") {
    return `
      <div class="dash-card mb-4">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-boxes-stacked"></i> All Consignments & Booking Registry</h2>
          <button class="btn btn-sm btn-primary" onclick="switchView('customer-quotes')"><i class="fa-solid fa-plus me-1"></i> Book New Cargo</button>
        </div>
        <div class="dash-card-body">
          <div class="dash-toolbar">
            <div class="dash-search-input-group">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" class="dash-search-input" id="tableFilterInput" placeholder="Filter by Tracking ID, origin, destination..." />
            </div>
            <div class="d-flex gap-2">
              <select class="dash-filter-select" id="modeFilterSelect">
                <option value="all">All Modes (Ocean, Road, Air)</option>
                <option value="ocean">Ocean FCL/LCL</option>
                <option value="road">Road Freight</option>
                <option value="air">Air Cargo</option>
              </select>
              <button class="btn btn-outline-secondary" onclick="exportDataToast('shipments')"><i class="fa-solid fa-file-excel me-1"></i> Export XLS</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Commodity Type</th>
                  <th>Origin & Destination</th>
                  <th>Carrier Vessel / Fleet</th>
                  <th>Weight & Volume</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="bookingsTableBody">
                <tr>
                  <td><span class="dash-table-primary-text">AXT-99482-SEA</span><span class="dash-table-subtext">Ocean Bill #BL-77192</span></td>
                  <td>Electronics & Solar Panels</td>
                  <td>Rotterdam (NLD) &rarr; Newark (USA)</td>
                  <td>Maersk Line (Madrid Express)</td>
                  <td>24,500 KG • 68 CBM</td>
                  <td><span class="status-badge in-transit">In Transit</span></td>
                  <td><button class="btn-table-action" onclick="showConsignmentModal('AXT-99482-SEA')"><i class="fa-solid fa-file-lines"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">AXT-88214-AIR</span><span class="dash-table-subtext">Air Waybill #AWB-020</span></td>
                  <td>Precision Medical Instruments</td>
                  <td>Frankfurt (DEU) &rarr; Chicago (USA)</td>
                  <td>Lufthansa Cargo Flight 824</td>
                  <td>1,850 KG • 12 CBM</td>
                  <td><span class="status-badge delivered">Delivered</span></td>
                  <td><button class="btn-table-action" onclick="showConsignmentModal('AXT-88214-AIR')"><i class="fa-solid fa-file-lines"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">AXT-77401-ROD</span><span class="dash-table-subtext">Freight Manifest #MF-401</span></td>
                  <td>Automotive Body Panels</td>
                  <td>Detroit Hub &rarr; Dallas Center</td>
                  <td>Stackly Road Fleet #TRK-104</td>
                  <td>18,200 KG • 45 CBM</td>
                  <td><span class="status-badge in-transit">En Route</span></td>
                  <td><button class="btn-table-action" onclick="showConsignmentModal('AXT-77401-ROD')"><i class="fa-solid fa-file-lines"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">AXT-66520-EXP</span><span class="dash-table-subtext">Pharma Cold Manifest</span></td>
                  <td>Vaccine Supply & Cryogenics</td>
                  <td>Basel (CHE) &rarr; London Gateway</td>
                  <td>Stackly Cold-Chain Unit 12</td>
                  <td>4,200 KG • 18 CBM</td>
                  <td><span class="status-badge active">Monitored (-18°C)</span></td>
                  <td><button class="btn-table-action" onclick="showConsignmentModal('AXT-66520-EXP')"><i class="fa-solid fa-file-lines"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">AXT-55109-SEA</span><span class="dash-table-subtext">Ocean Bill #BL-66281</span></td>
                  <td>Industrial Machinery Parts</td>
                  <td>Hamburg (DEU) &rarr; Singapore Port</td>
                  <td>Hapag-Lloyd (Al-Murabba)</td>
                  <td>32,000 KG • 84 CBM</td>
                  <td><span class="status-badge in-transit">In Transit</span></td>
                  <td><button class="btn-table-action" onclick="showConsignmentModal('AXT-55109-SEA')"><i class="fa-solid fa-file-lines"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "customer-tracking") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-5">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-location-crosshairs"></i> Live Consignment Radar</h2>
            </div>
            <div class="dash-card-body">
              <div class="mb-3">
                <label class="form-label fw-bold small text-muted">Tracking Code / Container Number</label>
                <div class="input-group">
                  <input type="text" class="form-control" value="AXT-99482-SEA" id="radarTrackingInput" />
                  <button class="btn btn-primary" onclick="showDashToast('Synchronizing live GPS telemetry...', 'success')"><i class="fa-solid fa-satellite-dish me-1"></i> Locate</button>
                </div>
              </div>

              <div class="p-3 bg-light rounded-3 border mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold">Maersk Madrid Express</span>
                  <span class="status-badge in-transit">Mid-Atlantic Corridor</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-fill" style="width: 68%;"></div>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                  <span>Departed: Rotterdam (Oct 06)</span>
                  <span>ETA: Newark (Oct 14, 09:00)</span>
                </div>
              </div>

              <div class="tracking-timeline">
                <div class="timeline-step completed">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Container Picked Up & Port Gated In</div>
                  <div class="timeline-desc">Port of Rotterdam Container Terminal Bay 42</div>
                  <div class="timeline-time">Oct 05, 14:30 CET • Verified</div>
                </div>
                <div class="timeline-step completed">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Vessel Departure & Ocean Linehaul</div>
                  <div class="timeline-desc">Vessel MMSI: 219018000 • Speed 19.4 Knots</div>
                  <div class="timeline-time">Oct 06, 06:15 CET • Automated AIS</div>
                </div>
                <div class="timeline-step current">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Mid-Atlantic Ocean Transit (Waypoint 4)</div>
                  <div class="timeline-desc">Lat: 38.241° N, Lon: -34.819° W • Reefer Temp: -18.4°C</div>
                  <div class="timeline-time">Live Telematics Pulse • 4 mins ago</div>
                </div>
                <div class="timeline-step">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Port Arrival & US Customs Clearance</div>
                  <div class="timeline-desc">Port of Newark Container Terminal (PNCT)</div>
                  <div class="timeline-time">Expected: Oct 14, 09:00 EDT</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-7">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-map"></i> Global Route Telemetry Map</h2>
              <span class="badge bg-success-subtle text-success border border-success-subtle"><i class="fa-solid fa-satellite me-1"></i> Live AIS Feed</span>
            </div>
            <div class="dash-card-body p-0 position-relative" style="min-height: 420px; background: #0f172a; border-radius: 0 0 16px 16px; overflow: hidden;">
              <!-- Simulated Interactive GPS Map Interface -->
              <div class="p-4 text-white d-flex flex-column justify-content-between h-100">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="bg-dark bg-opacity-75 p-2 px-3 rounded-3 border border-secondary">
                    <div class="small text-warning fw-bold"><i class="fa-solid fa-ship me-1"></i> VESSEL POSITION</div>
                    <div class="font-monospace">38°14'28" N, 34°49'08" W</div>
                  </div>
                  <div class="bg-dark bg-opacity-75 p-2 px-3 rounded-3 border border-secondary text-end">
                    <div class="small text-info fw-bold">SPEED OVER GROUND</div>
                    <div class="font-monospace">19.4 Knots (35.9 km/h)</div>
                  </div>
                </div>

                <div class="text-center my-5">
                  <div class="d-inline-flex flex-column align-items-center p-3 rounded-circle bg-primary bg-opacity-25 border border-primary animate-pulse">
                    <i class="fa-solid fa-location-dot text-primary fs-1"></i>
                  </div>
                  <h4 class="text-white mt-3 font-heading">Trans-Atlantic Freight Corridor 1</h4>
                  <p class="text-secondary small">Ocean Route: Rotterdam Gateway &rarr; New York / New Jersey Port</p>
                </div>

                <div class="bg-dark bg-opacity-75 p-3 rounded-3 border border-secondary d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <span class="text-muted small">Cargo Status:</span>
                    <span class="fw-bold text-success ms-1"><i class="fa-solid fa-shield-check me-1"></i> Optimal Environment & Zero Impact</span>
                  </div>
                  <div>
                    <button class="btn btn-sm btn-outline-light" onclick="showDashToast('Telemetry report downloaded', 'success')"><i class="fa-solid fa-download me-1"></i> Telematics Log</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "customer-quotes") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <div class="quote-calc-card">
            <h2 class="dash-card-title mb-3"><i class="fa-solid fa-calculator"></i> Multi-Modal Freight Rate Estimator</h2>
            <p class="text-muted small mb-4">Calculate instant live tariffs for containerized ocean, priority air, and full-truckload freight across 180+ global trade lanes.</p>

            <label class="form-label fw-bold small text-muted">1. Select Transport Mode</label>
            <div class="quote-mode-selector">
              <div class="quote-mode-btn active" data-mode="ocean" onclick="selectQuoteMode(this)">
                <i class="fa-solid fa-ship"></i>
                <span>Ocean FCL</span>
              </div>
              <div class="quote-mode-btn" data-mode="air" onclick="selectQuoteMode(this)">
                <i class="fa-solid fa-plane"></i>
                <span>Air Express</span>
              </div>
              <div class="quote-mode-btn" data-mode="road" onclick="selectQuoteMode(this)">
                <i class="fa-solid fa-truck"></i>
                <span>Road Linehaul</span>
              </div>
              <div class="quote-mode-btn" data-mode="intermodal" onclick="selectQuoteMode(this)">
                <i class="fa-solid fa-train"></i>
                <span>Rail / Intermodal</span>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold small text-muted">Origin Port / Hub</label>
                <select class="form-select" id="quoteOrigin">
                  <option value="rotterdam">Port of Rotterdam (NLD)</option>
                  <option value="frankfurt">Frankfurt CargoCity (DEU)</option>
                  <option value="singapore">Port of Singapore (SGP)</option>
                  <option value="shanghai">Port of Shanghai (CHN)</option>
                  <option value="detroit">Detroit Logistics Hub (USA)</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold small text-muted">Destination Port / Hub</label>
                <select class="form-select" id="quoteDest">
                  <option value="newark">Port of Newark / NY (USA)</option>
                  <option value="chicago">Chicago O'Hare Freight (USA)</option>
                  <option value="losangeles">Port of Los Angeles (USA)</option>
                  <option value="london">London Gateway (GBR)</option>
                  <option value="dallas">Dallas Inland Port (USA)</option>
                </select>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-bold small text-muted">Gross Cargo Weight (KG)</label>
                <input type="number" class="form-control" id="quoteWeight" value="12500" min="100" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold small text-muted">Cargo Type</label>
                <select class="form-select" id="quoteCargoType">
                  <option value="general">General Dry Freight (Standard)</option>
                  <option value="reefer">Reefer Temperature Controlled (+15%)</option>
                  <option value="hazmat">Hazmat / Dangerous Goods Class 3 (+25%)</option>
                  <option value="highvalue">High-Value Bonded Cargo (+20%)</option>
                </select>
              </div>
            </div>

            <button class="btn btn-primary w-100 py-2 fw-bold" onclick="calculateInstantQuote()"><i class="fa-solid fa-calculator me-2"></i> Recalculate Live Tariff</button>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="quote-result-box h-100 d-flex flex-column justify-content-between">
            <div>
              <span class="welcome-badge"><i class="fa-solid fa-sparkles"></i> Guaranteed Rate Lock (7 Days)</span>
              <h3 class="text-white mt-2 font-heading">Estimated Freight Cost</h3>
              <div class="quote-estimate-price" id="quoteResultPrice">$3,840.00</div>
              <p class="text-secondary small" id="quoteBreakdownText">Includes Bunker Surcharges (BAF), Terminal Handling (THC), and Carbon Offsetting.</p>

              <hr class="border-secondary opacity-25 my-3" />

              <div class="text-start small text-light d-flex flex-column gap-2">
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Base Freight:</span>
                  <span class="fw-bold" id="quoteBaseFee">$3,150.00</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Port Handling (THC):</span>
                  <span class="fw-bold">$420.00</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Customs Documentation:</span>
                  <span class="fw-bold">$180.00</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Green Carrier Carbon Neutral:</span>
                  <span class="fw-bold text-success">$90.00 (Included)</span>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-top border-secondary border-opacity-25">
              <button class="btn btn-primary w-100 py-2 fw-bold mb-2" onclick="showDashToast('Consignment Draft #AXT-BK-2026 created!', 'success')"><i class="fa-solid fa-check-circle me-1"></i> Confirm & Book Consignment</button>
              <small class="text-muted d-block text-center">Instant dispatch confirmation & EDI booking generation.</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "customer-billing") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-file-invoice-dollar"></i> Freight Invoices & Statement of Accounts</h2>
          <button class="btn btn-sm btn-outline-secondary" onclick="exportDataToast('invoices')"><i class="fa-solid fa-download me-1"></i> Export Tax Invoices</button>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Consignment / BOL</th>
                  <th>Billing Period</th>
                  <th>Amount (USD)</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dash-table-primary-text">INV-2026-8891</span><span class="dash-table-subtext">Issued: Oct 01, 2026</span></td>
                  <td>AXT-99482-SEA (Rotterdam &rarr; Newark)</td>
                  <td>Monthly Freight Cycle #10</td>
                  <td><strong class="text-dark">$4,850.00</strong></td>
                  <td><span class="status-badge pending">Due in 12 Days</span></td>
                  <td><button class="btn btn-sm btn-primary" onclick="showDashToast('Redirecting to secure gateway...', 'success')">Pay Now</button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">INV-2026-8740</span><span class="dash-table-subtext">Issued: Sep 24, 2026</span></td>
                  <td>AXT-88214-AIR (Frankfurt &rarr; Chicago)</td>
                  <td>Air Express Dedicated</td>
                  <td><strong class="text-dark">$3,570.00</strong></td>
                  <td><span class="status-badge delivered">Paid • Oct 03</span></td>
                  <td><button class="btn-table-action" onclick="showDashToast('Downloading Invoice PDF...', 'success')"><i class="fa-solid fa-file-pdf"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">INV-2026-8612</span><span class="dash-table-subtext">Issued: Sep 18, 2026</span></td>
                  <td>AXT-77401-ROD (Detroit &rarr; Dallas)</td>
                  <td>FTL Linehaul Billing</td>
                  <td><strong class="text-dark">$2,940.00</strong></td>
                  <td><span class="status-badge delivered">Paid • Sep 25</span></td>
                  <td><button class="btn-table-action" onclick="showDashToast('Downloading Invoice PDF...', 'success')"><i class="fa-solid fa-file-pdf"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "customer-support") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-headset"></i> File a Cargo Support Ticket or Claim</h2>
            </div>
            <div class="dash-card-body">
              <form onsubmit="event.preventDefault(); showDashToast('Support Ticket #TKT-8901 filed with Priority Desk!', 'success'); this.reset();">
                <div class="mb-3">
                  <label class="form-label fw-bold small text-muted">Related Waybill / Consignment ID</label>
                  <input type="text" class="form-control" placeholder="e.g. AXT-99482-SEA" required />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small text-muted">Inquiry Category</label>
                  <select class="form-select" required>
                    <option value="">Select Category...</option>
                    <option value="tracking">Live ETA Update & Radar Clarification</option>
                    <option value="customs">Customs Clearance & HS Tariff Code</option>
                    <option value="claim">Cargo Loss / Damage Insurance Claim</option>
                    <option value="billing">Invoice Discrepancy & Deturrage</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small text-muted">Detailed Description</label>
                  <textarea class="form-control" rows="4" placeholder="Provide details regarding your freight request..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary fw-bold"><i class="fa-solid fa-paper-plane me-1"></i> Submit Support Request</button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-circle-question"></i> Active Support Requests</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">#TKT-8412 • Customs Document</span>
                  <span class="status-badge delivered">Resolved</span>
                </div>
                <p class="small text-muted mb-1">EUR-1 Certificate of Origin uploaded for Rotterdam consignment.</p>
                <small class="text-primary">Closed Oct 07 by Agent Sarah L.</small>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">#TKT-8790 • Reefer Setpoint Check</span>
                  <span class="status-badge in-transit">In Progress</span>
                </div>
                <p class="small text-muted mb-1">Monitoring cold-chain batch telemetry for Basel &rarr; London trip.</p>
                <small class="text-warning fw-bold">Assigned to Cold-Chain QA</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `<div class="p-4">Customer View</div>`;
}

/* ==========================================================================
   ROLE 2: DRIVER / CARRIER VIEWS
   ========================================================================== */
function getDriverView(viewId) {
  if (viewId === "driver-overview") {
    return `
      <!-- Welcome Hero Banner -->
      <div class="welcome-hero-card">
        <span class="welcome-badge"><i class="fa-solid fa-truck-moving"></i> Driver Command Center</span>
        <h1 class="welcome-title">Driver Station: <span>${currentUser.name}</span></h1>
        <p class="welcome-desc">Assigned Vehicle: <strong>Volvo FH16 (Unit #TRK-104)</strong> • Route Corridor: I-75 Northbound • Shift Status: <strong>On Duty (Driving)</strong></p>
        <div class="welcome-meta-pills">
          <span class="meta-pill"><i class="fa-solid fa-id-card"></i> CDL-A #CDL-98421-US</span>
          <span class="meta-pill"><i class="fa-solid fa-clock"></i> HOS Driving Left: 7h 45m</span>
          <span class="meta-pill"><i class="fa-solid fa-star text-warning"></i> Safety Score: 98.6 / 100</span>
        </div>
      </div>

      <!-- Driver KPIs (Equally Aligned) -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap orange"><i class="fa-solid fa-route"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-check"></i> On Time</span>
            </div>
            <div>
              <div class="metric-title">Today's Route Progress</div>
              <div class="metric-value">342 / 510 mi</div>
              <p class="metric-subtitle">67% of Chicago to Atlanta route complete</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap green"><i class="fa-solid fa-gas-pump"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-leaf"></i> Eco+</span>
            </div>
            <div>
              <div class="metric-title">Fuel Economy</div>
              <div class="metric-value">7.4 MPG</div>
              <p class="metric-subtitle">+0.6 MPG above fleet average</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap blue"><i class="fa-solid fa-location-dot"></i></div>
              <span class="metric-trend neutral">Stop 2 of 4</span>
            </div>
            <div>
              <div class="metric-title">Next Waypoint Stop</div>
              <div class="metric-value">Indianapolis Hub</div>
              <p class="metric-subtitle">Dock Door #18 • ETA: 16:30 EDT</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap purple"><i class="fa-solid fa-clock-rotate-left"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-shield-check"></i> Legal</span>
            </div>
            <div>
              <div class="metric-title">Hours of Service (HOS)</div>
              <div class="metric-value">7h 45m</div>
              <p class="metric-subtitle">30-min break taken at 12:15</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Route Checklist & DVIR Quick Status -->
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-list-check"></i> Today's Delivery Manifest & Stop Actions</h2>
              <button class="btn btn-sm btn-primary" onclick="switchView('driver-stops')"><i class="fa-solid fa-location-arrow me-1"></i> Interactive Navigation</button>
            </div>
            <div class="dash-card-body p-0">
              <div class="table-responsive">
                <table class="table dash-table align-middle">
                  <thead>
                    <tr>
                      <th>Stop #</th>
                      <th>Location / Facility</th>
                      <th>Cargo Manifest</th>
                      <th>Scheduled Window</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="table-light">
                      <td><span class="badge bg-success">Stop 1</span></td>
                      <td>
                        <span class="dash-table-primary-text">Chicago Central Depot</span>
                        <span class="dash-table-subtext">Origin Loading Gate #04</span>
                      </td>
                      <td>Palletized Auto Parts (18,200 KG)</td>
                      <td>07:30 - 08:30 EDT</td>
                      <td><span class="status-badge delivered"><i class="fa-solid fa-check"></i> Loaded & Signed</span></td>
                      <td><button class="btn-table-action" title="View POD" onclick="showDashToast('Proof of Delivery POD-910 verified', 'success')"><i class="fa-solid fa-signature"></i></button></td>
                    </tr>
                    <tr>
                      <td><span class="badge bg-primary">Stop 2</span></td>
                      <td>
                        <span class="dash-table-primary-text">Indianapolis Cross-Dock Hub</span>
                        <span class="dash-table-subtext">Unload 6 Pallets • Bay 18</span>
                      </td>
                      <td>Transmission Units (6,400 KG)</td>
                      <td>16:00 - 17:00 EDT</td>
                      <td><span class="status-badge in-transit"><i class="fa-solid fa-truck-fast"></i> Approaching (32 mi)</span></td>
                      <td><button class="btn btn-sm btn-primary" onclick="markDriverStopComplete(this, 'Indianapolis')"><i class="fa-solid fa-check me-1"></i> Mark Arrived</button></td>
                    </tr>
                    <tr>
                      <td><span class="badge bg-secondary">Stop 3</span></td>
                      <td>
                        <span class="dash-table-primary-text">Louisville Freight Terminal</span>
                        <span class="dash-table-subtext">Pick up Staged Return Containers</span>
                      </td>
                      <td>Empty Return Crates (2,100 KG)</td>
                      <td>Tomorrow 09:00 EDT</td>
                      <td><span class="status-badge pending">Scheduled</span></td>
                      <td><button class="btn-table-action" disabled><i class="fa-solid fa-lock"></i></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-shield-halved"></i> Vehicle Health & Safety</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold">Pre-Trip DVIR Inspection</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle">PASSED</span>
                </div>
                <small class="text-muted d-block mb-2">Brakes, Tires, Air Pressure, Lights & Coupling verified at 06:45 EDT.</small>
                <button class="btn btn-xs btn-outline-dark btn-sm w-100" onclick="switchView('driver-vehicle')"><i class="fa-solid fa-clipboard-check me-1"></i> Review Full Inspection</button>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">Tire Pressure Monitoring (TPMS)</span>
                  <span class="text-success small fw-bold">All 105 PSI</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-fill bg-success" style="width: 100%;"></div>
                </div>
                <small class="text-muted">Zero air leaks detected in trailer #TL-889.</small>
              </div>

              <button class="btn btn-warning d-flex align-items-center justify-content-center gap-2 fw-bold" onclick="showDashToast('Dispatch alerted: roadside assistance requested', 'warning')">
                <i class="fa-solid fa-triangle-exclamation"></i> Report Roadside Incident
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "driver-trips") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-route"></i> Driver Trip Schedule & Load Manifests</h2>
          <button class="btn btn-sm btn-outline-secondary" onclick="exportDataToast('driver-trips')"><i class="fa-solid fa-print me-1"></i> Print Manifest</button>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Trip #</th>
                  <th>Route Lane</th>
                  <th>Trailer / Rig</th>
                  <th>Total Miles</th>
                  <th>Cargo Weight</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr class="table-warning bg-opacity-25">
                  <td><span class="dash-table-primary-text">TRIP-7719</span><span class="dash-table-subtext">Active Mission</span></td>
                  <td>Chicago (ORD) &rarr; Atlanta (ATL) via I-65/I-75</td>
                  <td>Volvo FH16 (Unit #TRK-104) + Trailer 53ft</td>
                  <td>510 Miles</td>
                  <td>24,500 LBS</td>
                  <td><span class="status-badge in-transit">In Progress</span></td>
                  <td><button class="btn btn-sm btn-primary" onclick="switchView('driver-stops')">Open Navigation</button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">TRIP-7724</span><span class="dash-table-subtext">Upcoming Next Shift</span></td>
                  <td>Atlanta Hub &rarr; Savannah Port (Ocean Link)</td>
                  <td>Volvo FH16 (Unit #TRK-104) + Chassis</td>
                  <td>248 Miles</td>
                  <td>38,000 LBS (FCL Container)</td>
                  <td><span class="status-badge pending">Dispatched</span></td>
                  <td><button class="btn-table-action" onclick="showDashToast('Trip manifest downloaded to tablet', 'success')"><i class="fa-solid fa-file-pdf"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">TRIP-7680</span><span class="dash-table-subtext">Completed Yesterday</span></td>
                  <td>Detroit Gateway &rarr; Chicago Hub</td>
                  <td>Volvo FH16 (Unit #TRK-104)</td>
                  <td>284 Miles</td>
                  <td>19,800 LBS</td>
                  <td><span class="status-badge delivered">Completed & Settled</span></td>
                  <td><button class="btn-table-action" onclick="showDashToast('Settlement Statement: $480.00 Driver Pay Credited', 'success')"><i class="fa-solid fa-receipt"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "driver-stops") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-list-check"></i> Turn-by-Turn Waypoints & Delivery Confirmation</h2>
            </div>
            <div class="dash-card-body">
              <div class="tracking-timeline">
                <div class="timeline-step completed">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Stop 1: Origin Pick Up (Chicago Depot)</div>
                  <div class="timeline-desc">Gate 4 • 18,200 KG loaded • BOL signed by Dockmaster Robert</div>
                  <div class="timeline-time">Completed at 08:15 EDT • e-Signature verified</div>
                </div>
                <div class="timeline-step current">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Stop 2: Indianapolis Cross-Dock Hub (CURRENT)</div>
                  <div class="timeline-desc">Facility: 8900 Logistics Blvd, Indianapolis, IN 46268 • Dock #18</div>
                  <div class="timeline-time">Estimated Arrival: 16:30 EDT (32 min away)</div>
                  <div class="mt-2">
                    <button class="btn btn-sm btn-primary" onclick="markDriverStopComplete(this, 'Indianapolis Hub')"><i class="fa-solid fa-signature me-1"></i> Capture Consignee Signature</button>
                    <button class="btn btn-sm btn-outline-secondary ms-1" onclick="showDashToast('Camera opened for BOL barcode scan', 'success')"><i class="fa-solid fa-barcode me-1"></i> Scan Barcode</button>
                  </div>
                </div>
                <div class="timeline-step">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Stop 3: Louisville Distribution Center</div>
                  <div class="timeline-desc">Facility: 4400 Airpark Drive, Louisville, KY 40213</div>
                  <div class="timeline-time">Scheduled: Tomorrow 09:00 EDT</div>
                </div>
                <div class="timeline-step">
                  <div class="timeline-dot"></div>
                  <div class="timeline-title">Stop 4: Atlanta Regional Logistics HQ (Final Destination)</div>
                  <div class="timeline-desc">Facility: 1200 Terminal Way, Atlanta, GA 30320</div>
                  <div class="timeline-time">Scheduled: Tomorrow 16:00 EDT</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-compass"></i> Live GPS Guidance</h2>
            </div>
            <div class="dash-card-body">
              <div class="p-3 bg-dark text-white rounded-3 mb-3 text-center">
                <i class="fa-solid fa-arrow-turn-up text-primary fs-1 mb-2"></i>
                <h4 class="text-white mb-1">In 1.4 Miles: Exit 114</h4>
                <p class="text-secondary small mb-0">Merge onto I-465 South towards Indianapolis Hub</p>
              </div>

              <div class="p-3 bg-light rounded-3 border d-flex flex-column gap-2">
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Current Speed:</span>
                  <span class="fw-bold">62 MPH (Speed Limit: 65)</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Traffic Condition:</span>
                  <span class="fw-bold text-success"><i class="fa-solid fa-circle me-1"></i> Green / Flowing</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Remaining Route Distance:</span>
                  <span class="fw-bold">168 Miles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "driver-vehicle") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-screwdriver-wrench"></i> Driver Vehicle Inspection Report (DVIR) Checklist</h2>
          <button class="btn btn-sm btn-primary" onclick="showDashToast('DVIR signed & submitted to DOT database', 'success')"><i class="fa-solid fa-cloud-arrow-up me-1"></i> Submit Daily DVIR</button>
        </div>
        <div class="dash-card-body">
          <div class="alert alert-info d-flex align-items-center gap-2 mb-4">
            <i class="fa-solid fa-info-circle fs-4"></i>
            <div>DOT FMCSA Compliance requires mandatory inspection before operating tractor unit #TRK-104.</div>
          </div>

          <div class="row g-3">
            <div class="col-md-4">
              <div class="p-3 bg-light rounded-3 border h-100">
                <h5 class="fw-bold fs-6 mb-3 text-dark"><i class="fa-solid fa-car-battery text-primary me-2"></i> Engine & Powertrain</h5>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" checked id="dvir1" />
                  <label class="form-check-label small" for="dvir1">Engine Oil Level & Pressure OK</label>
                </div>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" checked id="dvir2" />
                  <label class="form-check-label small" for="dvir2">Coolant & Radiator Hoses</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" checked id="dvir3" />
                  <label class="form-check-label small" for="dvir3">Battery Terminals & Alternator</label>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="p-3 bg-light rounded-3 border h-100">
                <h5 class="fw-bold fs-6 mb-3 text-dark"><i class="fa-solid fa-shield-halved text-primary me-2"></i> Brakes & Air System</h5>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" checked id="dvir4" />
                  <label class="form-check-label small" for="dvir4">Service Brakes & Parking Brake</label>
                </div>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" checked id="dvir5" />
                  <label class="form-check-label small" for="dvir5">Air Compressor (120 PSI Hold)</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" checked id="dvir6" />
                  <label class="form-check-label small" for="dvir6">Gladhands & Air Lines Leak Test</label>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="p-3 bg-light rounded-3 border h-100">
                <h5 class="fw-bold fs-6 mb-3 text-dark"><i class="fa-solid fa-circle-dot text-primary me-2"></i> Tires & Coupling</h5>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" checked id="dvir7" />
                  <label class="form-check-label small" for="dvir7">Steer & Drive Tires Tread Depth</label>
                </div>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" checked id="dvir8" />
                  <label class="form-check-label small" for="dvir8">Fifth Wheel Kingpin Locked</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" checked id="dvir9" />
                  <label class="form-check-label small" for="dvir9">Emergency Flares & Fire Extinguisher</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "driver-expenses") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-gas-pump"></i> Fuel Purchases & Toll Reimbursements</h2>
          <button class="btn btn-sm btn-primary" onclick="showDashToast('Receipt scan camera opened', 'success')"><i class="fa-solid fa-camera me-1"></i> Scan Fuel Receipt</button>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location / Station</th>
                  <th>Fuel Card #</th>
                  <th>Gallons / Volume</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Today, 11:30</td>
                  <td>Pilot Travel Center #412 (Lafayette, IN)</td>
                  <td>FleetCard-9921</td>
                  <td>110.4 GAL Diesel DEF</td>
                  <td><strong>$428.35</strong></td>
                  <td><span class="status-badge delivered">Approved</span></td>
                </tr>
                <tr>
                  <td>Today, 09:15</td>
                  <td>Indiana Toll Road (I-90 Plaza)</td>
                  <td>EZ-Pass Transponder</td>
                  <td>Toll Gate Charge</td>
                  <td><strong>$32.50</strong></td>
                  <td><span class="status-badge delivered">Auto-Billed</span></td>
                </tr>
                <tr>
                  <td>Oct 07, 18:40</td>
                  <td>Love's Travel Stop (Detroit, MI)</td>
                  <td>FleetCard-9921</td>
                  <td>124.0 GAL Diesel</td>
                  <td><strong>$476.16</strong></td>
                  <td><span class="status-badge delivered">Approved</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "driver-compliance") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-6">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-id-card-clip"></i> Driver Certifications & Credentials</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">Commercial Driver's License (CDL Class A)</div>
                  <small class="text-muted">License #CDL-98421-US • State of Michigan</small>
                </div>
                <span class="status-badge delivered">Valid (Exp 2028)</span>
              </div>
              <div class="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">DOT Medical Examiner Certificate</div>
                  <small class="text-muted">National Registry Certified • Valid 24 Months</small>
                </div>
                <span class="status-badge delivered">Valid (Exp Nov 2027)</span>
              </div>
              <div class="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">Hazmat Endorsement (H) & Tanker (N)</div>
                  <small class="text-muted">TSA Security Threat Assessment Cleared</small>
                </div>
                <span class="status-badge delivered">Active Endorsement</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-clock"></i> Electronic Logging Device (ELD) Logbook</h2>
            </div>
            <div class="dash-card-body">
              <div class="p-3 bg-dark text-white rounded-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-warning fw-bold">CURRENT STATUS: DRIVING</span>
                  <span class="badge bg-success">FMCSA COMPLIANT</span>
                </div>
                <h3 class="text-white font-heading">7h 45m Driving Available</h3>
                <div class="dash-progress-track">
                  <div class="dash-progress-fill" style="width: 70%;"></div>
                </div>
                <div class="d-flex justify-content-between small text-secondary">
                  <span>Duty Start: 06:00 EDT</span>
                  <span>Mandatory 10h Break: 20:00 EDT</span>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary flex-fill btn-sm" onclick="showDashToast('Status switched to: On Duty (Not Driving)', 'success')">On Duty</button>
                <button class="btn btn-outline-secondary flex-fill btn-sm" onclick="showDashToast('Status switched to: Sleeper Berth', 'success')">Sleeper Berth</button>
                <button class="btn btn-outline-secondary flex-fill btn-sm" onclick="showDashToast('Status switched to: Off Duty', 'success')">Off Duty</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `<div class="p-4">Driver View</div>`;
}

/* ==========================================================================
   ROLE 3: FLEET MANAGER VIEWS
   ========================================================================== */
function getFleetManagerView(viewId) {
  if (viewId === "fleet-overview") {
    return `
      <!-- Welcome Hero Banner -->
      <div class="welcome-hero-card">
        <span class="welcome-badge"><i class="fa-solid fa-truck-ramp-box"></i> Fleet Command Console</span>
        <h1 class="welcome-title">Fleet Operations: <span>${currentUser.name}</span></h1>
        <p class="welcome-desc">Global fleet status: <strong>142 Vehicles</strong> active across 4 operational zones. Real-time telematics, preventive maintenance, and driver safety scoring.</p>
        <div class="welcome-meta-pills">
          <span class="meta-pill"><i class="fa-solid fa-truck"></i> 128 On-Road (90% Utilization)</span>
          <span class="meta-pill"><i class="fa-solid fa-wrench text-warning"></i> 10 Scheduled Maintenance</span>
          <span class="meta-pill"><i class="fa-solid fa-shield-halved text-success"></i> 99.4% Fleet Safety Compliance</span>
        </div>
      </div>

      <!-- Fleet Manager KPIs (Equally Aligned) -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap orange"><i class="fa-solid fa-truck-fast"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-arrow-up"></i> 90.1%</span>
            </div>
            <div>
              <div class="metric-title">Active Fleet on Road</div>
              <div class="metric-value">128 / 142</div>
              <p class="metric-subtitle">14 idle / in scheduled turnaround</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap green"><i class="fa-solid fa-gauge"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-check"></i> Nominal</span>
            </div>
            <div>
              <div class="metric-title">Fleet Health Index</div>
              <div class="metric-value">98.4%</div>
              <p class="metric-subtitle">Zero active critical DTC engine faults</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap blue"><i class="fa-solid fa-gas-pump"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-arrow-down"></i> -3.2% Burn</span>
            </div>
            <div>
              <div class="metric-title">Average Fuel Burn</div>
              <div class="metric-value">7.2 MPG</div>
              <p class="metric-subtitle">Aerodynamic skirt retrofits saving $42k/mo</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap purple"><i class="fa-solid fa-clock-rotate-left"></i></div>
              <span class="metric-trend down"><i class="fa-solid fa-triangle-exclamation"></i> 4 Due</span>
            </div>
            <div>
              <div class="metric-title">Upcoming Services</div>
              <div class="metric-value">4 Units</div>
              <p class="metric-subtitle">Oil & brake pad replacements due this week</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Fleet Master Registry Table -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-truck-moving"></i> Live Vehicle Fleet Telemetry Registry</h2>
          <div class="dash-card-actions">
            <button class="btn btn-sm btn-primary" onclick="switchView('fleet-telematics')"><i class="fa-solid fa-satellite-dish me-1"></i> Live GPS Radar</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="exportDataToast('fleet')"><i class="fa-solid fa-download me-1"></i> Export Fleet DB</button>
          </div>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Vehicle ID & Model</th>
                  <th>Assigned Driver</th>
                  <th>Current Zone / Corridor</th>
                  <th>Telematics (Speed/Fuel)</th>
                  <th>Mileage (Odometer)</th>
                  <th>Maintenance Health</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dash-table-primary-text">TRK-104 (Volvo FH16)</span><span class="dash-table-subtext">VIN: 4V4NC9EH8MN81042</span></td>
                  <td>Marcus Vance (CDL-98421)</td>
                  <td>I-65 Southbound (Indiana)</td>
                  <td>62 MPH • 78% Fuel (Diesel)</td>
                  <td>142,850 mi</td>
                  <td><span class="status-badge delivered"><i class="fa-solid fa-check"></i> Nominal (Next in 8k mi)</span></td>
                  <td><button class="btn-table-action" onclick="showDashToast('Telemetry diagnostics for TRK-104 loaded', 'success')"><i class="fa-solid fa-chart-simple"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">TRK-112 (Freightliner Cascadia)</span><span class="dash-table-subtext">VIN: 1FUJBBCK4DL88219</span></td>
                  <td>Sarah Jenkins (CDL-88241)</td>
                  <td>I-80 Corridor (Ohio)</td>
                  <td>58 MPH • 45% Fuel (Diesel)</td>
                  <td>98,420 mi</td>
                  <td><span class="status-badge delivered"><i class="fa-solid fa-check"></i> Clean Diagnostics</span></td>
                  <td><button class="btn-table-action" onclick="showDashToast('Telemetry diagnostics for TRK-112 loaded', 'success')"><i class="fa-solid fa-chart-simple"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">TRK-128 (Scania R500 V8)</span><span class="dash-table-subtext">VIN: YS2R6X2000201948</span></td>
                  <td>Hans Gruber (CDL-77192)</td>
                  <td>Rotterdam Hub Workshop</td>
                  <td>0 MPH (Docked) • 92% Fuel</td>
                  <td>210,400 mi</td>
                  <td><span class="status-badge maintenance"><i class="fa-solid fa-wrench"></i> B-Service Scheduled</span></td>
                  <td><button class="btn-table-action" onclick="switchView('fleet-maintenance')"><i class="fa-solid fa-wrench"></i></button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">TRK-139 (Kenworth T680 NextGen)</span><span class="dash-table-subtext">VIN: 1NKDX4EX0JJ33912</span></td>
                  <td>David Chen (CDL-66104)</td>
                  <td>I-10 West (Texas Corridor)</td>
                  <td>64 MPH • 88% Fuel</td>
                  <td>64,120 mi</td>
                  <td><span class="status-badge delivered"><i class="fa-solid fa-check"></i> Optimal</span></td>
                  <td><button class="btn-table-action" onclick="showDashToast('Telemetry diagnostics for TRK-139 loaded', 'success')"><i class="fa-solid fa-chart-simple"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "fleet-registry") {
    return getFleetManagerView("fleet-overview");
  }

  if (viewId === "fleet-telematics") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-satellite-dish"></i> Live Fleet GPS & Geofence Matrix</h2>
              <span class="badge bg-success-subtle text-success border border-success-subtle">128 GPS Units Live</span>
            </div>
            <div class="dash-card-body p-0 position-relative" style="min-height: 480px; background: #0b0f19; border-radius: 0 0 16px 16px;">
              <div class="p-4 text-white d-flex flex-column justify-content-between h-100">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div class="bg-dark bg-opacity-75 p-2 px-3 rounded-3 border border-secondary">
                    <span class="text-warning small fw-bold"><i class="fa-solid fa-circle-dot me-1"></i> ACTIVE GEOFENCE</span>
                    <div class="font-monospace">Midwest Corridor & Great Lakes Belt</div>
                  </div>
                  <div class="bg-dark bg-opacity-75 p-2 px-3 rounded-3 border border-secondary">
                    <span class="text-info small fw-bold">SPEED VIOLATIONS (24H)</span>
                    <div class="font-monospace text-success">0 Incidents Detected</div>
                  </div>
                </div>

                <div class="text-center my-4">
                  <i class="fa-solid fa-network-wired text-primary fs-1 mb-2"></i>
                  <h4 class="text-white font-heading">Global Telemetry Mesh Synchronized</h4>
                  <p class="text-secondary small">CAN-bus ECU telemetry transmitted every 15 seconds via Starlink Fleet Gateway</p>
                </div>

                <div class="bg-dark bg-opacity-75 p-3 rounded-3 border border-secondary d-flex justify-content-between align-items-center">
                  <div>
                    <span class="text-muted small">Diagnostic DTC Alerts:</span>
                    <span class="text-success fw-bold ms-2"><i class="fa-solid fa-circle-check me-1"></i> 100% Clear</span>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="showDashToast('Diagnostic telemetry report exported', 'success')"><i class="fa-solid fa-file-export me-1"></i> Export CAN Logs</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-bell"></i> Geofence & Sensor Events</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">TRK-104 Gated Out</span>
                  <small class="text-muted">14:15 EDT</small>
                </div>
                <p class="small text-muted mb-0">Departed Chicago Central Distribution Yard with 18.2 MT load.</p>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">TRK-112 Geofence Arrival</span>
                  <small class="text-muted">13:40 EDT</small>
                </div>
                <p class="small text-muted mb-0">Entered Cleveland East Intermodal Rail Terminal.</p>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">TRK-128 Workshop Check-In</span>
                  <small class="text-muted">11:00 CET</small>
                </div>
                <p class="small text-muted mb-0">Rotterdam Hub Bay 2: Scheduled 200,000 mi overhaul.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "fleet-maintenance") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-wrench"></i> Preventive Maintenance & Workshop Repair Schedule</h2>
          <button class="btn btn-sm btn-primary" onclick="showDashToast('New Work Order WO-4401 created', 'success')"><i class="fa-solid fa-plus me-1"></i> Create Work Order</button>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Work Order #</th>
                  <th>Unit ID</th>
                  <th>Service Type</th>
                  <th>Facility / Workshop</th>
                  <th>Cost Estimate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dash-table-primary-text">WO-2026-991</span><span class="dash-table-subtext">Priority A</span></td>
                  <td>TRK-128 (Scania R500)</td>
                  <td>200,000 mi Major Service & Injector Clean</td>
                  <td>Rotterdam Central Workshop (Bay 2)</td>
                  <td>$1,850.00</td>
                  <td><span class="status-badge maintenance">In Progress</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">WO-2026-984</span><span class="dash-table-subtext">Routine</span></td>
                  <td>TRK-109 (Volvo FH16)</td>
                  <td>Disc Brake Replacement & Air Filter</td>
                  <td>Detroit North Workshop (Bay 4)</td>
                  <td>$680.00</td>
                  <td><span class="status-badge delivered">Completed Yesterday</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">WO-2026-980</span><span class="dash-table-subtext">Preventive</span></td>
                  <td>TRK-118 (Freightliner)</td>
                  <td>Transmission Fluid Flush & Alignment</td>
                  <td>Chicago Maintenance Center</td>
                  <td>$940.00</td>
                  <td><span class="status-badge pending">Scheduled for Oct 12</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "fleet-fuel") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-chart-line"></i> Fleet Fuel Efficiency & Emission Metrics</h2>
            </div>
            <div class="dash-card-body">
              <div class="row g-3 mb-4">
                <div class="col-sm-4">
                  <div class="p-3 bg-light rounded-3 border text-center">
                    <span class="text-muted small">Average Fleet MPG</span>
                    <h3 class="font-heading text-dark my-1">7.24 MPG</h3>
                    <span class="text-success small fw-bold">+4.1% YoY Improvement</span>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="p-3 bg-light rounded-3 border text-center">
                    <span class="text-muted small">Monthly Diesel Consumed</span>
                    <h3 class="font-heading text-dark my-1">42,850 GAL</h3>
                    <span class="text-primary small fw-bold">Euro VI / EPA SmartWay</span>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="p-3 bg-light rounded-3 border text-center">
                    <span class="text-muted small">Carbon Offsets Purchased</span>
                    <h3 class="font-heading text-dark my-1">112 MT CO2e</h3>
                    <span class="text-success small fw-bold">100% Net Zero Certified</span>
                  </div>
                </div>
              </div>

              <div class="p-4 bg-dark text-white rounded-3">
                <h5 class="font-heading text-white mb-2">Fleet Fuel Card Security Controls</h5>
                <p class="text-secondary small mb-3">All fuel transactions locked to registered GPS coordinates within 50 meters of certified commercial dispensers.</p>
                <button class="btn btn-sm btn-primary" onclick="showDashToast('Fuel card limits synced with WEX network', 'success')"><i class="fa-solid fa-shield me-1"></i> Audit Fuel Cards</button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-award"></i> Top Eco-Drivers (MPG)</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">1. Marcus Vance</div>
                  <small class="text-muted">Volvo FH16 (#TRK-104)</small>
                </div>
                <span class="badge bg-success">7.8 MPG</span>
              </div>
              <div class="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">2. Sarah Jenkins</div>
                  <small class="text-muted">Freightliner (#TRK-112)</small>
                </div>
                <span class="badge bg-success">7.6 MPG</span>
              </div>
              <div class="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">3. David Chen</div>
                  <small class="text-muted">Kenworth T680 (#TRK-139)</small>
                </div>
                <span class="badge bg-success">7.5 MPG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "fleet-safety") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-shield-halved"></i> Driver Telemetry Safety Scorecards & CSA Compliance</h2>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Assigned Vehicle</th>
                  <th>Safety Score</th>
                  <th>Harsh Braking</th>
                  <th>Speed Events</th>
                  <th>HOS Compliance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dash-table-primary-text">Marcus Vance</span><span class="dash-table-subtext">5 Years Service</span></td>
                  <td>Volvo FH16 (#TRK-104)</td>
                  <td><strong class="text-success">98.6 / 100</strong></td>
                  <td>0 in 30 days</td>
                  <td>0 Events</td>
                  <td>100% Perfect</td>
                  <td><span class="status-badge delivered">Gold Tier</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">Sarah Jenkins</span><span class="dash-table-subtext">3 Years Service</span></td>
                  <td>Freightliner (#TRK-112)</td>
                  <td><strong class="text-success">97.2 / 100</strong></td>
                  <td>1 Event (Avoidance)</td>
                  <td>0 Events</td>
                  <td>100% Perfect</td>
                  <td><span class="status-badge delivered">Gold Tier</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">Hans Gruber</span><span class="dash-table-subtext">8 Years Service</span></td>
                  <td>Scania R500 (#TRK-128)</td>
                  <td><strong class="text-success">99.1 / 100</strong></td>
                  <td>0 in 30 days</td>
                  <td>0 Events</td>
                  <td>100% Perfect</td>
                  <td><span class="status-badge delivered">Master Driver</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  return `<div class="p-4">Fleet Manager View</div>`;
}

/* ==========================================================================
   ROLE 4: LOGISTICS COORDINATOR VIEWS
   ========================================================================== */
function getCoordinatorView(viewId) {
  if (viewId === "coordinator-overview") {
    return `
      <!-- Welcome Hero Banner -->
      <div class="welcome-hero-card">
        <span class="welcome-badge"><i class="fa-solid fa-network-wired"></i> Central Dispatch & Lane Control</span>
        <h1 class="welcome-title">Coordinator Console: <span>${currentUser.name}</span></h1>
        <p class="welcome-desc">Managing <strong>28 Active Dispatches</strong>, 3PL partner carrier allocations, multi-modal container transshipment, and cross-docking operations.</p>
        <div class="welcome-meta-pills">
          <span class="meta-pill"><i class="fa-solid fa-box-archive"></i> 28 Live Dispatches</span>
          <span class="meta-pill"><i class="fa-solid fa-warehouse"></i> 92% Hub Capacity</span>
          <span class="meta-pill"><i class="fa-solid fa-triangle-exclamation text-warning"></i> 2 Weather Reroutes Active</span>
        </div>
      </div>

      <!-- Coordinator KPIs (Equally Aligned) -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap orange"><i class="fa-solid fa-boxes-packing"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-arrow-up"></i> +12.5%</span>
            </div>
            <div>
              <div class="metric-title">Loads Dispatched (24H)</div>
              <div class="metric-value">64 Loads</div>
              <p class="metric-subtitle">42 FTL • 14 Ocean FCL • 8 Air</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap green"><i class="fa-solid fa-handshake"></i></div>
              <span class="metric-trend up">99.1%</span>
            </div>
            <div>
              <div class="metric-title">Carrier Tender Acceptance</div>
              <div class="metric-value">97.8%</div>
              <p class="metric-subtitle">Contracted lanes locked at spot target</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap blue"><i class="fa-solid fa-clock"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-check"></i> Nominal</span>
            </div>
            <div>
              <div class="metric-title">Average Dock Turnaround</div>
              <div class="metric-value">38 Mins</div>
              <p class="metric-subtitle">Live cross-docking dwell time</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap purple"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <span class="metric-trend down">Managed</span>
            </div>
            <div>
              <div class="metric-title">Active Exceptions</div>
              <div class="metric-value">2 Alerts</div>
              <p class="metric-subtitle">Fog delay in Rotterdam & customs hold</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Dispatch Board -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-list-check"></i> Master Dispatch & Load Planning Board</h2>
          <div class="dash-card-actions">
            <button class="btn btn-sm btn-primary" onclick="showDashToast('New Load Manifest Dialog opened', 'success')"><i class="fa-solid fa-plus me-1"></i> Create Dispatch</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="exportDataToast('dispatch')"><i class="fa-solid fa-download me-1"></i> Export Dispatch Sheet</button>
          </div>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Dispatch #</th>
                  <th>Customer / Consignee</th>
                  <th>Origin & Destination Hub</th>
                  <th>Transport Mode & Carrier</th>
                  <th>Payload & Containers</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dash-table-primary-text">DSP-88901</span><span class="dash-table-subtext">Priority Cold-Chain</span></td>
                  <td>Pfizer Global Logistics</td>
                  <td>Basel Hub &rarr; London Gateway</td>
                  <td>Stackly Dedicated Cryo Unit #12</td>
                  <td>4,200 KG (Reefer -18°C)</td>
                  <td><span class="status-badge active"><i class="fa-solid fa-snowflake me-1"></i> En Route (On SLA)</span></td>
                  <td><button class="btn btn-sm btn-outline-primary" onclick="showDashToast('Dispatch details DSP-88901 loaded', 'success')">Details</button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">DSP-88902</span><span class="dash-table-subtext">Ocean Intermodal</span></td>
                  <td>Tesla Energy Grid</td>
                  <td>Rotterdam (NLD) &rarr; Newark (USA)</td>
                  <td>Maersk Line (Madrid Express)</td>
                  <td>2x 40ft High Cube Containers</td>
                  <td><span class="status-badge in-transit"><i class="fa-solid fa-ship me-1"></i> Ocean Transit</span></td>
                  <td><button class="btn btn-sm btn-outline-primary" onclick="showDashToast('Dispatch details DSP-88902 loaded', 'success')">Details</button></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">DSP-88903</span><span class="dash-table-subtext">Linehaul FTL</span></td>
                  <td>General Motors Spare Parts</td>
                  <td>Detroit Gateway &rarr; Dallas Center</td>
                  <td>Stackly Fleet Unit #TRK-104</td>
                  <td>18,200 KG (Standard FTL)</td>
                  <td><span class="status-badge in-transit"><i class="fa-solid fa-truck me-1"></i> In Transit</span></td>
                  <td><button class="btn btn-sm btn-outline-primary" onclick="showDashToast('Dispatch details DSP-88903 loaded', 'success')">Details</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "coordinator-dispatch") {
    return getCoordinatorView("coordinator-overview");
  }

  if (viewId === "coordinator-carriers") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-handshake"></i> Approved 3PL Carrier Network & Partners</h2>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Carrier Partner</th>
                  <th>Contracted Freight Modes</th>
                  <th>Active Lanes</th>
                  <th>On-Time Performance</th>
                  <th>Safety Rating</th>
                  <th>Insurance & Bond</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dash-table-primary-text">Maersk Line Ocean</span><span class="dash-table-subtext">Tier-1 Ocean Carrier</span></td>
                  <td>Ocean FCL / Trans-Atlantic / Trans-Pacific</td>
                  <td>Rotterdam, Singapore, Los Angeles</td>
                  <td><strong class="text-success">98.8%</strong></td>
                  <td><span class="badge bg-success">A+ Rated</span></td>
                  <td><span class="status-badge delivered">$50M Maritime Policy</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">Lufthansa Cargo AG</span><span class="dash-table-subtext">Tier-1 Air Freight</span></td>
                  <td>Air Priority / Cold-Chain / High-Value</td>
                  <td>Frankfurt, Chicago, Tokyo, Dubai</td>
                  <td><strong class="text-success">99.4%</strong></td>
                  <td><span class="badge bg-success">A+ Rated</span></td>
                  <td><span class="status-badge delivered">IATA Certified</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">Swift Transportation</span><span class="dash-table-subtext">Domestic Over-the-Road</span></td>
                  <td>FTL Dry Van / Flatbed Heavy Haul</td>
                  <td>US Midwest, Southern Belt</td>
                  <td><strong class="text-dark">97.2%</strong></td>
                  <td><span class="badge bg-primary">Satisfactory</span></td>
                  <td><span class="status-badge delivered">$10M Cargo Bond</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "coordinator-warehouse") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-6">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-warehouse"></i> Hub Capacity & Cross-Dock Status</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between mb-1">
                  <span class="fw-bold">Chicago Central Intermodal Hub</span>
                  <span class="badge bg-warning">88% Capacity</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-fill bg-warning" style="width: 88%;"></div>
                </div>
                <small class="text-muted">42 of 48 Dock Doors Occupied • 14 Outbound Staged</small>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between mb-1">
                  <span class="fw-bold">Rotterdam Gateway Cross-Dock</span>
                  <span class="badge bg-success">64% Capacity</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-fill bg-success" style="width: 64%;"></div>
                </div>
                <small class="text-muted">High Container Turnover • 18 Reefer Plugs Active</small>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between mb-1">
                  <span class="fw-bold">Frankfurt CargoCity Hub</span>
                  <span class="badge bg-success">72% Capacity</span>
                </div>
                <div class="dash-progress-track">
                  <div class="dash-progress-fill bg-success" style="width: 72%;"></div>
                </div>
                <small class="text-muted">ULD Container Palletizing on schedule</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-door-open"></i> Live Dock Door Scheduling</h2>
            </div>
            <div class="dash-card-body p-0">
              <div class="table-responsive">
                <table class="table dash-table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Bay #</th>
                      <th>Truck / Carrier</th>
                      <th>Operation</th>
                      <th>Time Slot</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span class="badge bg-primary">Bay 04</span></td>
                      <td>TRK-104 (Stackly Dedicated)</td>
                      <td>Unload 18.2 MT</td>
                      <td>16:00 - 16:45</td>
                    </tr>
                    <tr>
                      <td><span class="badge bg-primary">Bay 07</span></td>
                      <td>Swift Transport #SW-891</td>
                      <td>Cross-Dock Transfer</td>
                      <td>16:30 - 17:15</td>
                    </tr>
                    <tr>
                      <td><span class="badge bg-secondary">Bay 12</span></td>
                      <td>DHL Express Feeder #42</td>
                      <td>Outbound Sorting</td>
                      <td>17:00 - 18:00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "coordinator-incidents") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-triangle-exclamation"></i> Active Incident & Exception Tracker</h2>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Affected Route / Lane</th>
                  <th>Severity</th>
                  <th>Root Cause</th>
                  <th>Mitigation Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr class="table-warning bg-opacity-25">
                  <td><span class="dash-table-primary-text">INC-2026-081</span></td>
                  <td>Rotterdam &rarr; Newark (AXT-99482)</td>
                  <td><span class="badge bg-warning">Medium</span></td>
                  <td>Dense Fog at English Channel Outbound</td>
                  <td>Vessel rerouted via deepwater passage; ETA delayed by only 4 hours.</td>
                  <td><span class="status-badge in-transit">Mitigated</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">INC-2026-079</span></td>
                  <td>Frankfurt &rarr; Chicago Air</td>
                  <td><span class="badge bg-info">Low</span></td>
                  <td>US Customs Additional Inspection</td>
                  <td>Broker submitted HS Tariff Certificate; clearance granted.</td>
                  <td><span class="status-badge delivered">Resolved</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "coordinator-analytics") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-chart-pie"></i> Lane Performance & On-Time Delivery (OTD) Benchmarks</h2>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Trade Lane</th>
                  <th>Freight Mode</th>
                  <th>Monthly Volume</th>
                  <th>Target SLA</th>
                  <th>Actual OTD</th>
                  <th>Average Cost / Mile</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Trans-Atlantic (Rotterdam &rarr; NY/NJ)</strong></td>
                  <td>Ocean FCL</td>
                  <td>142 TEU</td>
                  <td>98.0%</td>
                  <td><strong class="text-success">98.8%</strong></td>
                  <td>$1.85 / nautical mi</td>
                </tr>
                <tr>
                  <td><strong>US Midwest Corridor (Chicago &rarr; Atlanta)</strong></td>
                  <td>Road FTL</td>
                  <td>380 Loads</td>
                  <td>98.5%</td>
                  <td><strong class="text-success">99.1%</strong></td>
                  <td>$2.42 / road mi</td>
                </tr>
                <tr>
                  <td><strong>Europe Central Express (Basel &rarr; London)</strong></td>
                  <td>Pharma Cold-Chain</td>
                  <td>68 Trips</td>
                  <td>99.5%</td>
                  <td><strong class="text-success">99.8%</strong></td>
                  <td>$3.15 / km</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  return `<div class="p-4">Coordinator View</div>`;
}

/* ==========================================================================
   ROLE 5: ADMINISTRATOR VIEWS
   ========================================================================== */
function getAdminView(viewId) {
  if (viewId === "admin-overview") {
    return `
      <!-- Welcome Hero Banner -->
      <div class="welcome-hero-card">
        <span class="welcome-badge"><i class="fa-solid fa-user-shield"></i> Executive Command Headquarters</span>
        <h1 class="welcome-title">Welcome back, <span>${currentUser.name}</span></h1>
        <p class="welcome-desc">Stackly Transportation & Logistics Global Enterprise Platform. Managing cross-border compliance, multi-role security, billing gateways, and real-time multi-modal logistics.</p>
        <div class="welcome-meta-pills">
          <span class="meta-pill"><i class="fa-solid fa-users"></i> 1,248 Active Users</span>
          <span class="meta-pill"><i class="fa-solid fa-server"></i> Platform SLA: 99.99% Uptime</span>
          <span class="meta-pill"><i class="fa-solid fa-globe"></i> 18 Global Hubs Online</span>
        </div>
      </div>

      <!-- Admin Global Financial & Freight KPIs (Equally Aligned) -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap orange"><i class="fa-solid fa-money-bill-trend-up"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-arrow-up"></i> +14.2%</span>
            </div>
            <div>
              <div class="metric-title">Monthly Freight Revenue</div>
              <div class="metric-value">$1,842,500</div>
              <p class="metric-subtitle">+$228k higher than Q3 projection</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap green"><i class="fa-solid fa-truck-ramp-box"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-check"></i> 99.4%</span>
            </div>
            <div>
              <div class="metric-title">Global Freight Volume</div>
              <div class="metric-value">14,280 MT</div>
              <p class="metric-subtitle">Across Ocean, Road, Air & Rail</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap blue"><i class="fa-solid fa-users-gear"></i></div>
              <span class="metric-trend up"><i class="fa-solid fa-arrow-up"></i> +48</span>
            </div>
            <div>
              <div class="metric-title">Registered System Users</div>
              <div class="metric-value">1,248</div>
              <p class="metric-subtitle">Customers, Drivers, Managers & Staff</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="metric-card">
            <div class="metric-card-top">
              <div class="metric-icon-wrap purple"><i class="fa-solid fa-shield-check"></i></div>
              <span class="metric-trend up">Zero Breaches</span>
            </div>
            <div>
              <div class="metric-title">System & API Health</div>
              <div class="metric-value">100% OK</div>
              <p class="metric-subtitle">EDI, IoT Telematics & Payment Gateway</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Master System User & Role Table -->
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-users"></i> Recent User Accounts & Role Permissions</h2>
              <button class="btn btn-sm btn-primary" onclick="switchView('admin-users')"><i class="fa-solid fa-user-plus me-1"></i> Manage All Users</button>
            </div>
            <div class="dash-card-body p-0">
              <div class="table-responsive">
                <table class="table dash-table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>User & Contact</th>
                      <th>Assigned Role</th>
                      <th>Account Status</th>
                      <th>Last Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">Gokul Nath</span>
                        <span class="dash-table-subtext">gokul.transport@stackly.com</span>
                      </td>
                      <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle"><i class="fa-solid fa-user-shield me-1"></i> Administrator</span></td>
                      <td><span class="status-badge delivered"><i class="fa-solid fa-circle me-1"></i> Active</span></td>
                      <td>Just now</td>
                      <td><button class="btn-table-action" onclick="showDashToast('User settings loaded', 'success')"><i class="fa-solid fa-gear"></i></button></td>
                    </tr>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">Marcus Vance</span>
                        <span class="dash-table-subtext">marcus.driver@stackly.com</span>
                      </td>
                      <td><span class="badge bg-warning-subtle text-warning border border-warning-subtle"><i class="fa-solid fa-truck-moving me-1"></i> Driver / Carrier</span></td>
                      <td><span class="status-badge in-transit"><i class="fa-solid fa-circle me-1"></i> On Duty</span></td>
                      <td>12 mins ago</td>
                      <td><button class="btn-table-action" onclick="showDashToast('Driver profile loaded', 'success')"><i class="fa-solid fa-gear"></i></button></td>
                    </tr>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">Elena Rostova</span>
                        <span class="dash-table-subtext">elena.fleet@stackly.com</span>
                      </td>
                      <td><span class="badge bg-info-subtle text-info border border-info-subtle"><i class="fa-solid fa-truck-ramp-box me-1"></i> Fleet Manager</span></td>
                      <td><span class="status-badge delivered"><i class="fa-solid fa-circle me-1"></i> Active</span></td>
                      <td>25 mins ago</td>
                      <td><button class="btn-table-action" onclick="showDashToast('Fleet manager profile loaded', 'success')"><i class="fa-solid fa-gear"></i></button></td>
                    </tr>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">David Sterling</span>
                        <span class="dash-table-subtext">david.coord@stackly.com</span>
                      </td>
                      <td><span class="badge bg-success-subtle text-success border border-success-subtle"><i class="fa-solid fa-network-wired me-1"></i> Logistics Coordinator</span></td>
                      <td><span class="status-badge delivered"><i class="fa-solid fa-circle me-1"></i> Active</span></td>
                      <td>1 hour ago</td>
                      <td><button class="btn-table-action" onclick="showDashToast('Coordinator profile loaded', 'success')"><i class="fa-solid fa-gear"></i></button></td>
                    </tr>
                    <tr>
                      <td>
                        <span class="dash-table-primary-text">Acme Global Shipper</span>
                        <span class="dash-table-subtext">shipping@acme-corp.com</span>
                      </td>
                      <td><span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="fa-solid fa-user me-1"></i> Customer / Shipper</span></td>
                      <td><span class="status-badge delivered"><i class="fa-solid fa-circle me-1"></i> Active</span></td>
                      <td>2 hours ago</td>
                      <td><button class="btn-table-action" onclick="showDashToast('Customer account loaded', 'success')"><i class="fa-solid fa-gear"></i></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-server"></i> System Infrastructure</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">Global EDI 214/310 Gateway</span>
                  <span class="badge bg-success">Operational</span>
                </div>
                <small class="text-muted">Avg response time: 24ms • 100% messages delivered</small>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">IoT Starlink Telematics API</span>
                  <span class="badge bg-success">Operational</span>
                </div>
                <small class="text-muted">142 active vehicle telemetry sockets connected</small>
              </div>

              <div class="p-3 bg-light rounded-3 border">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-bold">Automated Database Backups</span>
                  <span class="badge bg-success">Up to Date</span>
                </div>
                <small class="text-muted">Last snapshot created 42 mins ago (AES-256)</small>
              </div>

              <button class="btn btn-outline-dark w-100 btn-sm" onclick="switchView('admin-logs')"><i class="fa-solid fa-shield-cat me-1"></i> View Full Security Audit Trail</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "admin-users") {
    return getAdminView("admin-overview");
  }

  if (viewId === "admin-freight") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-earth-americas"></i> Global Master Freight Operations Table</h2>
          <button class="btn btn-sm btn-outline-secondary" onclick="exportDataToast('master-freight')"><i class="fa-solid fa-file-csv me-1"></i> Master Export</button>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Consignment ID</th>
                  <th>Shipper Organization</th>
                  <th>Lane Corridor</th>
                  <th>Transport Mode</th>
                  <th>Carrier Vessel / Rig</th>
                  <th>Financial Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dash-table-primary-text">AXT-99482-SEA</span></td>
                  <td>Tesla Energy Grid</td>
                  <td>Rotterdam (NLD) &rarr; Newark (USA)</td>
                  <td>Ocean FCL</td>
                  <td>Maersk Madrid Express</td>
                  <td>$1,240,000</td>
                  <td><span class="status-badge in-transit">In Transit</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">AXT-88214-AIR</span></td>
                  <td>Siemens Healthineers</td>
                  <td>Frankfurt (DEU) &rarr; Chicago (USA)</td>
                  <td>Air Priority</td>
                  <td>Lufthansa Cargo Flight 824</td>
                  <td>$3,850,000</td>
                  <td><span class="status-badge delivered">Delivered</span></td>
                </tr>
                <tr>
                  <td><span class="dash-table-primary-text">AXT-77401-ROD</span></td>
                  <td>General Motors</td>
                  <td>Detroit Hub &rarr; Dallas Center</td>
                  <td>Road FTL</td>
                  <td>Stackly Fleet #TRK-104</td>
                  <td>$420,000</td>
                  <td><span class="status-badge in-transit">In Transit</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "admin-financials") {
    return `
      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-money-bill-trend-up"></i> Global Revenue & Carrier Settlement Gateway</h2>
            </div>
            <div class="dash-card-body">
              <div class="row g-3 mb-4">
                <div class="col-sm-4">
                  <div class="p-3 bg-light rounded-3 border text-center">
                    <span class="text-muted small">Gross Invoiced (MTD)</span>
                    <h3 class="font-heading text-dark my-1">$1.84M</h3>
                    <span class="text-success small fw-bold">+14.2% Growth</span>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="p-3 bg-light rounded-3 border text-center">
                    <span class="text-muted small">Carrier Disbursements</span>
                    <h3 class="font-heading text-dark my-1">$1.32M</h3>
                    <span class="text-primary small fw-bold">Settled Net 15</span>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="p-3 bg-light rounded-3 border text-center">
                    <span class="text-muted small">Net Gross Margin</span>
                    <h3 class="font-heading text-dark my-1">$522,500</h3>
                    <span class="text-success small fw-bold">28.3% Margin</span>
                  </div>
                </div>
              </div>

              <button class="btn btn-primary" onclick="showDashToast('Consolidated financial statement generated', 'success')"><i class="fa-solid fa-file-invoice-dollar me-1"></i> Generate Executive Balance Sheet</button>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="dash-card">
            <div class="dash-card-header">
              <h2 class="dash-card-title"><i class="fa-solid fa-credit-card"></i> Payment Processing</h2>
            </div>
            <div class="dash-card-body d-flex flex-column gap-3">
              <div class="p-3 bg-light rounded-3 border">
                <div class="fw-bold mb-1">Automated Wire / ACH Gateway</div>
                <p class="small text-muted mb-0">99.8% auto-cleared without manual intervention.</p>
              </div>
              <div class="p-3 bg-light rounded-3 border">
                <div class="fw-bold mb-1">Multi-Currency Hedging</div>
                <p class="small text-muted mb-0">USD, EUR, GBP, SGD active with automated FX protection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "admin-system") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-server"></i> API Gateway, IoT Endpoints & Webhook Status</h2>
          <button class="btn btn-sm btn-primary" onclick="showDashToast('All API health probes returned 200 OK', 'success')"><i class="fa-solid fa-arrows-rotate me-1"></i> Ping Health Probes</button>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Service / API Endpoint</th>
                  <th>Protocol / Standard</th>
                  <th>Uptime (30D)</th>
                  <th>Latency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>EDI 204/214/310 Core Dispatch Engine</strong></td>
                  <td>AS2 / HTTPS Webhook</td>
                  <td>100%</td>
                  <td>18ms</td>
                  <td><span class="status-badge delivered">Operational</span></td>
                </tr>
                <tr>
                  <td><strong>Starlink Telematics Ingestion Socket</strong></td>
                  <td>gRPC / Protobuf</td>
                  <td>99.99%</td>
                  <td>32ms</td>
                  <td><span class="status-badge delivered">Operational</span></td>
                </tr>
                <tr>
                  <td><strong>AIS Vessel Tracking Satellite Feed</strong></td>
                  <td>NMEA-0183 Live Stream</td>
                  <td>99.98%</td>
                  <td>45ms</td>
                  <td><span class="status-badge delivered">Operational</span></td>
                </tr>
                <tr>
                  <td><strong>Customs Automated Broker Interface (ABI)</strong></td>
                  <td>US CBP / EU TAXUD Gateway</td>
                  <td>100%</td>
                  <td>85ms</td>
                  <td><span class="status-badge delivered">Operational</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  if (viewId === "admin-logs") {
    return `
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title"><i class="fa-solid fa-shield-cat"></i> System Security & Audit Trail Logs</h2>
          <button class="btn btn-sm btn-outline-secondary" onclick="exportDataToast('audit-logs')"><i class="fa-solid fa-download me-1"></i> Export Audit Trail</button>
        </div>
        <div class="dash-card-body p-0">
          <div class="table-responsive">
            <table class="table dash-table table-hover align-middle">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User & IP Address</th>
                  <th>Event Category</th>
                  <th>Action Description</th>
                  <th>Security Verification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Today, 15:10:04</td>
                  <td>${currentUser.email} (192.168.1.10)</td>
                  <td>Authentication</td>
                  <td>Role session initialized as ${ROLE_CONFIGS[currentRole].name}</td>
                  <td><span class="status-badge delivered">2FA Verified</span></td>
                </tr>
                <tr>
                  <td>Today, 14:45:12</td>
                  <td>marcus.driver@stackly.com (Cellular IP)</td>
                  <td>Driver Action</td>
                  <td>Pre-trip DVIR checklist signed for Volvo Unit #TRK-104</td>
                  <td><span class="status-badge delivered">e-Signed</span></td>
                </tr>
                <tr>
                  <td>Today, 14:12:00</td>
                  <td>elena.fleet@stackly.com (10.0.4.18)</td>
                  <td>Fleet Operations</td>
                  <td>Geofence perimeter adjusted for Chicago Hub Bay 4</td>
                  <td><span class="status-badge delivered">Logged</span></td>
                </tr>
                <tr>
                  <td>Today, 13:30:19</td>
                  <td>API Gateway (System Cron)</td>
                  <td>Automation</td>
                  <td>AIS Telemetry coordinates synced for 14 Ocean vessels</td>
                  <td><span class="status-badge delivered">System OK</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  return `<div class="p-4">Admin View</div>`;
}

/* --------------------------------------------------------------------------
   6. View Interactive Behaviors (Calculators, Search Filter, DVIR, etc.)
   -------------------------------------------------------------------------- */
function initViewInteractions(viewId) {
  // Table search filter
  const filterInput = document.getElementById("tableFilterInput");
  if (filterInput) {
    filterInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#bookingsTableBody tr");
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? "" : "none";
      });
    });
  }

  // Quote mode selector clicks
  const modeButtons = document.querySelectorAll(".quote-mode-btn");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function selectQuoteMode(el) {
  const modeButtons = document.querySelectorAll(".quote-mode-btn");
  modeButtons.forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  calculateInstantQuote();
}

function calculateInstantQuote() {
  const activeModeBtn = document.querySelector(".quote-mode-btn.active");
  const mode = activeModeBtn
    ? activeModeBtn.getAttribute("data-mode")
    : "ocean";
  const weightInput = document.getElementById("quoteWeight");
  const weight = weightInput ? parseFloat(weightInput.value) || 5000 : 5000;
  const cargoType =
    document.getElementById("quoteCargoType")?.value || "general";

  let ratePerKg = 0.28;
  if (mode === "air") ratePerKg = 1.95;
  if (mode === "road") ratePerKg = 0.45;
  if (mode === "intermodal") ratePerKg = 0.35;

  let multiplier = 1.0;
  if (cargoType === "reefer") multiplier = 1.15;
  if (cargoType === "hazmat") multiplier = 1.25;
  if (cargoType === "highvalue") multiplier = 1.2;

  const basePrice = Math.round(weight * ratePerKg * multiplier);
  const totalPrice = basePrice + 420 + 180; // Plus handling & docs

  const priceEl = document.getElementById("quoteResultPrice");
  const baseFeeEl = document.getElementById("quoteBaseFee");

  if (priceEl) priceEl.textContent = `$${totalPrice.toLocaleString()}.00`;
  if (baseFeeEl) baseFeeEl.textContent = `$${basePrice.toLocaleString()}.00`;

  showDashToast(
    "Live tariff updated based on multi-modal parameters",
    "success",
  );
}

function markDriverStopComplete(btn, stopName) {
  btn.disabled = true;
  btn.className = "btn btn-sm btn-success";
  btn.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Arrived & Signed`;
  showDashToast(
    `Stop at ${stopName} marked as Arrived & Proof of Delivery logged!`,
    "success",
  );
}

function showConsignmentModal(id) {
  showDashToast(
    `Viewing full bill of lading & telematics for ${id}`,
    "success",
  );
}

function exportDataToast(type) {
  showDashToast(
    `Exporting ${type} dataset to CSV / Excel format...`,
    "success",
  );
}

/* --------------------------------------------------------------------------
   7. Mobile Drawer & Sidebar Collapse
   -------------------------------------------------------------------------- */
function setupMobileDrawer() {
  const toggleBtn = document.getElementById("mobileSidebarToggle");
  const sidebar = document.getElementById("dashboardSidebar");
  const closeBtn = document.getElementById("sidebarCloseBtn");
  const overlay = document.getElementById("sidebarOverlay");

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("is-open");
      overlay.classList.toggle("is-active");
    });
  }

  if (closeBtn && sidebar && overlay) {
    closeBtn.addEventListener("click", closeMobileSidebar);
  }

  if (overlay) {
    overlay.addEventListener("click", closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("dashboardSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("is-open");
  if (overlay) overlay.classList.remove("is-active");
}

/* --------------------------------------------------------------------------
   8. Logout Handler
   -------------------------------------------------------------------------- */
function setupLogout() {
  const logoutBtns = document.querySelectorAll(
    ".btn-logout, #logoutBtn, .btn-sidebar-logout",
  );
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        localStorage.removeItem("stackly_auth_user");
        sessionStorage.removeItem("stackly_auth_user");
      } catch (err) {}

      showDashToast("Signing out of session...", "warning");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    });
  });
}

/* --------------------------------------------------------------------------
   9. Intercept Empty Links & Buttons -> Redirect to 404 Page (Requirement 7)
   -------------------------------------------------------------------------- */
function setupEmptyLinksRedirect() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // Explicitly ignore sidebar navigation links and active interactive controls
    if (
      link.classList.contains("sidebar-nav-link") ||
      link.hasAttribute("data-view") ||
      link.classList.contains("btn-sidebar-logout") ||
      link.classList.contains("btn-logout") ||
      link.id === "logoutBtn" ||
      link.hasAttribute("data-bs-toggle") ||
      link.hasAttribute("data-bs-target") ||
      link.classList.contains("dropdown-toggle") ||
      (link.getAttribute("role") === "button" && link.getAttribute("onclick"))
    ) {
      return;
    }

    const onclickAttr = link.getAttribute("onclick");
    if (
      onclickAttr &&
      (onclickAttr.includes("switchView") ||
        onclickAttr.includes("showDashToast") ||
        onclickAttr.includes("exportDataToast") ||
        onclickAttr.includes("calculateInstantQuote") ||
        onclickAttr.includes("selectQuoteMode") ||
        onclickAttr.includes("history.back") ||
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
      window.location.href = "404.html";
    }
  });

  // Also handle buttons with data-action="empty" or empty action
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.getAttribute("data-action") === "empty") {
      e.preventDefault();
      window.location.href = "404.html";
    }
  });
}

/* --------------------------------------------------------------------------
   10. Toast Notification Helper
   -------------------------------------------------------------------------- */
function showDashToast(message, type = "success", duration = 3000) {
  let container = document.querySelector(".dash-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "dash-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `dash-toast ${type}`;

  const iconClass =
    type === "success"
      ? "fa-solid fa-circle-check text-success"
      : type === "warning"
        ? "fa-solid fa-triangle-exclamation text-warning"
        : "fa-solid fa-circle-xmark text-danger";

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
