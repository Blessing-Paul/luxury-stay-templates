//on scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.getElementById("heroNavbar");
  if (window.scrollY > 10) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

//toggler for navbar
function openMenu() {
  document.getElementById("mobileMenu").classList.add("active");
}

function closeMenu() {
  document.getElementById("mobileMenu").classList.remove("active");
}

// Global Client Scroll Navigation Actions
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth" /* Delivers smooth scroll back to header viewports */,
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // 1. Get and normalize current path (removes trailing slashes, index.html reference, and converts to lowercase)
  let currentPath = window.location.pathname.toLowerCase();
  if (currentPath.endsWith("/")) currentPath += "index.html";
  if (currentPath === "") currentPath = "index.html";

  // Helper function to extract just the file/clean name (e.g., "/spa.html" -> "spa")
  const getCleanFilename = (path) => {
    const segments = path.split("/");
    const lastSegment = segments[segments.length - 1] || "index.html";
    return lastSegment.replace(".html", "");
  };

  const currentCleanName = getCleanFilename(currentPath);

  // 2. Target all link variants across both layouts
  const allLinks = document.querySelectorAll(
    "#heroNavbar .nav-link, #heroNavbar .dropdown-item, #mobileMenu a",
  );
  let matchFound = false;

  allLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const linkCleanName = getCleanFilename(href.toLowerCase());

    // Check if current clean filename matches link destination
    if (currentCleanName === linkCleanName) {
      link.classList.add("active");
      matchFound = true;

      // Handle Bootstrap Dropdown parent highlighting
      if (link.classList.contains("dropdown-item")) {
        const parentDropdown = link.closest(".dropdown");
        if (parentDropdown) {
          const dropdownToggle =
            parentDropdown.querySelector(".dropdown-toggle");
          if (dropdownToggle) dropdownToggle.classList.add("active");
        }
      }
    } else {
      link.classList.remove("active");
    }
  });

  // 3. Fallback to Home if root path didn't capture a match
  if (
    !matchFound &&
    (currentCleanName === "index" || currentCleanName === "")
  ) {
    const homeLinks = document.querySelectorAll('a[href="index.html"]');
    homeLinks.forEach((el) => el.classList.add("active"));
  }
});

// Switcher Logic for Single Page Booking Portal tabs
function switchBookingTab(profile) {
  const roomsTab = document.getElementById("roomBookingTab");
  const eventsTab = document.getElementById("eventBookingTab");
  const roomsBtn = document.getElementById("roomToggleBtn");
  const eventsBtn = document.getElementById("eventToggleBtn");

  if (profile === "rooms") {
    roomsTab.classList.remove("d-none");
    eventsTab.classList.add("d-none");
    roomsBtn.classList.add("active");
    eventsBtn.classList.remove("active");
  } else {
    eventsTab.classList.remove("d-none");
    roomsTab.classList.add("d-none");
    eventsBtn.classList.add("active");
    roomsBtn.classList.remove("active");
  }
}

// Basic Live Calculation Engine mockup for Events
function calculateEventPricing() {
  const startVal = document.getElementById("eventStart").value;
  const endVal = document.getElementById("eventEnd").value;

  if (startVal && endVal) {
    const start = new Date(startVal);
    const end = new Date(endVal);
    const timeDiff = end - start;

    if (timeDiff > 0) {
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const baseRate = 250000;
      const totalAmount = days * baseRate;

      document.getElementById("computedDays").innerText =
        days + (days === 1 ? " Day" : " Days");
      document.getElementById("computedAmount").innerText =
        "₦" + totalAmount.toLocaleString();
      return;
    }
  }
  document.getElementById("computedDays").innerText = "0 Days";
  document.getElementById("computedAmount").innerText = "₦0.00";
}

// Spinner manual typing fallback handling validation
function validateInputField(input, minValue) {
  let value = parseInt(input.value, 10);
  if (isNaN(value) || value < minValue) {
    input.value = minValue;
  }
}

