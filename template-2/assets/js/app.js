
function bindStayDates(arrival, departure) {
  function validate() {
    const invalid = arrival.value && departure.value && departure.value <= arrival.value;
    departure.setCustomValidity(invalid ? "Choose a check-out date after check-in." : "");
  }

  [arrival, departure].forEach(input => input.addEventListener("input", validate));
  validate();
  return validate;
}

function startHeroCarousel(hero) {
  const images = [...hero.querySelectorAll(".web-hero-image")];
  const slideContent = hero.querySelector(".web-hero-slides");
  const slides = [...slideContent.querySelectorAll(".web-hero-slide")];
  const slideInterval = 7000;
  const controls = hero.querySelector(".web-hero-controls");
  const indicators = [...controls.querySelectorAll("[data-hero-slide]")];
  const toggle = controls.querySelector("[data-hero-toggle]");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let playing = !motion.matches;
  let timer;

  function schedule() {
    window.clearTimeout(timer);
    if (playing && !document.hidden && !slideContent.contains(document.activeElement)) {
      timer = window.setTimeout(() => show((current + 1) % slides.length), slideInterval);
    }
  }

  function show(next) {
    if (next !== current) {
      const leaving = images[current];
      leaving.classList.add("is-leaving");
      window.setTimeout(() => leaving.classList.remove("is-leaving"), 1250);
      slides.forEach((slide, index) => {
        const active = index === next;
        slide.classList.toggle("is-current", active);
        slide.inert = !active;
        slide.setAttribute("aria-hidden", String(!active));
        images[index].classList.toggle("is-current", active);
        if (active) {
          images[index].classList.remove("is-leaving");
          indicators[index].setAttribute("aria-current", "true");
        } else {
          indicators[index].removeAttribute("aria-current");
        }
      });
      current = next;
    }
    schedule();
  }

  function setPlaying(value) {
    playing = value;
    toggle.textContent = playing ? "Pause slideshow" : "Play slideshow";
    schedule();
  }

  indicators.forEach((button, index) => button.addEventListener("click", () => show(index)));
  toggle.addEventListener("click", () => {
    setPlaying(!playing);
    if (playing) show((current + 1) % slides.length);
  });
  slideContent.addEventListener("focusin", schedule);
  slideContent.addEventListener("focusout", () => window.setTimeout(schedule, 0));
  document.addEventListener("visibilitychange", schedule);
  motion.addEventListener("change", () => setPlaying(!motion.matches));
  controls.hidden = false;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    hero.querySelector(".web-hero-images").classList.add("is-animated");
  }));
  setPlaying(playing);
}

