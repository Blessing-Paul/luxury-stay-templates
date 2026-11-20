const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const sideMenu = document.querySelector("#side-menu");
const menuBackdrop = document.querySelector(".menu-backdrop");

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  sideMenu.classList.toggle("is-open", isOpen);
  sideMenu.setAttribute("aria-hidden", String(!isOpen));
  sideMenu.inert = !isOpen;
  menuBackdrop.classList.toggle("is-visible", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  if (isOpen) menuClose.focus();
  else menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});
menuClose.addEventListener("click", () => setMenuOpen(false));
menuBackdrop.addEventListener("click", () => setMenuOpen(false));
sideMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
  }
});

const heroSlides = [...document.querySelectorAll(".hero-slide")];
const heroVideos = heroSlides.map((slide) => slide.querySelector(".hero-video"));
const heroRunway = document.querySelector(".hero-runway");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let heroSlidePositions = [];
let activeHeroIndex = -1;
let heroUpdatePending = false;

function updateHeroPlayback() {
  if (reducedMotion.matches) {
    heroVideos.forEach((video) => video?.pause());
    activeHeroIndex = -1;
    return;
  }

  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let nextActiveIndex = -1;

  heroSlidePositions.forEach((position, index) => {
    if (viewportCenter >= position) nextActiveIndex = index;
  });

  if (nextActiveIndex === heroSlides.length - 1
      && viewportCenter >= heroSlidePositions[nextActiveIndex] + window.innerHeight) {
    nextActiveIndex = -1;
  }
  if (nextActiveIndex === activeHeroIndex) return;

  activeHeroIndex = nextActiveIndex;
  heroVideos.forEach((video, index) => {
    if (!video) return;
    if (index !== activeHeroIndex) {
      video.pause();
      return;
    }
    video.play().catch((error) => {
      if (error.name !== "AbortError") {
        console.warn("Aster House hero video could not start.", error);
      }
    });
  });
}

function cacheHeroPositions() {
  if (!heroRunway) return;
  const runwayTop = window.scrollY + heroRunway.getBoundingClientRect().top;
  const slideHeight = heroSlides[0]?.offsetHeight || window.innerHeight;
  heroSlidePositions = heroSlides.map((_, index) => runwayTop + slideHeight * index);
  updateHeroPlayback();
}

window.addEventListener("scroll", () => {
  if (heroUpdatePending) return;
  heroUpdatePending = true;
  window.requestAnimationFrame(() => {
    updateHeroPlayback();
    heroUpdatePending = false;
  });
}, { passive: true });
window.addEventListener("resize", cacheHeroPositions);
cacheHeroPositions();

const revealElements = document.querySelectorAll(
  ".intro-copy, .intro-image-wrap, .intro-proof, .offer-heading, .host-photo, .host-details, .gallery-heading, .values-heading, .value-card, .booking-image, .booking-copy, .contact-copy, .contact-actions, .detail-story-copy, .detail-story-image, .detail-feature",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const quickBooking = document.querySelector("#quick-booking");
if (quickBooking) {
  const arrivalInput = quickBooking.elements.arrival;
  const departureInput = quickBooking.elements.departure;
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  arrivalInput.min = today;
  departureInput.min = today;

  arrivalInput.addEventListener("change", () => {
    departureInput.min = arrivalInput.value || today;
    if (departureInput.value && departureInput.value <= arrivalInput.value) departureInput.value = "";
  });

  quickBooking.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!quickBooking.reportValidity()) return;
    if (departureInput.value <= arrivalInput.value) {
      departureInput.focus();
      return;
    }
    const bookingUrl = new URL("booking.html#stay-request", window.location.href);
    bookingUrl.searchParams.set("arrival", arrivalInput.value);
    bookingUrl.searchParams.set("departure", departureInput.value);
    bookingUrl.searchParams.set("adults", quickBooking.elements.adults.value);
    window.location.assign(bookingUrl);
  });
}