function incrementValue(inputId) {
  const target = document.getElementById(inputId);
  let currentVal = parseInt(target.value, 10) || 0;
  const maxVal = parseInt(target.getAttribute("max"), 10) || 20;

  if (currentVal < maxVal) {
    target.value = currentVal + 1;
  }
}

// Hall Matrix Dataset mapping
const hallDataRegistry = {
  "grand-ballroom": {
    name: "The Grand Ballroom",
    capacity: "1,000 Guests",
    rate: 450000,
    formattedRate: "₦450,000",
  },
  "executive-suite": {
    name: "Executive Corporate Pavilion",
    capacity: "250 Guests",
    rate: 250000,
    formattedRate: "₦250,000",
  },
  "garden-terrace": {
    name: "The Royal Garden Terrace",
    capacity: "500 Guests",
    rate: 300000,
    formattedRate: "₦300,000",
  },
};

// Controls displaying the specification layout dynamically
function handleSelectionSpecsChange() {
  const eventType = document.getElementById("eventTypeSelect").value;
  const hallKey = document.getElementById("preferredHallSelect").value;
  const specCard = document.getElementById("hallSpecificationProfileCard");

  if (eventType && hallKey) {
    const hallInfo = hallDataRegistry[hallKey];

    if (hallInfo) {
      // Bind context variables into elements
      document.getElementById("specBadgeType").innerText = eventType;
      document.getElementById("specHallName").innerText = hallInfo.name;
      document.getElementById("specCapacity").innerText = hallInfo.capacity;
      document.getElementById("specRate").innerText = hallInfo.formattedRate;

      // Set up foundational initial configuration parameters for the ledger summary card
      document.getElementById("ledgerRateDisplay").innerText =
        hallInfo.formattedRate;

      // Bring card up layout seamlessly
      specCard.classList.remove("d-none");
    }
  } else {
    specCard.classList.add("d-none");
  }
}

function decrementValue(inputId) {
  const target = document.getElementById(inputId);
  let currentVal = parseInt(target.value, 10) || 0;
  const minVal = parseInt(target.getAttribute("min"), 10) || 0;

  if (currentVal > minVal) {
    target.value = currentVal - 1;
  }
}

// Step Incrementor Engine for Multi-Room Configurations
function adjustSelectedRoomCount(roomTypeKey, alteration) {
  const selector = document.getElementById("qty_" + roomTypeKey);
  let currentQty = parseInt(selector.value, 10) || 0;
  const minCap = parseInt(selector.getAttribute("min"), 10) || 0;
  const maxCap = parseInt(selector.getAttribute("max"), 10) || 5;

  let simulatedQty = currentQty + alteration;

  if (simulatedQty >= minCap && simulatedQty <= maxCap) {
    selector.value = simulatedQty;
    recalculateGlobalCartTotals();
  }
}