document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector(".web-home-hero");
  if (hero) startHeroCarousel(hero);
  const heroForm = document.querySelector("#heroBookingForm");
  if (heroForm) {
    bindStayDates(heroForm.elements.arrival, heroForm.elements.departure);
  }

  const currentLink = document.querySelector(".web-navbar .nav-link.active");
  if (currentLink) currentLink.setAttribute("aria-current", "page");
  const sectionBackgroundOrder = [
    "web-section-bg-light",
    "web-section-bg-soft",
    "web-section-bg-secondary",
    "web-section-bg-primary",
    "web-section-bg-accent",
    "web-section-bg-soft",
    "web-section-bg-dark"
  ];

  document.querySelectorAll(".js-bg-order").forEach(function (section, index) {
    section.classList.add(sectionBackgroundOrder[index % sectionBackgroundOrder.length]);
  });

  const navbar = document.querySelector(".web-navbar");

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 30) {
      navbar.classList.add("web-navbar-scrolled");
    } else {
      navbar.classList.remove("web-navbar-scrolled");
    }
  }

  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll);

  const tabButtons = document.querySelectorAll("[data-booking-tab]");
  const panels = document.querySelectorAll("[data-booking-panel]");

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-booking-tab");

      tabButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      panels.forEach(function (panel) {
        panel.classList.remove("active");
      });

      button.classList.add("active");

      const activePanel = document.querySelector('[data-booking-panel="' + target + '"]');
      if (activePanel) activePanel.classList.add("active");
    });
  });

  const roomData = {
    deluxe: {
      name: "Deluxe Room",
      price: 95000,
      image: "../files/room-1.jpg",
      details: "Elegant room with king bed, city view, breakfast option, fast Wi-Fi, smart TV, and warm interiors."
    },
    executive: {
      name: "Executive Suite",
      price: 155000,
      image: "../files/room-2.jpg",
      details: "Spacious suite with lounge area, workspace, smart TV, breakfast option, premium bath, and concierge support."
    },
    presidential: {
      name: "Presidential Suite",
      price: 280000,
      image: "../files/room-3.jpg",
      details: "Signature suite with private lounge, VIP service, premium bath, dining space, concierge support, and luxury finishes."
    }
  };

  function formatMoney(amount) {
    return "₦" + Number(amount || 0).toLocaleString();
  }

  function getNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn + "T00:00:00Z");
    const end = new Date(checkOut + "T00:00:00Z");
    const diff = end - start;
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  }

  const roomCheckIn = document.querySelector("#roomCheckIn");
  const roomCheckOut = document.querySelector("#roomCheckOut");
  const roomType = document.querySelector("#roomType");
  const roomStayOutput = document.querySelector("#roomStayOutput");
  const roomAvailabilityAlert = document.querySelector("#roomAvailabilityAlert");
  const roomAvailabilityResults = document.querySelector("#roomAvailabilityResults");
  const selectedRoomInput = document.querySelector("#selectedRoom");
  const roomStepOne = document.querySelector("#roomStepOne");
  const roomStepTwo = document.querySelector("#roomStepTwo");
  const roomSummaryBox = document.querySelector("#roomSummaryBox");
  const roomCount = document.querySelector("#roomCount");
  const roomAdults = document.querySelector("#roomAdults");
  const roomChildren = document.querySelector("#roomChildren");
  const roomSearchFields = [roomCheckIn, roomCheckOut, roomCount, roomAdults, roomChildren, roomType];
  const validateRoomDates = roomCheckIn && bindStayDates(roomCheckIn, roomCheckOut);

  function validateRoomSearch() {
    validateRoomDates();
    return roomSearchFields.every(input => input.reportValidity());
  }

  function updateRoomStayOutput() {
    if (!roomCheckIn || !roomCheckOut || !roomStayOutput) return;
    const nights = getNights(roomCheckIn.value, roomCheckOut.value);
    roomStayOutput.innerHTML = '<i class="fa-solid fa-moon me-2"></i>' + (nights ? nights + " night(s)" : "Select valid dates");
  }

  [roomCheckIn, roomCheckOut].forEach(function (input) {
    if (input) {
      input.addEventListener("change", updateRoomStayOutput);
      input.addEventListener("input", updateRoomStayOutput);
    }
  });

  function renderAvailabilityCards() {
    if (!roomAvailabilityResults) return;

    if (!validateRoomSearch()) {
      roomAvailabilityResults.replaceChildren();
      return false;
    }

    if (roomAvailabilityAlert) roomAvailabilityAlert.classList.remove("show");

    const preferred = roomType ? roomType.value : "all";
    const rooms = Object.keys(roomData)
      .filter(function (key) {
        return preferred === "all" || preferred === key;
      })
      .map(function (key) {
        return { key: key, ...roomData[key] };
      });

    roomAvailabilityResults.innerHTML = rooms.map(function (room) {
      return `
        <div class="col-lg-4 col-md-6">
          <div class="web-availability-card">
            <img src="${room.image}" alt="${room.name}" />
            <div class="web-availability-card-body">
              <h4>${room.name}</h4>
              <div class="web-price-line">${formatMoney(room.price)} / night</div>
              <p class="web-form-help">${room.details}</p>
              <button type="button" class="web-btn-solid w-100" data-select-room="${room.key}">
                Select this room
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    roomAvailabilityResults.querySelectorAll("[data-select-room]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const roomKey = btn.getAttribute("data-select-room");
        if (selectedRoomInput) selectedRoomInput.value = roomKey;
        if (roomType) roomType.value = roomKey;

        if (roomAvailabilityAlert) {
          roomAvailabilityAlert.textContent = roomData[roomKey].name + " selected. Continue to booking details.";
          roomAvailabilityAlert.classList.add("show");
        }
      });
    });
    return true;
  }

  const checkAvailabilityBtn = document.querySelector("#checkAvailabilityBtn");
  if (checkAvailabilityBtn) {
    checkAvailabilityBtn.addEventListener("click", renderAvailabilityCards);
  }

  if (roomCheckIn) {
    roomSearchFields.forEach(input => input.addEventListener("input", () => {
      selectedRoomInput.value = "";
      roomAvailabilityResults.replaceChildren();
      roomAvailabilityAlert.classList.remove("show");
    }));

    const params = new URLSearchParams(window.location.search);
    if (params.get("from") === "hero") {
      const dialog = document.querySelector("#roomSearchDialog");
      const dialogFields = document.querySelector("#roomSearchDialogFields");
      const confirmSearch = document.querySelector("#confirmRoomSearch");

      ["arrival", "departure", "rooms", "adults", "children"].forEach((key, index) => {
        roomSearchFields[index].value = params.get(key) || "";
      });
      const preferredRoom = params.get("roomType");
      if ([...roomType.options].some(option => option.value === preferredRoom)) {
        roomType.value = preferredRoom;
      }
      validateRoomDates();
      updateRoomStayOutput();

      const incomplete = roomSearchFields.filter(input => !input.validity.valid);
      if (!incomplete.length) {
        dialog.querySelector("#roomSearchDialogTitle").textContent = "Continue to room availability";
        dialog.querySelector("#roomSearchDialogHelp").textContent = "Your dates and guest details are ready. Continue to see room options for your stay.";
        const roomPreference = dialog.querySelector("#roomSearchDialogRoom");
        roomPreference.textContent = roomType.selectedOptions[0].textContent;
        roomPreference.hidden = false;
        confirmSearch.textContent = "Continue";
      }

      const movedFields = incomplete.map(input => {
        const field = input.parentElement;
        const marker = document.createComment("Room search field position");
        field.before(marker);
        dialogFields.append(field);
        return { field, marker };
      });

      function restoreFields() {
        movedFields.forEach(({ field, marker }) => marker.replaceWith(field));
      }

      dialog.addEventListener("close", () => {
        if (!dialogFields.childElementCount) return;
        restoreFields();
        incomplete[0]?.focus();
      });
      document.querySelector("#cancelRoomSearch").addEventListener("click", () => dialog.close());
      confirmSearch.addEventListener("click", () => {
        validateRoomDates();
        if (!incomplete.every(input => input.reportValidity())) return;
        dialog.close();
        restoreFields();
        if (renderAvailabilityCards()) roomAvailabilityResults.focus();
      });
      dialog.showModal();
    }
  }

  function buildRoomSummary() {
    if (!roomSummaryBox || !roomCheckIn || !roomCheckOut || !roomType) return;

    const roomKey = selectedRoomInput && selectedRoomInput.value ? selectedRoomInput.value : roomType.value;
    const room = roomData[roomKey];
    const nights = getNights(roomCheckIn.value, roomCheckOut.value);
    const adults = document.querySelector("#roomAdults")?.value || "1";
    const children = document.querySelector("#roomChildren")?.value || "0";
    const phone = document.querySelector("#roomGuestPhone")?.value || "-";
    const extras = document.querySelector("#roomExtras")?.value || "No extras";
    const rooms = Number(roomCount.value);
    const total = room ? room.price * nights * rooms : 0;

    roomSummaryBox.innerHTML = `
      <div class="web-summary-row"><span class="web-summary-label">Room</span><span class="web-summary-value">${room ? room.name : "-"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Check-in</span><span class="web-summary-value">${roomCheckIn.value || "-"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Check-out</span><span class="web-summary-value">${roomCheckOut.value || "-"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Length of stay</span><span class="web-summary-value">${nights} night(s)</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Rooms</span><span class="web-summary-value">${rooms}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Guests</span><span class="web-summary-value">${adults} adult(s), ${children} child(ren)</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Phone</span><span class="web-summary-value" data-room-phone></span></div>
      <div class="web-summary-row"><span class="web-summary-label">Extras</span><span class="web-summary-value">${extras}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Estimated total</span><span class="web-summary-value">${formatMoney(total)}</span></div>
    `;
    roomSummaryBox.querySelector("[data-room-phone]").textContent = phone;
  }

  const continueRoomBookingBtn = document.querySelector("#continueRoomBookingBtn");
  if (continueRoomBookingBtn) {
    continueRoomBookingBtn.addEventListener("click", function () {
      if (!validateRoomSearch()) return;
      const roomKey = selectedRoomInput && selectedRoomInput.value ? selectedRoomInput.value : (roomType ? roomType.value : "");

      if (!roomKey || roomKey === "all") {
        if (roomAvailabilityAlert) {
          roomAvailabilityAlert.textContent = "Select valid dates and choose a specific room before continuing.";
          roomAvailabilityAlert.classList.add("show");
        }
        return;
      }

      if (selectedRoomInput) selectedRoomInput.value = roomKey;
      if (roomStepOne && roomStepTwo) {
        roomStepOne.classList.remove("active");
        roomStepTwo.classList.add("active");
      }
      buildRoomSummary();
    });
  }

  const backToRoomSearchBtn = document.querySelector("#backToRoomSearchBtn");
  if (backToRoomSearchBtn) {
    backToRoomSearchBtn.addEventListener("click", function () {
      if (roomStepOne && roomStepTwo) {
        roomStepTwo.classList.remove("active");
        roomStepOne.classList.add("active");
      }
    });
  }

  document.querySelectorAll("#roomBookingForm input, #roomBookingForm select, #roomBookingForm textarea").forEach(function (input) {
    input.addEventListener("input", buildRoomSummary);
    input.addEventListener("change", buildRoomSummary);
  });

  const roomForm = document.querySelector("#roomBookingForm");
  if (roomForm) {
    roomForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const dialog = document.querySelector("#roomSearchDialog");
      if (dialog?.open) document.querySelector("#confirmRoomSearch").click();
    });
  }

  const eventStart = document.querySelector("#eventStart");
  const eventEnd = document.querySelector("#eventEnd");
  const eventDurationOutput = document.querySelector("#eventDurationOutput");
  const eventStepOne = document.querySelector("#eventStepOne");
  const eventStepTwo = document.querySelector("#eventStepTwo");
  const eventSummaryBox = document.querySelector("#eventSummaryBox");
  const eventMinimum = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date()) + "T00:00";
  if (eventStart) eventStart.min = eventMinimum;

  function getEventHours() {
    if (!eventStart || !eventEnd || !eventStart.value || !eventEnd.value) return 0;
    const hours = (new Date(eventEnd.value) - new Date(eventStart.value)) / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  }

  function formatEventDuration() {
    const hours = getEventHours();
    if (!hours) return "";
    const totalMinutes = Math.round(hours * 60);
    if (totalMinutes >= 24 * 60) {
      const days = Math.ceil(totalMinutes / (24 * 60));
      return days + (days === 1 ? " day" : " days");
    }

    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (wholeHours) parts.push(wholeHours + (wholeHours === 1 ? " hour" : " hours"));
    if (minutes) parts.push(minutes + (minutes === 1 ? " minute" : " minutes"));
    return parts.join(" ");
  }

  function formatEventDateTime(value) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(new Date(value)) : "-";
  }

  function updateEventDuration() {
    if (!eventDurationOutput) return;
    const duration = formatEventDuration();
    if (eventStart && eventEnd) {
      eventEnd.min = eventStart.value || eventMinimum;
      eventEnd.setCustomValidity(eventStart.value && eventEnd.value && eventEnd.value <= eventStart.value
        ? "Choose an end date and time after the start date and time." : "");
    }
    eventDurationOutput.innerHTML = '<i class="fa-solid fa-clock me-2"></i>' +
      (duration || "Select valid date and time");
  }

  [eventStart, eventEnd].forEach(function (input) {
    if (input) {
      input.addEventListener("input", updateEventDuration);
      input.addEventListener("change", updateEventDuration);
    }
  });

  function buildEventSummary() {
    if (!eventSummaryBox) return;

    const hall = document.querySelector("#eventHall")?.value || "-";
    const eventType = document.querySelector("#eventType")?.value || "-";
    const guests = document.querySelector("#eventGuests")?.value || "-";
    const phone = document.querySelector("#eventPhone")?.value || "-";
    const duration = formatEventDuration();

    eventSummaryBox.innerHTML = `
      <div class="web-summary-row"><span class="web-summary-label">Booking type</span><span class="web-summary-value">Events & Halls</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Event type</span><span class="web-summary-value">${eventType}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Hall</span><span class="web-summary-value">${hall}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Start date and time</span><span class="web-summary-value">${formatEventDateTime(eventStart?.value)}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">End date and time</span><span class="web-summary-value">${formatEventDateTime(eventEnd?.value)}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Duration</span><span class="web-summary-value">${duration || "Select valid date and time"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Guests</span><span class="web-summary-value">${guests}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Phone</span><span class="web-summary-value">${phone}</span></div>
    `;
  }

  const continueEventBookingBtn = document.querySelector("#continueEventBookingBtn");
  if (continueEventBookingBtn) {
    continueEventBookingBtn.addEventListener("click", function () {
      const hours = getEventHours();

      updateEventDuration();
      if (!eventStart?.reportValidity() || !eventEnd?.reportValidity() || !hours) {
        if (eventStart?.value && eventEnd?.value && !hours) {
          eventEnd.setCustomValidity("Choose an end date and time after the start date and time.");
          eventEnd.reportValidity();
        }
        return;
      }

      if (eventStepOne && eventStepTwo) {
        eventStepOne.classList.remove("active");
        eventStepTwo.classList.add("active");
      }
      buildEventSummary();
    });
  }

  const backToEventFormBtn = document.querySelector("#backToEventFormBtn");
  if (backToEventFormBtn) {
    backToEventFormBtn.addEventListener("click", function () {
      if (eventStepOne && eventStepTwo) {
        eventStepTwo.classList.remove("active");
        eventStepOne.classList.add("active");
      }
    });
  }

  document.querySelectorAll("#eventBookingForm input, #eventBookingForm select, #eventBookingForm textarea").forEach(function (input) {
    input.addEventListener("input", buildEventSummary);
    input.addEventListener("change", buildEventSummary);
  });

  const eventForm = document.querySelector("#eventBookingForm");
  if (eventForm) {
    eventForm.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  updateRoomStayOutput();
  updateEventDuration();
});