const bookingForm = document.querySelector("#booking-request-form");
if (bookingForm) {
  const fields = bookingForm.elements;
  const roomFields = document.querySelector("#room-request-fields");
  const hallFields = document.querySelector("#hall-request-fields");
  const stayLength = document.querySelector("#stay-length");
  const record = document.querySelector("#booking-record");
  const recordTitle = document.querySelector("#booking-record-title");
  const recordStatus = document.querySelector("#booking-record-status");
  const recordDetails = document.querySelector("#booking-record-details");
  const recordNote = document.querySelector("#booking-record-note");
  const editButton = document.querySelector("#booking-edit");
  const prepareButton = document.querySelector("#booking-prepare");
  const printButton = document.querySelector("#booking-print");
  const emailLink = document.querySelector("#stay-request-email");
  const params = new URLSearchParams(window.location.search);
  const today = new Date();
  const dateMin = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  let reviewRows = [];
  let requestType;

  fields.arrival.min = dateMin;
  fields.eventDate.min = dateMin;
  for (const name of ["arrival", "departure", "adults", "children", "rooms", "room", "hall"]) {
    const value = params.get(name);
    const field = fields[name];
    if (!value) continue;
    if (field.options && !Array.from(field.options).some((option) => option.value === value)) continue;
    field.value = value;
  }
  if (params.get("type") === "hall") fields.bookingKind.value = "hall";

  function updateBookingKind() {
    const isHall = fields.bookingKind.value === "hall";
    roomFields.hidden = roomFields.disabled = isHall;
    hallFields.hidden = hallFields.disabled = !isHall;
  }

  function updateStayLength() {
    const arrival = fields.arrival.value;
    const departure = fields.departure.value;
    fields.departure.min = arrival || dateMin;
    const invalidRange = arrival && departure && departure <= arrival;
    fields.departure.setCustomValidity(invalidRange ? "Choose a departure date after arrival." : "");
    if (!arrival || !departure || invalidRange) {
      stayLength.textContent = "Choose valid dates to see the length of stay.";
      return;
    }
    const nights = (Date.parse(departure) - Date.parse(arrival)) / 86400000;
    stayLength.textContent = `${nights} ${nights === 1 ? "night" : "nights"}`;
  }

  function updateEventTimes() {
    const invalidRange = fields.startTime.value && fields.endTime.value && fields.endTime.value <= fields.startTime.value;
    fields.endTime.setCustomValidity(invalidRange ? "Choose an end time after the start time on the event date." : "");
  }

  function formatDate(value) {
    return dateFormat.format(new Date(`${value}T12:00:00`));
  }

  function formatTime(value) {
    return timeFormat.format(new Date(`2000-01-01T${value}`));
  }

  function renderDetails(rows) {
    const details = rows.map(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      return row;
    });
    recordDetails.replaceChildren(...details);
  }

  bookingForm.addEventListener("change", (event) => {
    if (event.target.name === "bookingKind") updateBookingKind();
  });
  for (const field of [fields.arrival, fields.departure]) {
    field.addEventListener("input", updateStayLength);
  }
  for (const field of [fields.startTime, fields.endTime]) {
    field.addEventListener("input", updateEventTimes);
  }
  updateBookingKind();
  updateStayLength();
  updateEventTimes();
  bookingForm.hidden = false;

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateStayLength();
    updateEventTimes();
    if (!bookingForm.reportValidity()) return;

    const isHall = fields.bookingKind.value === "hall";
    requestType = isHall ? "Event space" : "Room stay";
    const bookingRows = isHall ? [
      ["Venue", fields.hall.selectedOptions[0].textContent],
      ["Occasion", fields.occasion.value.trim()],
      ["Event date", formatDate(fields.eventDate.value)],
      ["Hours (venue local time)", `${formatTime(fields.startTime.value)} – ${formatTime(fields.endTime.value)}`],
      ["Estimated guests", fields.guests.value],
    ] : [
      ["Room preference", fields.room.selectedOptions[0].textContent],
      ["Arrival", formatDate(fields.arrival.value)],
      ["Departure", formatDate(fields.departure.value)],
      ["Length of stay", stayLength.textContent],
      ["Rooms", fields.rooms.value],
      ["Guests", `${fields.adults.value} adults, ${fields.children.value} children`],
    ];

    reviewRows = [
      ["Booking type", requestType],
      ...bookingRows,
      ["Name", fields.guestName.value.trim()],
      ["Email", fields.email.value],
    ];
    if (fields.phone.value.trim()) reviewRows.push(["Phone", fields.phone.value.trim()]);
    if (fields.message.value.trim()) reviewRows.push(["Special requests", fields.message.value.trim()]);

    renderDetails(reviewRows);
    recordTitle.textContent = "Review your request";
    recordStatus.textContent = "Review";
    recordNote.textContent = "Check these details before preparing your request.";
    prepareButton.hidden = false;
    printButton.hidden = true;
    emailLink.hidden = true;
    emailLink.removeAttribute("href");
    bookingForm.hidden = true;
    record.hidden = false;
    recordTitle.focus();
  });

  editButton.addEventListener("click", () => {
    record.hidden = true;
    bookingForm.hidden = false;
    bookingForm.querySelector('input[name="bookingKind"]:checked').focus();
  });

  prepareButton.addEventListener("click", () => {
    const bytes = window.crypto.getRandomValues(new Uint8Array(6));
    const reference = "AH-" + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
    const receiptRows = [
      ["Request reference", reference],
      ["Prepared on", dateFormat.format(new Date())],
      ...reviewRows,
      ["Pricing", "To be confirmed"],
      ["Payment", "No payment collected"],
    ];
    const subject = `Aster House ${requestType.toLowerCase()} request · ${reference}`;
    const message = receiptRows.map(([label, value]) => `${label}: ${value}`).join("\n");
    emailLink.href = `mailto:hello@asterhouse.example?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    renderDetails(receiptRows);
    recordTitle.textContent = "Booking request receipt";
    recordStatus.textContent = "Prepared";
    recordNote.textContent = "Send this request by email. Your booking is pending until Aster House confirms availability and pricing.";
    prepareButton.hidden = true;
    printButton.hidden = false;
    emailLink.hidden = false;
    recordTitle.focus();
  });

  printButton.addEventListener("click", () => window.print());
}

for (const form of document.querySelectorAll(".guest-account-form")) {
  const feedback = form.querySelector(".guest-account-feedback");
  const password = form.elements.password;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (password) password.value = "";
    feedback.textContent = password
      ? "Online sign-in is currently unavailable. Contact Aster House for help accessing your account."
      : "Online password resets are currently unavailable. Contact Aster House for help resetting your password.";
  });
  form.querySelector("fieldset").disabled = false;
}