// Scans all selection points to compute final summary aggregates and balances against step 1 expectations
function recalculateGlobalCartTotals() {
  // 1. Fetch how many rooms they originally asked for in step 1
  // If your step 1 selector has a specific ID (e.g., 'input_rooms'), use that here.
  // Otherwise, fallback to a sensible default or dynamic state variables.
  const roomsRequestedSelector = document.getElementById("input_rooms");
  const totalRoomsRequested = roomsRequestedSelector
    ? parseInt(roomsRequestedSelector.value, 10) || 1
    : 1;

  const selectors = document.querySelectorAll(".room-qty-selector");
  let dynamicTotalRooms = 0;
  let dynamicTotalCost = 0;

  selectors.forEach((input) => {
    const qty = parseInt(input.value, 10) || 0;
    const aggregatePeriodRate =
      parseFloat(input.getAttribute("data-rate")) || 0;

    dynamicTotalRooms += qty;
    dynamicTotalCost += qty * aggregatePeriodRate;
  });

  // Bind core numbers to layout headers
  document.getElementById("stickyTotalRoomsLabel").innerText =
    dynamicTotalRooms +
    (dynamicTotalRooms === 1 ? " Room Selected" : " Rooms Selected");
  document.getElementById("stickyTotalCostLabel").innerText =
    "₦" + dynamicTotalCost.toLocaleString();

  // 2. Target your button and validation status message elements
  const actionBtn = document.getElementById("stickyBookBtn");
  let statusAlertMessage = document.getElementById(
    "roomValidationFeedbackMessage",
  );

  // Create an alert message box inside the workspace if it doesn't exist yet
  if (!statusAlertMessage) {
    const container = document.getElementById(
      "stickyTotalRoomsLabel",
    ).parentElement;
    statusAlertMessage = document.createElement("div");
    statusAlertMessage = document.createElement("div");
    statusAlertMessage.id = "roomValidationFeedbackMessage";
    statusAlertMessage.className = "small fw-bold mt-2 text-start px-1";
    container.appendChild(statusAlertMessage);
  }

  // 3. Balance Checks and Validation Laws
  if (dynamicTotalRooms === 0) {
    // Nothing chosen yet
    actionBtn.setAttribute("disabled", "true");
    statusAlertMessage.className = "small fw-bold mt-2 text-warning";
    statusAlertMessage.innerHTML = `<i class="bi bi-info-circle-fill me-1"></i> Please select your <strong>${totalRoomsRequested}</strong> requested room selections below.`;
  } else if (dynamicTotalRooms < totalRoomsRequested) {
    // Under-selected: requested 3 rooms but only picked 1 or 2
    actionBtn.setAttribute("disabled", "true");
    const balanceRemaining = totalRoomsRequested - dynamicTotalRooms;
    statusAlertMessage.className =
      "small fw-bold mt-2 text-danger animate__animated animate__headShake";
    statusAlertMessage.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i> Selection incomplete! Please choose <strong>${balanceRemaining}</strong> more room${balanceRemaining > 1 ? "s" : ""} to match your reservation criteria.`;
  } else if (dynamicTotalRooms > totalRoomsRequested) {
    // Over-selected: chose more rooms than allocated in form fields
    actionBtn.setAttribute("disabled", "true");
    const balanceOver = dynamicTotalRooms - totalRoomsRequested;
    statusAlertMessage.className =
      "small fw-bold mt-2 text-danger animate__animated animate__headShake";
    statusAlertMessage.innerHTML = `<i class="bi bi-dash-circle-fill me-1"></i> Over limit! You selected <strong>${balanceOver}</strong> extra room${balanceOver > 1 ? "s" : ""}. Please reduce count or click back to update criteria parameters.`;
  } else {
    // Perfect match balance achieved! Unlock transition pipelines safely
    actionBtn.removeAttribute("disabled");
    statusAlertMessage.className = "small fw-bold mt-2 text-success";
    statusAlertMessage.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> Selection matching criteria perfect. You are ready to proceed!`;
  }
}

// Temporary Action Hook for Step 2 Complete
// =========================================================================
// WIZARD FRAMEWORK TRANSITIONS (PHASE 2 TO PHASE 3 VERIFICATION ENGINE)
// =========================================================================

/**
 * Triggers when clicking 'Confirm Choices & Proceed'.
 * Gathers selection summaries and advances views to Step 3.
 */
function executeRoomBookingHoldTransition() {
  const currentDates = document.getElementById("summaryDatesLabel").innerHTML;
  const adultsVal = document.getElementById("adultsCount").value;
  const childrenVal = document.getElementById("childrenCount").value;
  const totalCostText = document.getElementById(
    "stickyTotalCostLabel",
  ).innerText;

  let chosenRoomProfiles = [];
  if (parseInt(document.getElementById("qty_executive").value, 10) > 0) {
    chosenRoomProfiles.push(
      `${document.getElementById("qty_executive").value}x Executive Royal`,
    );
  }
  if (parseInt(document.getElementById("qty_presidential").value, 10) > 0) {
    chosenRoomProfiles.push(
      `${document.getElementById("qty_presidential").value}x Imperial Presidential`,
    );
  }

  document.getElementById("step3DatesLabel").innerHTML = currentDates;
  document.getElementById("step3SelectedRoomsLabel").innerText =
    chosenRoomProfiles.length > 0
      ? chosenRoomProfiles.join(", ")
      : "None Selected";
  document.getElementById("step3AdultsCount").value = adultsVal;
  document.getElementById("step3ChildrenCount").value = childrenVal;

  document.getElementById("step3BaseTotalDisplay").innerText = totalCostText;
  document.getElementById("step3GrandTotalDisplay").innerText = totalCostText;

  // Flipped smoothly because they are now clean siblings
  document.getElementById("booking-results-workspace").classList.add("d-none");
  document
    .getElementById("booking-verification-workspace")
    .classList.remove("d-none");

  window.scrollTo({
    top: document.getElementById("booking-engine-core").offsetTop - 20,
    behavior: "smooth",
  });
}
/**
 * Reverts viewpoint from Verification workspace back to the Room Selection workspace matrix
 */
