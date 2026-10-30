const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    navLinks.classList.toggle("is-open", !isExpanded);
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      navLinks.classList.remove("is-open");
    }
  });
}

const availabilityForm = document.querySelector("#availability-form");
const bookingPageForm = document.querySelector("#booking-page-form");
const eventBookingForm = document.querySelector("#event-booking-form");
const contactForm = document.querySelector("#contact-form");
const diningForm = document.querySelector("#dining-form");
const spaForm = document.querySelector("#spa-form");

function localDateString(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function connectDateRange(form, arrivalName, departureName, feedbackElement, onValidSubmit) {
  const arrival = form.elements[arrivalName];
  const departure = form.elements[departureName];
  const localToday = localDateString();

  arrival.min = localToday;
  departure.min = localToday;
  arrival.addEventListener("change", () => {
    departure.min = arrival.value || localToday;
    if (departure.value && departure.value <= arrival.value) departure.value = "";
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (departure.value <= arrival.value) {
      feedbackElement.textContent = "Choose a departure date after your arrival.";
      departure.focus();
      return;
    }
    if (onValidSubmit) {
      onValidSubmit();
      return;
    }
    feedbackElement.textContent = "Your dates are saved. Connect this form to a booking engine to check live availability.";
  });
}

function updateStayLength() {
  if (!bookingPageForm) return;
  const arrival = bookingPageForm.elements.arrival.value;
  const departure = bookingPageForm.elements.departure.value;
  const output = document.querySelector("#stay-length");
  if (!arrival || !departure || departure <= arrival) {
    output.textContent = "Length of stay: choose your dates";
    return;
  }
  const nights = (Date.parse(`${departure}T00:00:00Z`) - Date.parse(`${arrival}T00:00:00Z`)) / 86400000;
  output.textContent = `Length of stay: ${nights} ${nights === 1 ? "night" : "nights"}`;
}

if (availabilityForm) {
  connectDateRange(
    availabilityForm,
    "arrival",
    "departure",
    document.querySelector("#booking-feedback"),
  );
}

if (bookingPageForm) {
  const feedback = document.querySelector("#booking-page-feedback");
  connectDateRange(
    bookingPageForm,
    "arrival",
    "departure",
    feedback,
    () => {
      const { room, rooms, adults, children, arrival, departure } = bookingPageForm.elements;
      const nights = (Date.parse(`${departure.value}T00:00:00Z`) - Date.parse(`${arrival.value}T00:00:00Z`)) / 86400000;
      feedback.textContent = `${room.value} requested for ${nights} ${nights === 1 ? "night" : "nights"}, ${rooms.value} ${rooms.value === "1" ? "room" : "rooms"}, ${adults.value} ${adults.value === "1" ? "adult" : "adults"}, and ${children.value} ${children.value === "1" ? "child" : "children"}. Connect this form to your booking service to confirm availability.`;
    },
  );
  bookingPageForm.elements.arrival.addEventListener("change", updateStayLength);
  bookingPageForm.elements.departure.addEventListener("change", updateStayLength);
}

function connectRequestForm(form, response) {
  if (!form) return;
  const dateField = form.querySelector('input[type="date"]');
  if (dateField) dateField.min = localDateString();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    response(form);
    form.reset();
  });
}

if (eventBookingForm) {
  const eventDate = eventBookingForm.elements.eventDate;
  eventDate.min = localDateString();
  eventBookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!eventBookingForm.reportValidity()) return;
    const feedback = document.querySelector("#event-booking-feedback");
    const occasion = eventBookingForm.elements.eventType.value;
    const guests = eventBookingForm.elements.eventGuests.value;
    const date = new Date(`${eventDate.value}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    feedback.textContent = `Thanks for sharing your ${occasion.toLowerCase()} plans for ${date} and ${guests} guests. This enquiry form is ready to connect to your events team.`;
    eventBookingForm.reset();
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    document.querySelector("#contact-feedback").textContent =
      "Thanks for getting in touch. Connect this form to your email or guest-messaging service to receive enquiries.";
    contactForm.reset();
  });
}

connectRequestForm(
  diningForm,
  (form) => {
    const feedback = document.querySelector("#dining-feedback");
    const date = new Date(`${form.elements.diningDate.value}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    feedback.textContent = `Thanks, ${form.elements.diningName.value}. Your table request for ${date} at ${form.elements.diningTime.value} is ready for our team to confirm.`;
  },
);

connectRequestForm(
  spaForm,
  (form) => {
    const feedback = document.querySelector("#spa-feedback");
    const date = new Date(`${form.elements.spaDate.value}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    feedback.textContent = `Thanks, ${form.elements.spaName.value}. Your ${form.elements.spaTreatment.value.toLowerCase()} request for ${date} is ready for our spa team to confirm.`;
  },
);
