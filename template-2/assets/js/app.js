
document.addEventListener("DOMContentLoaded", function () {
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
      image: "files/room-1.jpg",
      details: "Elegant room with king bed, city view, breakfast option, fast Wi-Fi, smart TV, and warm interiors."
    },
    executive: {
      name: "Executive Suite",
      price: 155000,
      image: "files/room-2.jpg",
      details: "Spacious suite with lounge area, workspace, smart TV, breakfast option, premium bath, and concierge support."
    },
    presidential: {
      name: "Presidential Suite",
      price: 280000,
      image: "files/room-3.jpg",
      details: "Signature suite with private lounge, VIP service, premium bath, dining space, concierge support, and luxury finishes."
    }
  };

  function formatMoney(amount) {
    return "₦" + Number(amount || 0).toLocaleString();
  }

  function getNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn + "T00:00:00");
    const end = new Date(checkOut + "T00:00:00");
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

    const nights = getNights(roomCheckIn ? roomCheckIn.value : "", roomCheckOut ? roomCheckOut.value : "");

    if (!nights) {
      if (roomAvailabilityAlert) {
        roomAvailabilityAlert.textContent = "Please select a valid check-in and check-out date first.";
        roomAvailabilityAlert.classList.add("show");
      }
      roomAvailabilityResults.innerHTML = "";
      return;
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
  }

  const checkAvailabilityBtn = document.querySelector("#checkAvailabilityBtn");
  if (checkAvailabilityBtn) {
    checkAvailabilityBtn.addEventListener("click", renderAvailabilityCards);
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
    const total = room ? room.price * nights : 0;

    roomSummaryBox.innerHTML = `
      <div class="web-summary-row"><span class="web-summary-label">Room</span><span class="web-summary-value">${room ? room.name : "-"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Check-in</span><span class="web-summary-value">${roomCheckIn.value || "-"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Check-out</span><span class="web-summary-value">${roomCheckOut.value || "-"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Length of stay</span><span class="web-summary-value">${nights} night(s)</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Guests</span><span class="web-summary-value">${adults} adult(s), ${children} child(ren)</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Phone</span><span class="web-summary-value">${phone}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Extras</span><span class="web-summary-value">${extras}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Estimated total</span><span class="web-summary-value">${formatMoney(total)}</span></div>
    `;
  }

  const continueRoomBookingBtn = document.querySelector("#continueRoomBookingBtn");
  if (continueRoomBookingBtn) {
    continueRoomBookingBtn.addEventListener("click", function () {
      const nights = getNights(roomCheckIn ? roomCheckIn.value : "", roomCheckOut ? roomCheckOut.value : "");
      const roomKey = selectedRoomInput && selectedRoomInput.value ? selectedRoomInput.value : (roomType ? roomType.value : "");

      if (!nights || !roomKey || roomKey === "all") {
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
    });
  }

  const eventDate = document.querySelector("#eventDate");
  const eventStart = document.querySelector("#eventStart");
  const eventEnd = document.querySelector("#eventEnd");
  const eventDurationOutput = document.querySelector("#eventDurationOutput");
  const eventStepOne = document.querySelector("#eventStepOne");
  const eventStepTwo = document.querySelector("#eventStepTwo");
  const eventSummaryBox = document.querySelector("#eventSummaryBox");

  function getEventHours() {
    if (!eventStart || !eventEnd || !eventStart.value || !eventEnd.value) return 0;
    const start = new Date("2026-01-01T" + eventStart.value + ":00");
    const end = new Date("2026-01-01T" + eventEnd.value + ":00");
    const diff = end - start;
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  }

  function updateEventDuration() {
    if (!eventDurationOutput) return;
    const hours = getEventHours();
    eventDurationOutput.innerHTML = '<i class="fa-solid fa-clock me-2"></i>' + (hours ? hours + " hour(s)" : "Select valid time");
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
    const hours = getEventHours();

    eventSummaryBox.innerHTML = `
      <div class="web-summary-row"><span class="web-summary-label">Booking type</span><span class="web-summary-value">Events & Halls</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Event type</span><span class="web-summary-value">${eventType}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Hall</span><span class="web-summary-value">${hall}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Event date</span><span class="web-summary-value">${eventDate?.value || "-"}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Duration</span><span class="web-summary-value">${hours || 0} hour(s)</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Guests</span><span class="web-summary-value">${guests}</span></div>
      <div class="web-summary-row"><span class="web-summary-label">Phone</span><span class="web-summary-value">${phone}</span></div>
    `;
  }

  const continueEventBookingBtn = document.querySelector("#continueEventBookingBtn");
  if (continueEventBookingBtn) {
    continueEventBookingBtn.addEventListener("click", function () {
      const hours = getEventHours();

      if (!eventDate?.value || !hours) {
        alert("Please select a valid event date, start time, and end time.");
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