function revertToRoomSelectionGrid() {
  document
    .getElementById("booking-verification-workspace")
    .classList.add("d-none");
  document
    .getElementById("booking-results-workspace")
    .classList.remove("d-none");
}

/**
 * Simulates processing pipelines through a Paystack routing layer
 */
function processPaystackEngineGateway() {
  const verificationForm = document.getElementById("hmsGuestVerificationForm");
  if (!verificationForm.checkValidity()) {
    verificationForm.reportValidity();
    return;
  }

  alert(
    "Payment Authenticated Successfully!\nStatus: CONFIRMED\n\nClicking OK will render your digital workspace validation receipt.",
  );

  // Compile values with 'Paid' flag styling configurations
  compileReceiptDataManifest(true);

  document
    .getElementById("booking-verification-workspace")
    .classList.add("d-none");
  document
    .getElementById("booking-confirmation-workspace")
    .classList.remove("d-none");
  window.scrollTo({
    top: document.getElementById("booking-engine-core").offsetTop - 20,
    behavior: "smooth",
  });
}

/**
 * Flags and triggers the native Bootstrap alert hold engine
 */
function processPayLaterHoldRequest() {
  const verificationForm = document.getElementById("hmsGuestVerificationForm");
  if (!verificationForm.checkValidity()) {
    verificationForm.reportValidity();
    return;
  }

  // Compile values with 'Hold' flag styling configurations
  compileReceiptDataManifest(false);

  document
    .getElementById("booking-verification-workspace")
    .classList.add("d-none");
  document
    .getElementById("booking-confirmation-workspace")
    .classList.remove("d-none");
  window.scrollTo({
    top: document.getElementById("booking-engine-core").offsetTop - 20,
    behavior: "smooth",
  });
}

/**
 * Helper function to parse user values from forms into immutable receipt nodes
 */
function compileReceiptDataManifest(isPaidMode) {
  // Collect text input variables safely
  const fullName = document.getElementById("guestFullName").value || "N/A";
  const email = document.getElementById("guestEmail").value || "N/A";
  const phone = document.getElementById("guestPhone").value || "N/A";
  const notes = document.getElementById("guestNotes").value || "None specified";

  // Auto generate dynamic registration number values contextually if needed
  const randomToken =
    "HMS-" + Math.random().toString(36).substr(2, 7).toUpperCase();
  document.getElementById("manifestTokenString").innerText = randomToken;

  // Set dynamic timestamps
  const now = new Date();
  document.getElementById("receiptGeneratedTimestamp").innerText =
    `Generated: ${now.toLocaleDateString()} @ ${now.toLocaleTimeString()}`;

  // Map profile inputs
  document.getElementById("receiptGuestName").innerText = fullName;
  document.getElementById("receiptGuestEmail").innerText = email;
  document.getElementById("receiptGuestPhone").innerText = phone;
  document.getElementById("receiptNotesProfile").innerText = notes;

  // Explicitly parse Check-In, Check-Out, and Nights data elements from criteria inputs
  const checkInVal = document.getElementById("input_checkin").value || "TBD";
  const checkOutVal = document.getElementById("input_checkout").value || "TBD";
  const nightsVal = document.getElementById("input_nights").value || "1";

  document.getElementById("receiptCheckInDate").innerText = checkInVal;
  document.getElementById("receiptCheckOutDate").innerText = checkOutVal;
  document.getElementById("receiptNightsCount").innerText =
    `${nightsVal} ${parseInt(nightsVal, 10) === 1 ? "Night" : "Nights"}`;

  // Map structural data pools remaining
  document.getElementById("receiptComposition").innerText =
    `${document.getElementById("step3AdultsCount").value} Adults, ${document.getElementById("step3ChildrenCount").value} Children`;
  document.getElementById("receiptRoomsProfile").innerText =
    document.getElementById("step3SelectedRoomsLabel").innerText;

  // Map financial balances across
  const finalBill = document.getElementById("step3GrandTotalDisplay").innerText;
  document.getElementById("receiptBaseAmountLine").innerText = finalBill;
  document.getElementById("receiptFinalAmount").innerText = finalBill;

  // Handle distinct theme changes based on whether it is a payment or a temporary hold hold
  const badge = document.getElementById("receiptStatusBadge");
  const holdAlert = document.getElementById("bootstrapHoldAlert");

  if (isPaidMode) {
    holdAlert.classList.add("d-none");
    badge.className =
      "badge mt-2 px-3 py-2 text-uppercase fw-black shadow-sm bg-success text-white";
    badge.innerText = "Paid / Confirmed";
  } else {
    holdAlert.classList.remove("d-none");
    badge.className =
      "badge mt-2 px-3 py-2 text-uppercase fw-black shadow-sm bg-warning text-dark";
    badge.innerText = "On Hold / Unpaid";
  }
}

// =========================================================================
// WIZARD FRAMEWORK TRANSITIONS (PHASE 1 TO PHASE 2 ENGINE)
// =========================================================================

/**
 * Grabs values entered within Phase 1 forms, maps them natively inside
 * Phase 2 summary descriptors, and flips visibility flags smoothly.
 */
function handleSearchSubmitAndSwap() {
  // Extract parameters from initial criteria controls safely
  const rawCheckIn = document.getElementById("input_checkin").value;
  const rawCheckOut = document.getElementById("input_checkout").value;
  const nightsValue = document.getElementById("input_nights").value || "1";
  const adultsValue = document.getElementById("adultsCount").value || "2";
  const childrenValue = document.getElementById("childrenCount").value || "0";

  // Format dates gracefully if selected, fall back safely if empty
  const displayCheckIn = rawCheckIn ? rawCheckIn : "TBD";
  const displayCheckOut = rawCheckOut ? rawCheckOut : "TBD";

  // Map content down to summary target display markers
  document.getElementById("summaryDatesLabel").innerHTML =
    `<i class="bi bi-calendar3 me-1 text-accent-theme"></i> ${displayCheckIn} — ${displayCheckOut}`;
  document.getElementById("summaryNightsLabel").innerText =
    `${nightsValue} ${parseInt(nightsValue, 10) === 1 ? "Night" : "Nights"}`;
  document.getElementById("summaryCompositionLabel").innerHTML =
    `<i class="bi bi-people-fill me-1 text-accent-theme"></i> ${adultsValue} Adults, ${childrenValue} Children`;

  // Swap active layout states smoothly without page reloads
  document.getElementById("booking-form-workspace").classList.add("d-none");
  document
    .getElementById("booking-results-workspace")
    .classList.remove("d-none");

  // Trigger calculation updates to establish an accurate baseline (zero initialization)
  recalculateGlobalCartTotals();
}

/**
 * Reverts viewports gracefully from Room Selections back to the Form Parameters view
 */
function revertToSearchCriteria() {
  document.getElementById("booking-results-workspace").classList.add("d-none");
  document.getElementById("booking-form-workspace").classList.remove("d-none");
}

function printReceipt() {
  // 1. Grab the content of your specific div
  const receiptContent = document.getElementById(
    "printableReceiptCard",
  ).innerHTML;

  // 2. Open a new temporary window
  const printWindow = window.open("", "", "height=600,width=800");

  printWindow.document.write("<html><head><title>Print Receipt</title>");

  // 3. CRITICAL: Copy all styles from the parent window into the new window
  // This grabs both external external stylesheets and internal <style> blocks
  const styles = document.querySelectorAll('link[rel="stylesheet"], style');
  styles.forEach((style) => {
    printWindow.document.write(style.outerHTML);
  });

  printWindow.document.write("</head><body>");
  printWindow.document.write(receiptContent);
  printWindow.document.write("</body></html>");

  // 4. Trigger the print dialog and close the window
  printWindow.document.close();
  printWindow.focus();

  // Give external stylesheets and images a brief moment to load
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500); // Increased slightly to 500ms to ensure heavy CSS loads
}

//ensuring past dates are not picked, auto-calculating number of nights amd ensuring check out is not before check in
document.addEventListener("DOMContentLoaded", function () {
  const checkinInput = document.getElementById("input_checkin");
  const checkoutInput = document.getElementById("input_checkout");
  const nightsInput = document.getElementById("input_nights");

  // --- REQUIREMENT 1: Prevent selecting past dates ---
  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  checkinInput.min = today;
  checkoutInput.min = today;

  // Listen for changes on the Check-In Date
  checkinInput.addEventListener("change", function () {
    const checkinValue = checkinInput.value;

    // --- REQUIREMENT 2: Check-out cannot be before check-in ---
    // Dynamically set the minimum allowed date for checkout to the check-in date
    checkoutInput.min = checkinValue;

    // If checkout date is now earlier than the new check-in date, clear it
    if (checkoutInput.value && checkoutInput.value < checkinValue) {
      checkoutInput.value = "";
    }

    calculateNights();
  });

  // Listen for changes on the Check-Out Date
  checkoutInput.addEventListener("change", function () {
    calculateNights();
  });

  // --- REQUIREMENT 3: Auto-calculate nights ---
  function calculateNights() {
    const checkinDate = new Date(checkinInput.value);
    const checkoutDate = new Date(checkoutInput.value);

    // Make sure both dates are actually selected and valid
    if (
      checkinInput.value &&
      checkoutInput.value &&
      checkoutDate > checkinDate
    ) {
      // Calculate the difference in milliseconds
      const timeDifference = checkoutDate.getTime() - checkinDate.getTime();

      // Convert milliseconds to days (1 day = 24h * 60m * 60s * 1000ms)
      const totalNights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      nightsInput.value = totalNights;
    } else {
      // Clear the field if dates are invalid or incomplete
      nightsInput.value = "";
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const eventStartInput = document.getElementById("eventStart");
  const eventEndInput = document.getElementById("eventEnd");

  if (eventStartInput && eventEndInput) {
    // Enforce boundary logic: cannot pick a date/time in the past
    const nowString = new Date().toISOString().slice(0, 16);
    eventStartInput.min = nowString;
    eventEndInput.min = nowString;

    // Force sequence tracking on value changes
    eventStartInput.addEventListener("change", function () {
      // End date cannot be chronologically before start date
      eventEndInput.min = eventStartInput.value;
      if (eventEndInput.value && eventEndInput.value < eventStartInput.value) {
        eventEndInput.value = "";
      }
      calculateDynamicEventLedger();
    });

    eventEndInput.addEventListener("change", function () {
      if (
        eventStartInput.value &&
        eventEndInput.value < eventStartInput.value
      ) {
        alert(
          "Error: Event End Date & Time cannot be before your selected Start Date & Time.",
        );
        eventEndInput.value = "";
      }
      calculateDynamicEventLedger();
    });
  }
});

/**
 * Parses current event intervals and recalculates live pricing sheets
 */
function calculateDynamicEventLedger() {
  const startVal = document.getElementById("eventStart").value;
  const endVal = document.getElementById("eventEnd").value;
  const hallKey = document.getElementById("preferredHallSelect").value;

  const daysDisplay = document.getElementById("ledgerDaysDisplay");
  const amountDisplay = document.getElementById("ledgerAmountDisplay");

  if (!startVal || !endVal || !hallKey || !hallDataRegistry[hallKey]) {
    if (daysDisplay) daysDisplay.innerText = "0 Days";
    if (amountDisplay) amountDisplay.innerText = "₦0.00";
    return;
  }

  const start = new Date(startVal);
  const end = new Date(endVal);
  const timeDiff = end - start;

  if (timeDiff > 0) {
    // Convert milliseconds to active decimal days, rounding up cleanly
    let totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    if (totalDays === 0) totalDays = 1; // Safely baseline minimum fractions to 1 full day

    const baseRate = hallDataRegistry[hallKey].rate;
    const totalAmount = totalDays * baseRate;

    if (daysDisplay)
      daysDisplay.innerText = totalDays + (totalDays === 1 ? " Day" : " Days");
    if (amountDisplay)
      amountDisplay.innerText = "₦" + totalAmount.toLocaleString();
  } else {
    if (daysDisplay) daysDisplay.innerText = "0 Days";
    if (amountDisplay) amountDisplay.innerText = "₦0.00";
  }
}

/**
 * Overrides default hall logic hooks to force immediate pricing ledger syncs
 */
const originalHandleSelectionSpecsChange = handleSelectionSpecsChange;
handleSelectionSpecsChange = function () {
  if (typeof originalHandleSelectionSpecsChange === "function") {
    originalHandleSelectionSpecsChange();
  }
  calculateDynamicEventLedger();
};

/**
 * Captures form profiles, overrides event propagation, and switches views onto the hold manifest voucher
 */
function executeEventBookingPipeline(e) {
  e.preventDefault();

  const startVal = document.getElementById("eventStart").value;
  const endVal = document.getElementById("eventEnd").value;

  if (new Date(endVal) <= new Date(startVal)) {
    alert(
      "Verification Matrix Failed: The event completion marker must be contextually set after the starting window.",
    );
    return;
  }

  // Fire the initial feedback dialogue requested
  alert(
    "Verifying matrix... Hold registered for viewing. Click OK to display your luxury holding receipt voucher.",
  );

  // Extract dynamic data models safely
  const name = document.getElementById("eventOrganizerName").value;
  const email = document.getElementById("eventOrganizerEmail").value;
  const phone = document.getElementById("eventOrganizerPhone").value;
  const type = document.getElementById("eventTypeSelect").value;
  const hallKey = document.getElementById("preferredHallSelect").value;

  const hallName = hallDataRegistry[hallKey]
    ? hallDataRegistry[hallKey].name
    : "Selected Location";
  const baseRateFormatted =
    document.getElementById("ledgerRateDisplay").innerText;
  const totalDaysText = document.getElementById("ledgerDaysDisplay").innerText;
  const totalAmountFormatted = document.getElementById(
    "ledgerAmountDisplay",
  ).innerText;

  // Generate token sequences
  const bookingToken =
    "EVT-" + Math.random().toString(36).substr(2, 6).toUpperCase();

  // Map compiled strings natively into voucher node segments
  document.getElementById("v_bookingNumber").innerText = bookingToken;
  document.getElementById("v_timestamp").innerText =
    `Generated: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}`;
  document.getElementById("v_name").innerText = name;
  document.getElementById("v_email").innerText = email;
  document.getElementById("v_phone").innerText = phone;
  document.getElementById("v_type").innerText = type;
  document.getElementById("v_hall").innerText = hallName;
  document.getElementById("v_start").innerText = startVal.replace("T", " ");
  document.getElementById("v_end").innerText = endVal.replace("T", " ");
  document.getElementById("v_days").innerText = totalDaysText;
  document.getElementById("v_rate").innerText = baseRateFormatted;
  document.getElementById("v_total").innerText = totalAmountFormatted;

  // Swap layouts smoothly without standard document lifecycle failures
  document.getElementById("hmsEventBookingForm").classList.add("d-none");
  document.getElementById("eventSuccessVoucherCard").classList.remove("d-none");

  // Scroll up viewport directly onto voucher card element
  document
    .getElementById("eventSuccessVoucherCard")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}
